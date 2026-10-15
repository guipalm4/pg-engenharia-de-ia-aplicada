'use strict';

// Base de referência SINTÉTICA (o Anotaí ainda não tem dado real, e dado financeiro real não entra
// em repositório público, PRD §9). Termos do glossário do PRD §6. Valores em centavos.

const HOJE = '2026-10-15';

const CATEGORIAS = [
  { nome: 'Mercado', essencial: true },
  { nome: 'Transporte › Aplicativo', essencial: true },
  { nome: 'Restaurante › Lazer', essencial: false },
  { nome: 'Eletrônicos', essencial: false },
  { nome: 'Assinaturas', essencial: false },
];

const CARTOES = ['Nubank', 'Inter'];

// ItemDespesa registrados no mês corrente; null em categoria = A classificar (RN-28).
const ITENS_DO_MES = [
  { data: '2026-10-02', descricao: 'Pão de Açúcar', categoria: 'Mercado', centavos: 28740 },
  { data: '2026-10-04', descricao: 'Uber', categoria: 'Transporte › Aplicativo', centavos: 2110 },
  { data: '2026-10-09', descricao: 'Outback', categoria: 'Restaurante › Lazer', centavos: 16350 },
  { data: '2026-10-11', descricao: 'Netflix', categoria: 'Assinaturas', centavos: 4490 },
  { data: '2026-10-13', descricao: 'farmácia', categoria: null, centavos: 3820 },
];

module.exports = { HOJE, CATEGORIAS, CARTOES, ITENS_DO_MES };
