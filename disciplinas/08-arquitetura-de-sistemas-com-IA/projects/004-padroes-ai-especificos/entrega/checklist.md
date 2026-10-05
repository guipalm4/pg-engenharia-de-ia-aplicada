# Checklist — Missão #04

> Extraída de `material/Atividade 4 - Módulo 4.pdf`. Não há níveis de rubrica nesta disciplina.

## Entrega (texto do enunciado)

> Um único arquivo ou repositório contendo: o blueprint preenchido (Passo 1), o limiar calibrado com
> a evidência que justifica esse valor (Passo 2), e o log da execução do protótipo mostrando os
> quatro casos (Passo 3).

## Itens verificáveis

| # | Passo | Item | Dono |
|---|---|---|---|
| 1 | Passo 1 | tarefa que envolve responder perguntas ou processar requisições repetidas | você |
| 2 | Passo 1 | RAG: qual dos quatro padrões (Basic, Hybrid Search, Multi-Index, Agentic) e por qual sintoma real | você |
| 3 | Passo 1 | Intent-Based Routing: intenções e para onde cada uma é roteada | você |
| 4 | Passo 1 | Model Router: modelo barato ou caro por intenção, e por quê | você |
| 5 | Passo 1 | Semantic Cache: o que é cacheável e o que nunca deve usar cache | você |
| 6 | Passo 1 | Approval Gate: o que justifica escalar para revisão humana | você |
| 7 | Passo 2 | pares de pergunta parecida e pergunta diferente, do domínio do caso | você |
| 8 | Passo 2 | modelo de embedding escolhido | você |
| 9 | Passo 2 | similaridades medidas (evidência) | execução |
| 10 | Passo 2 | limiar escolhido a partir da medição | você |
| 11 | Passo 3 | Gateway em JavaScript rodando localmente | código |
| 12 | Passo 3 | log: cache miss | execução |
| 13 | Passo 3 | log: cache hit | execução |
| 14 | Passo 3 | log: Approval Gate por síntese obrigatória | execução |
| 15 | Passo 3 | log: Approval Gate por confiança baixa | execução |

## Proibições do enunciado

- Repetir o exemplo do TrialForge ou o da central de atendimento do vídeo.
- Copiar os números do TrialForge: `0,825 / 0,667 / 0,643 / limiar 0,75` (específicos do
  `nomic-embed-text` em português).
- Assumir um limiar sem testar.
