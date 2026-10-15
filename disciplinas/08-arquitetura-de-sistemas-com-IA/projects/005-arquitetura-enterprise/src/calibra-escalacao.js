'use strict';

/**
 * Calibração do limiar de escalação da cascata (Missão #05, Passo 2). Roda só o Tier 1 sobre as três
 * perguntas da entrega e imprime a pontuação que o código dá a cada resposta. NÃO escolhe o limiar.
 */

const { extrair, pontuar, MODELO_BARATO, custoAcumulado } = require('./gateway');

const PERGUNTAS = [
  ['paguei 43 e noventa no mercado agora', 'simples', 'bastou'],
  ['parcelei o celular em 10, deu 900', 'ambígua', 'duvidoso'],
  ['me lembra de ligar pro dentista amanhã', 'fora do domínio', 'duvidoso'],
];

async function main() {
  console.log(`[Calibração] Tier 1=${MODELO_BARATO} · ${PERGUNTAS.length} perguntas`);
  const linhas = [];
  for (const [texto, tipo, esperado] of PERGUNTAS) {
    const proposta = await extrair(texto);
    console.log(`[Extrator] "${texto}" → ${JSON.stringify(proposta)}`);
    linhas.push(`| ${texto} | ${tipo} | ${esperado} | ${pontuar(proposta, texto).toFixed(3)} |`);
  }
  console.log('| Pergunta | Tipo | Esperado | Pontuação do Tier 1 |');
  console.log('|---|---|---|---|');
  linhas.forEach((l) => console.log(l));
  console.log(`[Custo] total: US$ ${custoAcumulado().toFixed(6)}`);
}

main().catch((e) => {
  console.error(`[Erro] ${e.message}`);
  process.exit(1);
});
