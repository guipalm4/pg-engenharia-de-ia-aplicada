# Caso da disciplina 08

Os cinco enunciados pedem *"uma tarefa real do seu próprio contexto de trabalho (não um exemplo
hipotético)"* e proíbem repetir o TrialForge. Este arquivo é esse contexto: **um projeto pessoal
real**, o mesmo nos cinco módulos. Todos os commands `/arq-*` o leem antes de qualquer coisa.

Por que projeto pessoal e não o trabalho: o repositório é público, e a missão descreve arquitetura,
volumes e custos. Com um projeto seu, o caso é real sem expor o empregador.

> Enquanto houver `<!-- PREENCHER -->` nas seções 1 a 3, nenhum Passo de nenhuma Missão pode ser
> decidido: o caso não se inventa.

---

## 1. O projeto

| Campo | Valor |
|---|---|
| Nome | <!-- PREENCHER --> |
| Repositório local | <!-- PREENCHER: caminho absoluto, se existir; os commands podem ler o código para ancorar o caso --> |
| O que faz, em uma frase | <!-- PREENCHER --> |
| Quem usa | <!-- PREENCHER: perfis e volume aproximado --> |
| Stack | <!-- PREENCHER --> |

## 2. O processo que vira o caso

O fluxo concreto que a arquitetura AI-first vai atender. Precisa ter, ao mesmo tempo:

- uma parte **repetitiva**, que vira regra ou cache (M1, M4);
- uma parte **ambígua**, que pede um modelo (M1, M2);
- **mais de um ator** que precisa concordar sobre o mesmo estado (M3);
- perguntas **repetidas com palavras diferentes** e um **erro caro e irreversível** (M4, M5).

<!-- PREENCHER: 1 a 2 parágrafos. Como o processo funciona hoje (manual ou com IA), quem participa,
onde está o gargalo, o que custa um erro. -->

## 3. Restrições reais

| Restrição | Valor |
|---|---|
| Dado sensível envolvido | <!-- PREENCHER: nenhum / PII / financeiro / ... --> |
| Custo de um erro | <!-- PREENCHER --> |
| Volume de requisições | <!-- PREENCHER: ordem de grandeza por dia --> |
| Orçamento mensal de IA aceitável | <!-- PREENCHER: US$ --> |

## 4. Engine

**OpenRouter**: chat e embeddings pela mesma chave (`OPENROUTER_API_KEY`), chamados com `fetch`
nativo do Node, sem SDK. Toda resposta traz `usage.cost` em US$. Os modelos são decisão de cada
módulo e ficam registrados na seção 5.

## 5. Estado acumulado

O que cada módulo decidiu e o módulo seguinte herda. Uma linha por decisão, escrita pelo
`/arq-entrega` a partir da entrega. **Não é lugar de análise**, só do que foi decidido.

| Módulo | Decisão herdável |
|---|---|
| 001 | — |
| 002 | — |
| 003 | — |
| 004 | — |
| 005 | — |
