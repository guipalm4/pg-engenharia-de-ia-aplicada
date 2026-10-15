'use strict';

/**
 * Agente de consulta do Anotaí (Missão #02): responde a uma pergunta aberta do dono sobre os
 * próprios gastos, com loop ReAct e uma única ferramenta de leitura, `total_gasto`.
 *
 * Calibragem (entrega/README.md, Passo 1):
 *   memória   curto prazo, só dentro da pergunta (o histórico do loop)
 *   loop      até 6 chamadas de ferramenta por pergunta (RN-32)
 *   reflexão  superfície, feita pelo código: o bloco Números usados vem das ferramentas
 *   ferramenta total_gasto, leitura, sem Approval Gate
 *
 * Uso: OPENROUTER_API_KEY=... node agente-consulta.js
 */

const { chat } = require('./openrouter');
const { HOJE, CATEGORIAS, CARTOES, ITENS } = require('./dados');

const MODELO_AGENTE = 'google/gemini-3.5-flash-lite';
const MAX_CHAMADAS_FERRAMENTA = 6; // RN-32

const PERGUNTAS = ['quanto gastei com Uber em julho, agosto e setembro?'];

const EIXOS = ['essencial', 'nao_essencial', 'a_classificar'];
const MEIOS = ['debito', 'credito', 'pix', 'dinheiro'];

// Schema do Passo 2. Os enum de categoria e cartão vêm do cadastro, nunca de texto livre:
// o modelo só escolhe entre o que existe.
const TOOL_TOTAL_GASTO = {
  type: 'function',
  function: {
    name: 'total_gasto',
    description:
      'Soma o que o dono gastou num período, por data de competência, com filtros opcionais. ' +
      'Use para qualquer pergunta de quanto foi gasto num mês, numa categoria, num estabelecimento, ' +
      'num eixo ou num meio de pagamento. Não use para limite de cartão, tetos ou faturas.',
    parameters: {
      type: 'object',
      properties: {
        data_inicio: { type: 'string', format: 'date', description: 'primeiro dia, AAAA-MM-DD' },
        data_fim: { type: 'string', format: 'date', description: 'último dia, inclusive, AAAA-MM-DD' },
        categoria: { type: 'string', enum: CATEGORIAS.map((c) => c.nome) },
        estabelecimento: { type: 'string', description: 'comparado sem acento e sem diferença de maiúsculas' },
        eixo: { type: 'string', enum: EIXOS },
        meio_pagamento: { type: 'string', enum: MEIOS },
        cartao_apelido: { type: 'string', enum: CARTOES },
      },
      required: ['data_inicio', 'data_fim'],
    },
  },
};

const normalizar = (t) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
const reais = (centavos) => (centavos / 100).toFixed(2);
const DATA = /^\d{4}-\d{2}-\d{2}$/;

// Execução real da ferramenta: determinística, só lê. O modelo propõe os parâmetros; o código
// confere cada um antes de usar. Parâmetro inválido vira observação de erro, não exceção.
function totalGasto(args) {
  const { data_inicio, data_fim, categoria, estabelecimento, eixo, meio_pagamento, cartao_apelido } = args || {};
  if (!DATA.test(data_inicio || '') || !DATA.test(data_fim || '')) return { erro: 'data_inicio e data_fim precisam ser AAAA-MM-DD' };
  if (categoria && !CATEGORIAS.some((c) => c.nome === categoria)) return { erro: `categoria fora do cadastro: ${categoria}` };
  if (eixo && !EIXOS.includes(eixo)) return { erro: `eixo inválido: ${eixo}` };
  if (meio_pagamento && !MEIOS.includes(meio_pagamento)) return { erro: `meio_pagamento inválido: ${meio_pagamento}` };
  if (cartao_apelido && !CARTOES.includes(cartao_apelido)) return { erro: `cartão fora do cadastro: ${cartao_apelido}` };

  const essencialDe = (nome) => CATEGORIAS.find((c) => c.nome === nome)?.essencial;
  const itens = ITENS.filter(
    (i) =>
      i.data >= data_inicio &&
      i.data <= data_fim &&
      (!categoria || i.categoria === categoria) &&
      (!estabelecimento || normalizar(i.estabelecimento).includes(normalizar(estabelecimento))) &&
      (!eixo || (eixo === 'essencial') === essencialDe(i.categoria)) &&
      (!meio_pagamento || i.meio === meio_pagamento) &&
      (!cartao_apelido || i.cartao === cartao_apelido)
  );
  const centavos = itens.reduce((s, i) => s + i.centavos, 0);
  const filtros = Object.fromEntries(
    Object.entries({ categoria, estabelecimento, eixo, meio_pagamento, cartao_apelido }).filter(([, v]) => v)
  );
  return { total: reais(centavos), quantidade_itens: itens.length, periodo: { inicio: data_inicio, fim: data_fim }, filtros };
}

