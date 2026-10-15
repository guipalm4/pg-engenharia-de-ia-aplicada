'use strict';

/**
 * Calibração do limiar do Semantic Cache (Missão #04, Passo 2). Embeda os pares da entrega e
 * imprime a similaridade de cada um. NÃO escolhe o limiar: quem escolhe é a entrega, olhando a
 * tabela, com folga entre o maior "diferente" e o menor "parecida".
 */

const { embed } = require('./openrouter');
const { cosseno } = require('./similaridade');

const MODELO_EMBEDDING = 'openai/text-embedding-3-small';

const PARES = [
  ['quanto já gastei esse mês?', 'quanto eu gastei neste mês?', 'parecida'],
  ['quanto já gastei esse mês?', 'qual meu total de gastos em outubro até agora?', 'parecida'],
  ['qual o limite disponível do Nubank?', 'quanto ainda tenho de limite no cartão Nubank?', 'parecida'],
  ['como estão meus tetos?', 'quanto falta para estourar os tetos das categorias?', 'parecida'],
  ['quanto já gastei esse mês?', 'quanto gastei mês passado?', 'diferente'],
  ['quanto gastei no mercado esse mês?', 'gastei 50 no mercado hoje', 'diferente'],
  ['qual o limite disponível do Nubank?', 'paguei a fatura do Nubank, 2 mil', 'diferente'],
  ['quanto já gastei esse mês?', 'quanto gastei com Uber em julho, agosto e setembro?', 'diferente'],
];

async function main() {
  const textos = [...new Set(PARES.flatMap(([a, b]) => [a, b]))];
  const { vetores, usage } = await embed({ modelo: MODELO_EMBEDDING, textos });
  const vetor = Object.fromEntries(textos.map((t, i) => [t, vetores[i]]));

  console.log(`[Calibração] modelo=${MODELO_EMBEDDING} · ${PARES.length} pares · ${textos.length} textos`);
  console.log('| Par | Esperado | Similaridade |');
  console.log('|---|---|---|');
  const grupos = { parecida: [], diferente: [] };
  PARES.forEach(([a, b, esperado], i) => {
    const s = cosseno(vetor[a], vetor[b]);
    grupos[esperado].push(s);
    console.log(`| ${i + 1} | ${esperado} | ${s.toFixed(3)} |`);
  });
  console.log(`[Calibração] parecidas: mín ${Math.min(...grupos.parecida).toFixed(3)} · máx ${Math.max(...grupos.parecida).toFixed(3)}`);
  console.log(`[Calibração] diferentes: mín ${Math.min(...grupos.diferente).toFixed(3)} · máx ${Math.max(...grupos.diferente).toFixed(3)}`);
  console.log(`[Custo] total: US$ ${(usage.cost || 0).toFixed(6)}`);
}

main().catch((e) => {
  console.error(`[Erro] ${e.message}`);
  process.exit(1);
});
