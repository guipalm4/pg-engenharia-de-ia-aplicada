'use strict';

/**
 * Gateway do Anotaí (Missão #04): Intent-Based Routing, Model Router, Semantic Cache e Approval Gate
 * sobre as mensagens de texto do dono, com trilha de auditoria em JSONL.
 *
 * Missão #05 estende: tenant em toda requisição, orçamento do tenant checado ANTES de qualquer chamada
 * de modelo (embedding incluído), cascata Tier 1 → Tier 2 decidida por um sinal calculado pelo código,
 * e regra fixa fora da cascata para operação (erro caro e irreversível).
 *
 * Ordem das decisões (entrega, Passo 1):
 *   1. comando (/mes, /tetos, /limite) → regra, sem modelo
 *   2. Semantic Cache: só interpretações de consulta fixa; o número é recalculado no hit
 *   3. Model Router pelo TIPO de entrada (a intenção só existe depois da chamada)
 *   4. extrator → validação (RN-30) → roteamento pela intenção
 *   5. Approval Gate: obrigatório em operação (RN-23); por confiança baixa quando o extrator não
 *      distingue total de parcela (RN-2)
 *
 * Uso: printf 't\n' | node gateway.js
 */

const fs = require('node:fs');
const path = require('node:path');
const { chat, embed } = require('./openrouter');
const { cosseno } = require('./similaridade');
const { HOJE, CATEGORIAS, CARTOES, ITENS_DO_MES } = require('./dados');

const MODELO_BARATO = 'google/gemini-3.5-flash-lite'; // texto e áudio
const MODELO_FOTO = 'google/gemini-3.8-flash'; // foto: declarado no router, fora desta demonstração
const MODELO_EMBEDDING = 'openai/text-embedding-3-small';
const MODELO_TIER2 = 'google/gemini-3.8-flash'; // só se o Tier 1 não convencer

// Medido em outputs/calibra-escalacao-01.md: simples 1,000 · ambígua 0,667 · fora do domínio 0,000.
// O corte fica entre 0,667 e 1,000, com folga para os dois lados: qualquer checagem que falha escala.
const LIMIAR_ESCALACAO = 0.85;

// Custo máximo por requisição, usado na checagem ANTES da chamada: cerca de 2x o medido em
// outputs/gateway-01.md (Tier 1 ≈ US$ 0,00035; Tier 2 ≈ US$ 0,0057, que a primeira estimativa,
// US$ 0,0015, subestimava em quase 4x).
const CUSTO_MAX_USD = { embedding: 0.00001, tier1: 0.0007, tier2: 0.012 };

// Tenant = user_id. A v1 tem um só (o dono); "convidado" é o cenário de assinatura do PRD §1, que a
// v1 não constrói, e está aqui só para mostrar o bloqueio. Limite = 85% do teto de R$ 20 (fatia dos
// extratores + reserva dos lançamentos, PRD §9), à cotação arbitrada de R$ 5,50 por US$.
const COTACAO_BRL_POR_USD = 5.5;
const LIMITE_LANCAMENTOS_USD = +((20 * 0.85) / COTACAO_BRL_POR_USD).toFixed(4);
const TENANTS = {
  dono: { limite_usd: LIMITE_LANCAMENTOS_USD, gasto_acumulado_usd: 0 },
  convidado: { limite_usd: LIMITE_LANCAMENTOS_USD, gasto_acumulado_usd: LIMITE_LANCAMENTOS_USD },
};

// Medido em outputs/calibra-limiar-01.md: o maior par "diferente" ficou em 0,901 ("esse mês" ×
// "mês passado") e só a paráfrase quase literal passou dele (0,951). O corte fica no meio.
const LIMIAR_CACHE = 0.93;

const TRILHA = process.env.AUDIT_TRAIL || path.join(__dirname, '..', 'outputs', 'audit-trail.jsonl');

const MENSAGENS = [
  { tenant: 'dono', texto: 'paguei 43 e noventa no mercado agora' },
  { tenant: 'dono', texto: 'parcelei o celular em 10, deu 900' },
  { tenant: 'convidado', texto: 'paguei 30 na padaria' },
];

// Sem TTY, lê o stdin inteiro ANTES do primeiro await (o readline perde respostas de pipe). Lido em
// main(), para que calibra-escalacao.js possa importar o extrator sem consumir stdin.
let respostas = [];
const perguntar = (texto) => {
  const r = respostas.shift() || '';
  console.log(`[Approval Gate] ${texto} → dono respondeu "${r}"`);
  return r;
};

const INTENCOES = ['lancar_despesa', 'pagar_fatura', 'estornar', 'quitar_parcelamento', 'registrar_receita', 'consultar', 'desconhecida'];
const OPERACOES = ['pagar_fatura', 'estornar', 'quitar_parcelamento', 'registrar_receita'];
const TIPOS_CONSULTA = ['mes', 'tetos', 'limite', 'aberta'];