const SISTEMA =
  `Você é o agente de consulta do Anotaí, um controle de finanças pessoais. Hoje é ${HOJE}. ` +
  'Responda em português, curto, só com números que vieram da ferramenta total_gasto. ' +
  'Valores em reais. Se a ferramenta não responde a pergunta, diga que não sabe responder.';

async function responder(pergunta) {
  let custo = 0;
  const numerosUsados = []; // bloco montado pelo código (RN-32), não pelo modelo
  const mensagens = [
    { role: 'system', content: SISTEMA },
    { role: 'user', content: pergunta },
  ];
  console.log(`\n[Agente:consulta] Pergunta: "${pergunta}"`);

  let chamadas = 0;
  for (let volta = 1; ; volta++) {
    const { mensagem, usage } = await chat({ modelo: MODELO_AGENTE, mensagens, tools: [TOOL_TOTAL_GASTO] });
    custo += usage.cost || 0;
    const pedidos = mensagem.tool_calls || [];

    if (pedidos.length === 0) {
      console.log(`[Loop] volta ${volta}: resposta final, depois de ${chamadas} chamada(s) de ferramenta`);
      console.log(`[Agente:consulta] Resposta: ${mensagem.content}`);
      console.log('[Números usados]');
      for (const n of numerosUsados) console.log(`  ${n}`);
      return custo;
    }

    mensagens.push(mensagem);
    for (const pedido of pedidos) {
      // Critério de parada no código, nunca no modelo: a 7ª chamada não executa.
      if (chamadas >= MAX_CHAMADAS_FERRAMENTA) {
        console.log(`[Loop] limite de ${MAX_CHAMADAS_FERRAMENTA} chamadas de ferramenta atingido sem resposta`);
        console.log('[Agente:consulta] Resposta: Não consegui responder a essa pergunta. Tente /mes, /tetos ou /limite.');
        return custo;
      }
      chamadas++;
      let args;
      try {
        args = JSON.parse(pedido.function.arguments || '{}');
      } catch {
        args = null;
      }
      const resultado =
        pedido.function.name === 'total_gasto' ? totalGasto(args) : { erro: `ferramenta desconhecida: ${pedido.function.name}` };
      console.log(`[Loop] volta ${volta}, chamada ${chamadas}/${MAX_CHAMADAS_FERRAMENTA}: ${pedido.function.name}(${JSON.stringify(args)})`);
      console.log(`[Ferramenta] → ${JSON.stringify(resultado)}`);
      if (!resultado.erro) numerosUsados.push(`total_gasto ${JSON.stringify(args)} → R$ ${resultado.total}`);
      mensagens.push({ role: 'tool', tool_call_id: pedido.id, content: JSON.stringify(resultado) });
    }
  }
}

async function main() {
  console.log(`[Config] modelo=${MODELO_AGENTE} · limite=${MAX_CHAMADAS_FERRAMENTA} chamadas de ferramenta · base sintética`);
  let custo = 0;
  for (const p of PERGUNTAS) custo += await responder(p);
  console.log(`\n[Custo] total: US$ ${custo.toFixed(6)}`);
}

main().catch((erro) => {
  console.error(`[Erro] ${erro.message}`);
  process.exit(1);
});
