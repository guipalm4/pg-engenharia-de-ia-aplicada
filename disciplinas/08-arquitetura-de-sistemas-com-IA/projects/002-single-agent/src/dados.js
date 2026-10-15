'use strict';

// Base de referência SINTÉTICA. O Anotaí ainda não tem dado real, e dado financeiro real do
// dono não entra em repositório público (PRD §9). Os nomes seguem o glossário do PRD (§6):
// Categoria elegível com o eixo essencial, Cartao por apelido, Despesa com seus ItemDespesa.
// Valores em centavos: dinheiro nunca é ponto flutuante.

const HOJE = '2026-10-15';

const CATEGORIAS = [
  { nome: 'Mercado', essencial: true },
  { nome: 'Transporte › Aplicativo', essencial: true },
  { nome: 'Restaurante › Refeição de trabalho', essencial: true },
  { nome: 'Restaurante › Lazer', essencial: false },
  { nome: 'Assinaturas', essencial: false },
];

const CARTOES = ['Nubank', 'Inter'];

// Uma linha por ItemDespesa de Despesa registrada (status apagada fica de fora).
const ITENS = [
  { data: '2026-07-03', estabelecimento: 'Uber', categoria: 'Transporte › Aplicativo', meio: 'credito', cartao: 'Nubank', centavos: 2390 },
  { data: '2026-07-19', estabelecimento: 'Uber', categoria: 'Transporte › Aplicativo', meio: 'credito', cartao: 'Nubank', centavos: 4180 },
  { data: '2026-07-21', estabelecimento: 'Pão de Açúcar', categoria: 'Mercado', meio: 'debito', cartao: null, centavos: 31245 },
  { data: '2026-08-08', estabelecimento: 'Uber', categoria: 'Transporte › Aplicativo', meio: 'pix', cartao: null, centavos: 1875 },
  { data: '2026-08-14', estabelecimento: 'Outback', categoria: 'Restaurante › Lazer', meio: 'credito', cartao: 'Inter', centavos: 18900 },
  { data: '2026-08-30', estabelecimento: 'Pão de Açúcar', categoria: 'Mercado', meio: 'debito', cartao: null, centavos: 27810 },
  { data: '2026-09-02', estabelecimento: 'Uber', categoria: 'Transporte › Aplicativo', meio: 'credito', cartao: 'Nubank', centavos: 3260 },
  { data: '2026-09-17', estabelecimento: 'Uber', categoria: 'Transporte › Aplicativo', meio: 'credito', cartao: 'Nubank', centavos: 2745 },
  { data: '2026-09-18', estabelecimento: 'Restaurante da firma', categoria: 'Restaurante › Refeição de trabalho', meio: 'debito', cartao: null, centavos: 3500 },
  { data: '2026-09-25', estabelecimento: 'Netflix', categoria: 'Assinaturas', meio: 'credito', cartao: 'Inter', centavos: 4490 },
  { data: '2026-10-04', estabelecimento: 'Uber', categoria: 'Transporte › Aplicativo', meio: 'credito', cartao: 'Nubank', centavos: 2110 },
];

module.exports = { HOJE, CATEGORIAS, CARTOES, ITENS };