let custo = 0;
const cache = []; // { texto, embedding, tipo }

const reais = (c) => `R$ ${(c / 100).toFixed(2).replace('.', ',')}`;

// ---------- Respostas por regra: o número sempre vem do código, nunca do modelo ----------
function responderConsulta(tipo) {
  if (tipo !== 'mes') return `consulta ${tipo}: respondida por regra (fora desta demonstração)`;
  const soma = (f) => ITENS_DO_MES.filter(f).reduce((s, i) => s + i.centavos, 0);
  const eixo = (nome) => CATEGORIAS.find((c) => c.nome === nome)?.essencial;
  return (
    `outubro até ${HOJE}: essencial ${reais(soma((i) => i.categoria && eixo(i.categoria)))} · ` +
    `não essencial ${reais(soma((i) => i.categoria && !eixo(i.categoria)))} · ` +
    `a classificar ${reais(soma((i) => !i.categoria))}`
  );
}

// ---------- Extrator: uma chamada, contrato JSON fechado (subconjunto do PRD §10) ----------
const SISTEMA_EXTRATOR =
  `Você é o extrator do Anotaí, um controle de finanças pessoais. Hoje é ${HOJE}. ` +
  'Leia a mensagem do dono e devolva só um objeto JSON com: ' +
  `"intencao" (um de ${INTENCOES.join(', ')}); ` +
  '"gastos" (lista, só em lancar_despesa: {"valor": número ou null, "parcelas": número ou null, ' +
  '"valor_informado_e": "total", "parcela" ou null, "descricao", "estabelecimento" ou null, ' +
  `"categoria" (uma de: ${CATEGORIAS.map((c) => c.nome).join('; ')}), "campos_incertos": lista de nomes de campos}); ` +
  `"operacao" (só em operações: {"cartao_apelido" (um de ${CARTOES.join(', ')}), "valor"}); ` +
  '"consulta" (só em consultar: {"tipo": "mes" para o total do mês corrente, "tetos", "limite" ou "aberta" para qualquer outra pergunta}). ' +
  'Parcelas: "10x de 300" é valor 300 e valor_informado_e "parcela"; "3 mil em 10x" é valor 3000 e "total". ' +
  'Se a fala não deixa claro se o valor é o total ou a parcela, valor_informado_e é null. Não invente valores.';

// Validação do código para total × parcela (RN-30: incerto é a união do que o modelo marca com o que
// o código marca). Os dois padrões da RN-2: "10x de 300" é parcela; "3 mil em 10x" é total. Fala com
// parcelas que não casa com nenhum dos dois é ambígua, diga o modelo o que disser. Medido em
// gateway-01 e gateway-02: o modelo devolveu "total" sem marcar incerto nas duas frases ambíguas.
const PARCELA_DITA = /\d+\s*(x|vezes)\s+de\s+\d/i;
const TOTAL_DITO = /\d[\d.,]*\s*(mil|reais)?\s+em\s+\d+\s*(x|vezes)/i;
const totalOuParcelaAmbiguo = (texto) => !PARCELA_DITA.test(texto) && !TOTAL_DITO.test(texto);

async function extrair(texto, modelo = MODELO_BARATO) {
  const { mensagem, usage } = await chat({
    modelo,
    mensagens: [
      { role: 'system', content: SISTEMA_EXTRATOR },
      { role: 'user', content: texto },
    ],
    extra: { response_format: { type: 'json_object' } },
  });
  custo += usage.cost || 0;
  const proposta = JSON.parse(mensagem.content);
  // Validação de contrato (RN-30): fora do vocabulário vira desconhecida, nunca efeito.
  if (!INTENCOES.includes(proposta.intencao)) proposta.intencao = 'desconhecida';
  if (proposta.intencao === 'consultar' && !TIPOS_CONSULTA.includes(proposta.consulta?.tipo)) proposta.consulta = { tipo: 'aberta' };
  return proposta;
}

// ---------- Sinal de escalação (FrugalGPT): pontuação da resposta, calculada pelo código ----------
// Não é a autoavaliação do modelo: no M4 ele devolveu "total" sem marcar incerto em fala ambígua.
// É a fração das checagens da RN-30 que a proposta passa. Desconhecida vale 0: nada a aplicar.
function pontuar(proposta, texto) {
  if (proposta.intencao === 'desconhecida') return 0;
  if (proposta.intencao !== 'lancar_despesa') return 1;
  let ok = 0;
  let total = 0;
  const conferir = (passou) => {
    total++;
    if (passou) ok++;
  };
  for (const g of proposta.gastos || []) {
    const incertos = g.campos_incertos || [];
    conferir(g.valor > 0 && !incertos.includes('valor'));
    conferir(CATEGORIAS.some((c) => c.nome === g.categoria) && !incertos.includes('categoria'));
    if (g.parcelas > 1) conferir(Boolean(g.valor_informado_e) && !totalOuParcelaAmbiguo(texto));
  }
  return total === 0 ? 0 : ok / total;
}

