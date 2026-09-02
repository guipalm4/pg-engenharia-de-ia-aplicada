# Missão #01 — Planejamento e Escopo com IA · nível Básico

| | |
|---|---|
| Prompt V1 | [`requirements-copilot-v1.md`](../../prompts/requirements-copilot-v1.md) (v1.2, do professor) |
| Input | [`transcricao-discovery-routewise.md`](../../inputs/transcricao-discovery-routewise.md) |
| Modelo | `claude-opus-5`, subagente de contexto limpo (o material pede Gemini a 0.3; `temperature` não existe nos modelos Claude atuais) |

**Output completo da 1ª execução:** [`outputs/backlog-estruturado-v1.md`](../../outputs/backlog-estruturado-v1.md) — 9 User Stories, 4 cards de Jira, 18 perguntas em aberto.

---

## Falha 1 — Gold plating marcado e não removido

**O que o modelo gerou:** a Seção 6 lista 7 itens de gold plating, 2 deles com a ação literal *"Remover da história principal"* — a janela de deduplicação de alertas (US-01) e a janela de estabilização (US-04). Os dois continuam como critério de aceite, nas linhas 175 e 337.

**O que está errado:** o card do Jira é montado a partir da Seção 4. O time recebe dois critérios que o próprio output classificou como não pedidos pelo cliente, e vai implementar e testar os dois.

**Tipo de falha:** `[GOLD PLATING]`

**Por que aconteceu:** a instrução não é executável na ordem em que o prompt a pede. A detecção está na Seção 6 e o texto a limpar, na Seção 4, que já foi emitida. O modelo não reescreve o que passou, então "remover" vira "declarar que deveria remover". Agrava no MODO RÁPIDO, que entrega só as Seções 4, 5 e 7 — sem a Seção 6, os dois critérios seguem sem flag nenhuma.

## Falha 2 — Card gerado para história reprovada no INVEST

**O que o modelo gerou:** 7 histórias com `[INVEST-FAIL]`, mas só 5 bloqueadas. US-05 e US-07 receberam card completo, de 8 story points cada. O resumo de prontidão escreve *"5 bloqueadas"*.

**O que está errado:** a Seção 7 é a única parte feita para ser copiada sem leitura. Dois cards entram no Jira, são estimados e planejados — e o mesmo documento diz que eles não deveriam existir.

**Tipo de falha:** violação da regra de bloqueio do próprio prompt

**Por que aconteceu:** o prompt manda classificar cada critério em `PASS` ou `FAIL`, dois valores. O modelo produziu 8 julgamentos fora desse domínio (`FAIL parcial`, `PASS condicional`), e com razão: a US-01 falha *Independent* mas é desenvolvível hoje contra o limite fixo do legado. Com um terceiro valor em circulação, o portão `se [INVEST-FAIL] então bloqueia` fica sem regra e o modelo decide caso a caso.

---

## Alteração no prompt

Repetir "não faça gold plating" não resolveria — já está no prompt duas vezes. As duas mudanças da [v2.0](../../prompts/requirements-copilot-v2.md) atacam o mecanismo:

**C1 — Regra de Ancoragem.** Todo cenário Gherkin precisa citar uma âncora (trecho literal do input) na linha seguinte. Sem âncora, o cenário não entra na história: vai para a subseção nova `f. Candidatos derivados`, marcado `[GOLD PLATING]`. Deixa de ser varredura posterior e vira condição de escrita. Como a marcação é inline, sobrevive ao MODO RÁPIDO.

**C2 — INVEST ternário.** Em vez de proibir a gradação, define o terceiro valor e ensina o portão a usá-lo: `[INVEST-COND]` para falha que o time resolve sozinho (mockar, fatiar, usar o legado) gera card com a condição no topo; `[INVEST-FAIL]` para falha que depende de terceiro continua bloqueando. Mais a verificação de que o nº de bloqueadas tem de bater com o nº de histórias com `[INVEST-FAIL]`, os dois números impressos.

Diff completo: [`../intermediário/prompt-v1-v2.diff`](../intermediário/prompt-v1-v2.diff).

---

## Comparação V1 × V2

[`backlog-estruturado-v2.md`](../../outputs/backlog-estruturado-v2.md) — mesmo modelo, mesmo input, subagente novo.

| | V1 | V2 |
|---|---|---|
| Gold plating dentro de critério de aceite | **2** | **0** |
| Âncoras literais citadas | 0 | 23 |
| Gradações fora de `PASS`/`FAIL` | 7 | 0 |
| Histórias com `[INVEST-FAIL]` / bloqueadas | **7 / 5** | **5 / 5** |
| Verificação de contagem impressa | não | sim (`5 = 5`) |

**O que melhorou.** Os dois itens que o V1 mandou remover e não removeu foram interceptados antes de virar critério — a deduplicação aparece agora em `f` da US-01, justificada como *"boa prática de operação de alertas, sem qualquer menção no input"*. E a conta do INVEST fecha: as mesmas 5 histórias aparecem nas duas linhas do resumo.

**O que ainda persiste.** Duas coisas, e a segunda é nova:

1. Nenhuma história ficou pronta para sprint em nenhuma das versões — os 6 cards do V2 têm `Definition of Ready: ⚠️ Pendente`, como os 4 do V1. O prompt melhorou o artefato, não destravou o backlog.
2. **C1 criou um problema que o V1 não tinha.** O critério da US-01 no V2 virou *"notifica o supervisor em menos de 5 minutos"* — teste que passa em 4m59s, exatamente o atraso que Carlos chamou de inaceitável. A regra de ancoragem exige número do input, e o único disponível era *"não pode ter delay de cinco minutos"*: um limite do inaceitável virou o alvo do requisito. Seria o ajuste da V3 — distinguir âncora de valor-alvo de âncora de valor-limite.
