'use strict';

/**
 * Gateway do Anotaí (Missão #04): Intent-Based Routing, Model Router, Semantic Cache e Approval Gate
 * sobre as mensagens de texto do dono, com trilha de auditoria em JSONL.
 *
 * Ordem das decisões (entrega, Passo 1):
 *   1. comando (/mes, /tetos, /limite) → regra, sem modelo
 *   2. Semantic Cache: só interpretações de consulta fixa; o número é recalculado no hit
 *   3. Model Router pelo TIPO de entrada (a intenção só existe depois da chamada)
 *   4. extrator → validação (RN-30) → roteamento pela intenção
 *   5. Approval Gate: obrigatório em operação (RN-23); por confiança baixa quando o extrator não
 *      distingue total de parcela (RN-2)
 *
 * Uso: printf 's\nt\n' | node gateway.js
 */

const fs = require('node:fs');
const path = require('node:path');
const { chat, embed } = require('./openrouter');
const { cosseno } = require('./similaridade');
const { HOJE, CATEGORIAS, CARTOES, ITENS_DO_MES } = require('./dados');

const MODELO_BARATO = 'google/gemini-3.5-flash-lite'; // texto e áudio
const MODELO_FOTO = 'google/gemini-3.8-flash'; // foto: declarado no router, fora desta demonstração
const MODELO_EMBEDDING = 'openai/text-embedding-3-small';

// Medido em outputs/calibra-limiar-01.md: o maior par "diferente" ficou em 0,901 ("esse mês" ×
// "mês passado") e só a paráfrase quase literal passou dele (0,951). O corte fica no meio.
const LIMIAR_CACHE = 0.93;

const TRILHA = process.env.AUDIT_TRAIL || path.join(__dirname, '..', 'outputs', 'audit-trail.jsonl');

const MENSAGENS = [
  'quanto já gastei esse mês?',
  'quanto eu gastei neste mês?',
  'paguei a fatura do Nubank, 2 mil',
  'parcelei o celular em 10, deu 900',
];

// Sem TTY, lê o stdin inteiro ANTES do primeiro await (o readline perde respostas de pipe).
const respostas = process.stdin.isTTY ? [] : fs.readFileSync(0, 'utf-8').split('\n').map((l) => l.trim()).filter(Boolean);
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

async function extrair(texto) {
  const { mensagem, usage } = await chat({
    modelo: MODELO_BARATO,
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

// ---------- Pipeline do Gateway ----------
async function processar(texto) {
  const registro = { mensagem: texto, cache: null, modelo: null, intencao: null, gate: null, status_final: null };
  console.log(`\n[Gateway] Mensagem: "${texto}"`);

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

  // Model Router pelo tipo de entrada: aqui, sempre texto.
  registro.modelo = MODELO_BARATO;
  console.log(`[Model Router] texto → ${MODELO_BARATO} (barato)`);
  const proposta = await extrair(texto);
  registro.intencao = proposta.intencao;
  console.log(`[Extrator] ${JSON.stringify(proposta)}`);

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
        console.log(`[Confiança] valor_informado_e="${g.valor_informado_e}" do modelo, mas a fala não casa com "Nx de V" nem com "V em Nx" → incerto (marcado pelo ${incertoPor})`);
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

async function main() {
  console.log(`[Config] barato=${MODELO_BARATO} · foto=${MODELO_FOTO} · embedding=${MODELO_EMBEDDING} · limiar_cache=${LIMIAR_CACHE}`);
  fs.mkdirSync(path.dirname(TRILHA), { recursive: true });
  for (const texto of MENSAGENS) {
    const registro = await processar(texto);
    fs.appendFileSync(TRILHA, JSON.stringify({ ts: new Date().toISOString(), ...registro }) + '\n');
    console.log(`[Audit Trail] status_final: ${registro.status_final}`);
  }
  console.log(`\n[Custo] total: US$ ${custo.toFixed(6)}`);
}

main().catch((e) => {
  console.error(`[Erro] ${e.message}`);
  process.exit(1);
});