// Orçamento do tenant ANTES de qualquer chamada: depois, o dinheiro já foi gasto.
function orcamentoPermite(tenant) {
  const t = TENANTS[tenant];
  const maximo = CUSTO_MAX_USD.embedding + CUSTO_MAX_USD.tier1 + CUSTO_MAX_USD.tier2;
  return { permite: t.gasto_acumulado_usd + maximo <= t.limite_usd, maximo, ...t };
}

// ---------- Pipeline do Gateway ----------
async function processar({ tenant, texto }) {
  const registro = { tenant, mensagem: texto, cache: null, modelo: null, tier_usado: null, escalou: false, intencao: null, gate: null, status_final: null };
  console.log(`\n[Gateway] Tenant "${tenant}" — mensagem: "${texto}"`);

  const orc = orcamentoPermite(tenant);
  if (!orc.permite) {
    console.log(`[Orçamento] BLOQUEADO antes de qualquer chamada: gasto ${orc.gasto_acumulado_usd.toFixed(6)} + máximo da requisição ${orc.maximo.toFixed(6)} > limite ${orc.limite_usd.toFixed(4)} (US$)`);
    registro.status_final = 'falhou_orcamento';
    return registro;
  }

  if (texto.startsWith('/')) {
    registro.status_final = 'comando_por_regra';
    console.log('[Router] comando → regra, sem modelo');
    return registro;
  }

  // Semantic Cache: antes de qualquer chamada de chat.
  const custoAntes = custo;
  const { vetores, usage } = await embed({ modelo: MODELO_EMBEDDING, textos: [texto] });
  custo += usage.cost || 0;
  const vetor = vetores[0];
  const melhor = cache.reduce(
    (m, e) => {
      const s = cosseno(vetor, e.embedding);
      return s > m.similaridade ? { similaridade: s, entrada: e } : m;
    },
    { similaridade: 0, entrada: null }
  );
  if (melhor.entrada && melhor.similaridade >= LIMIAR_CACHE) {
    registro.cache = { resultado: 'hit', similaridade: +melhor.similaridade.toFixed(3) };
    registro.intencao = 'consultar';
    console.log(`[Semantic Cache] HIT (${melhor.similaridade.toFixed(3)} ≥ ${LIMIAR_CACHE}) com "${melhor.entrada.texto}" → consulta ${melhor.entrada.tipo}, sem chamar o extrator`);
    console.log(`[Orquestrador] ${responderConsulta(melhor.entrada.tipo)}`);
    registro.status_final = 'respondido_via_cache';
    registro.custo_usd = +(custo - custoAntes).toFixed(6);
    return registro;
  }
  registro.cache = { resultado: 'miss', similaridade: +melhor.similaridade.toFixed(3) };
  console.log(`[Semantic Cache] MISS (${melhor.similaridade.toFixed(3)} < ${LIMIAR_CACHE})`);

  // Model Router pelo tipo de entrada: aqui, sempre texto. Cascata: Tier 1 sempre primeiro.
  registro.modelo = MODELO_BARATO;
  registro.tier_usado = 1;
  console.log(`[Model Tiering] Tier 1 → ${MODELO_BARATO}`);
  let proposta = await extrair(texto);
  console.log(`[Extrator] ${JSON.stringify(proposta)}`);
  registro.pontuacao_tier1 = +pontuar(proposta, texto).toFixed(3);
  if (OPERACOES.includes(proposta.intencao)) {
    // Regra fixa, fora da cascata: operação vai ao Approval Gate qualquer que seja a pontuação.
    console.log('[Model Tiering] operação: regra fixa, fora da cascata → Approval Gate (RN-23)');
  } else if (registro.pontuacao_tier1 < LIMIAR_ESCALACAO) {
    console.log(`[Model Tiering] pontuação ${registro.pontuacao_tier1} < ${LIMIAR_ESCALACAO} → escalando para o Tier 2 (${MODELO_TIER2})`);
    proposta = await extrair(texto, MODELO_TIER2);
    console.log(`[Extrator] ${JSON.stringify(proposta)}`);
    registro.modelo = MODELO_TIER2;
    registro.tier_usado = 2;
    registro.escalou = true;
    registro.pontuacao_tier2 = +pontuar(proposta, texto).toFixed(3);
    console.log(`[Model Tiering] pontuação do Tier 2: ${registro.pontuacao_tier2}`);
  } else {
    console.log(`[Model Tiering] pontuação ${registro.pontuacao_tier1} ≥ ${LIMIAR_ESCALACAO} → Tier 1 bastou`);
  }
  registro.intencao = proposta.intencao;

  // Intent-Based Routing, depois da extração.
  if (proposta.intencao === 'consultar') {
    const tipo = proposta.consulta.tipo;
    if (tipo === 'aberta') {
      console.log('[Router] pergunta aberta → agente de consulta (RAG agêntico do M2), fora desta demonstração');
      registro.status_final = 'encaminhado_agente';
    } else {
      cache.push({ texto, embedding: vetor, tipo }); // só a interpretação vai para o cache
      console.log(`[Router] consulta ${tipo} → regra; interpretação guardada no cache`);
      console.log(`[Orquestrador] ${responderConsulta(tipo)}`);
      registro.status_final = 'respondido';
    }
  } else if (OPERACOES.includes(proposta.intencao)) {
    // Gate obrigatório: operação muda fatura e limite e o PRD não tem como desfazer (RN-23).
    registro.gate = { motivo: 'operacao_obrigatoria' };
    const r = perguntar(`${proposta.intencao} ${JSON.stringify(proposta.operacao)}: gate obrigatório (RN-23). Confirmar? (s/n)`);
    registro.gate.resposta = r;
    registro.status_final = r === 's' ? 'executado_apos_confirmar' : 'cancelado';
  } else if (proposta.intencao === 'lancar_despesa') {
    registro.status_final = 'gravado';
    for (const g of proposta.gastos || []) {
      const incertoPor = !g.valor_informado_e ? 'modelo' : totalOuParcelaAmbiguo(texto) ? 'codigo' : null;
      if (g.parcelas > 1 && incertoPor) {
        // Confiança baixa (união modelo + código, RN-30): não grava sem o dono decidir (RN-2).
        registro.gate = { motivo: 'confianca_baixa_total_ou_parcela', incerto_por: incertoPor };
        console.log(
          incertoPor === 'modelo'
            ? '[Confiança] o modelo devolveu valor_informado_e vazio → incerto (marcado pelo modelo)'
            : `[Confiança] valor_informado_e="${g.valor_informado_e}" do modelo, mas a fala não casa com "Nx de V" nem com "V em Nx" → incerto (marcado pelo código)`
        );
        const r = perguntar(`${reais(Math.round(g.valor * 100))} em ${g.parcelas}x: o extrator não distinguiu total de parcela (RN-2). Total ou parcela? (t/p)`);
        registro.gate.resposta = r;
        registro.status_final = r === 't' || r === 'p' ? 'gravado_apos_escolha' : 'pendente';
      } else {
        console.log(`[Orquestrador] grava e mostra: ${g.descricao} ${reais(Math.round((g.valor || 0) * 100))}`);
      }
    }
  } else {
    registro.status_final = 'desconhecida';
    console.log('[Router] intenção desconhecida → exemplos do que o bot faz; nada grava');
  }
  registro.custo_usd = +(custo - custoAntes).toFixed(6);
  return registro;
}

