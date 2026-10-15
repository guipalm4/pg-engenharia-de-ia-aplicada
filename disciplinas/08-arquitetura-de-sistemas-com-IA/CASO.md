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
| Nome | Anotaí |
| Repositório local | `/Users/guipalm4/Dev/Projects/Personal/anotai` (PRD em `docs/PRD.md`, v2.4; só o spike de extração, F-0, está implementado, e ainda sem rodada real) |
| O que faz, em uma frase | Controle de finanças pessoais em que o dono lança despesas por áudio, foto de cupom ou texto num bot do Telegram, e a despesa é gravada já classificada em categoria e no eixo essencial/não essencial (PRD §1) |
| Quem usa | Um único usuário, o dono; sem cadastro nem isolamento entre contas na v1, mas toda tabela já nasce com `user_id` (PRD §3, §5). Volume estimado: 100 mensagens de áudio ou texto e 10 fotos por mês, mais cerca de 20 perguntas abertas por mês (PRD §9) |
| Stack | TypeScript em monorepo Turborepo/pnpm: bot do Telegram, worker com fila pg-boss, API Hono e SPA Vite sobre um pacote de domínio; Postgres com Drizzle; OpenRouter como único provedor de IA; VPS com Docker Compose, acesso pela tailnet (PRD §9) |

## 2. O processo que vira o caso

O fluxo concreto que a arquitetura AI-first vai atender. Precisa ter, ao mesmo tempo:

- uma parte **repetitiva**, que vira regra ou cache (M1, M4);
- uma parte **ambígua**, que pede um modelo (M1, M2);
- **mais de um ator** que precisa concordar sobre o mesmo estado (M3);
- perguntas **repetidas com palavras diferentes** e um **erro caro e irreversível** (M4, M5).

**Lançar e consultar despesas pelo bot.** Hoje o dono controla os gastos numa planilha, à mão, e
desiste depois de um ou dois dias sem lançar: o esforço de recuperar o atraso passa a ser maior que
o de abandonar (PRD §2). No Anotaí, ele manda ao bot "paguei 43 e noventa no mercado agora", uma
foto de cupom ou "paguei a fatura do Nubank, 2 mil". O bot grava a mensagem e enfileira; o worker faz
**uma** chamada de IA que devolve uma proposta num contrato JSON de vocabulário fechado (intenção,
valor, categoria entre as elegíveis, apelido de cartão, expressão de data), e daí em diante só código
decide: valida (RN-30), calcula a data (RN-33), aplica as regras, grava e responde por template
(RN-31). Lançamento segue "grava e mostra"; pagar fatura, estornar, quitar parcelamento, registrar
receita e apagar só executam depois do Confirmar (RN-23). Pelo mesmo canal ele consulta o mês, os
tetos e o limite (comandos sem IA) e faz perguntas abertas a um agente que só lê (RN-32). O gargalo é
o atrito do lançamento; o custo de um erro é o total do mês deixar de ser confiável, o que leva de
volta ao abandono.

O que o Anotaí tem de cada exigência, e o que não tem:

| Exigência | No Anotaí | Aderência |
|---|---|---|
| Parte repetitiva | Cálculo de data, parcelas, rateio do cupom, valor alto, duplicata, teto e limite (RN-2 a RN-33); consultas fixas `/mes`, `/tetos`, `/limite` sem IA (PRD §7) | sim |
| Parte ambígua | Entender fala, cupom e comprovante: intenção, valor, categoria, "10x de 300" contra "3 mil em 10x" (RN-2, PRD §10) | sim |
| Mais de um ator sobre o mesmo estado | Só sistemas, e quase todos do próprio produto: Telegram (retém a atualização até a confirmação), bot, fila pg-boss, worker, OpenRouter e Postgres concordam sobre o estado de uma MensagemRecebida, sem gravar nada duas vezes (RN-14). A fatura do banco contra a Fatura do Anotaí é conferida à mão pelo dono (M-1). Não há segunda pessoa | parcial |
| Perguntas repetidas com palavras diferentes | Perguntas sobre o mês e os tetos, em linguagem natural ou por comando, e cerca de 20 perguntas abertas por mês `[P]`. O volume é pequeno, e a resposta muda a cada lançamento | parcial |
| Erro caro e irreversível | Operações informadas ao bot mudam Fatura, Parcelamento e limite (RN-9, RN-11, RN-26), e o PRD não descreve como desfazê-las; Fatura fechada nunca é recalculada (RN-10). Nenhum erro move dinheiro: o Anotaí registra, não paga. Lançamento comum é reversível, sem prazo (escopo 5) | parcial |

## 3. Restrições reais

| Restrição | Valor |
|---|---|
| Dado sensível envolvido | Financeiro: os gastos do dono trafegam para o OpenRouter `[D]`, restritos a provedores que não retêm nem treinam `[P]`; mídia, dados e dataset de eval ficam fora do git e dos logs (PRD §9) |
| Custo de um erro | Lançamento errado: reversível pelo botão Corrigir ou Apagar, sem prazo; custa atrito e confiança no total do mês. Operação de fatura, estorno ou quitação confirmada errada: altera fatura, parcelas futuras e limite, sem fluxo de desfazer descrito no PRD |
| Volume de requisições | Cerca de 110 mensagens por mês (100 de áudio ou texto e 10 fotos), umas 4 por dia, mais cerca de 20 perguntas abertas por mês `[P]` (PRD §9) |
| Orçamento mensal de IA aceitável | R$ 20 por mês, elevável a R$ 40 pelo plano B `[D]`, repartido em extratores 70%, agente de consulta 15% e reserva para lançamentos 15% `[P]` (PRD §9). Em US$, depende da cotação configurada, que o PRD não fixa |
| Latência | p95 de até 10 s no áudio e no texto e de até 30 s na foto, com recebimento sinalizado em até 1 s `[D]`; agente de consulta até 20 s `[P]` (PRD §9, §10) |

## 4. Engine

**OpenRouter**: chat e embeddings pela mesma chave (`OPENROUTER_API_KEY`), chamados com `fetch`
nativo do Node, sem SDK. Toda resposta traz `usage.cost` em US$. Os modelos são decisão de cada
módulo e ficam registrados na seção 5.

## 5. Estado acumulado

O que cada módulo decidiu e o módulo seguinte herda. Uma linha por decisão, escrita pelo
`/arq-entrega` a partir da entrega. **Não é lugar de análise**, só do que foi decidido.

| Módulo | Decisão herdável |
|---|---|
| 001 | Componentes: Gateway = bot do Telegram (regra) · Orquestrador = worker com fila pg-boss (regra) · extrator de chamada única (agente, contrato JSON fechado) · agente de consulta só-leitura (agente) · Approval Gate = Confirmar do dono antes de operação (RN-23), valor alto (RN-20) e parcela ambígua (RN-2) |
| 002 | Agente de consulta: memória só dentro da pergunta · loop ReAct até 6 chamadas de ferramenta (RN-32), no limite responde sem número · reflexão de superfície pelo código (bloco Números usados) · ferramenta de leitura `total_gasto`, sem gate · modelo `google/gemini-3.5-flash-lite` |
| 003 | — |
| 004 | — |
| 005 | — |