// Fecha a requisição: soma o custo real ao gasto do tenant e registra o estado do orçamento.
function contabilizar(registro) {
  const t = TENANTS[registro.tenant];
  t.gasto_acumulado_usd += registro.custo_usd || 0;
  registro.gasto_acumulado_usd = +t.gasto_acumulado_usd.toFixed(6);
  registro.limite_tenant_usd = t.limite_usd;
  console.log(`[Orçamento] tenant "${registro.tenant}": gasto acumulado ${registro.gasto_acumulado_usd.toFixed(6)} / limite ${t.limite_usd.toFixed(4)} (US$)`);
}

async function main() {
  respostas = process.stdin.isTTY ? [] : fs.readFileSync(0, 'utf-8').split('\n').map((l) => l.trim()).filter(Boolean);
  console.log(`[Config] tier1=${MODELO_BARATO} · tier2=${MODELO_TIER2} · embedding=${MODELO_EMBEDDING} · limiar_cache=${LIMIAR_CACHE} · limiar_escalacao=${LIMIAR_ESCALACAO}`);
  fs.mkdirSync(path.dirname(TRILHA), { recursive: true });
  for (const requisicao of MENSAGENS) {
    const registro = await processar(requisicao);
    contabilizar(registro);
    fs.appendFileSync(TRILHA, JSON.stringify({ ts: new Date().toISOString(), ...registro }) + '\n');
    console.log(`[Audit Trail] status_final: ${registro.status_final}`);
  }
  console.log(`\n[Custo] total: US$ ${custo.toFixed(6)}`);
}

module.exports = { extrair, pontuar, MODELO_BARATO, custoAcumulado: () => custo };

if (require.main === module) {
  main().catch((e) => {
    console.error(`[Erro] ${e.message}`);
    process.exit(1);
  });
}
