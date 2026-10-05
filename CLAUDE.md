# Repositório de estudos — Pós em Engenharia de IA Aplicada (UniPDS)

Repositório **público** com os projetos de cada disciplina da pós. Cada projeto é material de
consulta do autor, não entregável de cliente.

## Fonte única de verdade

| O que | Onde |
|---|---|
| Estrutura e voz do README de projeto | `shared/templates/README_TEMPLATE.md` |
| Mensagem de commit | `shared/templates/COMMIT_TEMPLATE.md` |

Se encontrar uma segunda versão de um template em qualquer lugar do repositório, ela é dívida —
a de `shared/` vence.

## Convenções invioláveis

- **Tudo em PT-BR**, com acentuação correta: respostas, READMEs, commits, comentários.
- **Projetos vivem em `disciplinas/<disciplina>/projects/NNN-slug/`**, numeração sequencial de três
  dígitos. Só a disciplina 01 usa o prefixo legado `exemplo-`.
- **Commit**: linha 1 `tipo: descrição curta`, linha 2 `Finalizado em: DD/MM/AAAA`. Tipos: `feat`,
  `fix`, `docs`, `refactor`, `chore`, `test`, `perf`, `build`, `ci`. Commits pequenos e coerentes
  por tema.
- **`disciplinas/*/docs/**` está no `.gitignore`** — slides e PDFs do professor não são versionados.
- **O README apresenta o projeto; não o julga e não relata a sessão que o escreveu.** Nada de cota
  de token, rate limit, contagem de testes, tempo de parede ou crítica ao material da aula. As
  regras completas estão no template — leia-o antes de escrever qualquer README.

## Repositório gabarito (material do professor)

Fica **fora** deste repo, em `~/Dev/Projects/Personal/unipds/unipds-gabarito/`, uma pasta
`moduloNN-*` por disciplina. O material que um módulo consome é **copiado** para dentro da pasta do
projeto, para que ela fique autocontida e reproduzível. É conteúdo didático num repositório de
estudos.

## Commands

| Command | Quando |
|---|---|
| `/arq-novo-modulo NNN` | **08** — prepara a pasta, a checklist e o esqueleto da entrega |
| `/arq-implementa NNN` | **08** — escreve `src/` a partir das decisões da entrega |
| `/arq-roda NNN [script] [stdin=s,n]` | **08** — executa e grava `outputs/<script>-NN.md` com procedência |
| `/arq-entrega NNN` | **08** — preenche logs e trechos de código e confere contra a checklist (idempotente) |
| `/novo-modulo NNN-slug` | **07** — prepara a pasta de um módulo |
| `/roda-prompt NNN v1\|v2` | **07** — executa um prompt em subagente de contexto limpo e grava o output |
| `/entrega-modulo NNN [nível]` | **07** — escreve `entrega/<nível>/` (relato da iteração de prompt) |
| `/corrige-entrega NNN [nível]` | **07** — corrige uma entrega contra o enunciado, a rubrica e o exemplo |
| `/readme-projeto NNN` | README do projeto + índice raiz + commit |
| `/commit-projeto NNN` | Commita os fontes do projeto |
| `/finaliza-projeto NNN` | README + índice + commits, em sequência |
| `/readme-index` | Reconstrói o índice raiz do zero |
| `/nova-aula-aiops` | ⚠️ Congelado — específico da disciplina 06, encerrada |

## Disciplina ativa: `08-arquitetura-de-sistemas-com-IA`

**O ciclo de trabalho está em
[`disciplinas/08-arquitetura-de-sistemas-com-IA/WORKFLOW.md`](./disciplinas/08-arquitetura-de-sistemas-com-IA/WORKFLOW.md).
Leia-o antes de operar a 08.** Mantenha a seção "Estado atual" dele atualizada ao fim de cada
módulo. Cada disciplina com fluxo próprio tem o seu `WORKFLOW.md` dentro da pasta dela.

Disciplinas 01–06 estão concluídas. A **07 está pausada** no M4, e o estado dela está em
[`disciplinas/07-.../WORKFLOW.md`](./disciplinas/07-ferramentas-de-IA-para-gestao-de-projetos/WORKFLOW.md).

A 08 tem 5 módulos, cada um com Missão de 3 a 5 Passos: decisões de arquitetura mais protótipo
JavaScript (M2–M5). Consequências operacionais:

- **O caso é um projeto pessoal real do usuário**, único nos 5 módulos, em
  [`CASO.md`](./disciplinas/08-arquitetura-de-sistemas-com-IA/CASO.md). O enunciado proíbe caso
  hipotético e proíbe repetir o TrialForge. Não invente o caso: sem `CASO.md` preenchido, pare.
- **Sem rubrica de níveis.** A régua é a seção *Entrega* do enunciado, transcrita em
  `entrega/checklist.md`. A entrega é um arquivo só, `entrega/README.md`, e o README do projeto
  continua canônico.
- **Decisão de arquitetura é do usuário** nos blocos `<!-- VOCÊ -->` da entrega.
- **Engine: OpenRouter** (chat + embeddings), via `fetch` nativo, com `OPENROUTER_API_KEY`. Os
  protótipos do professor usam Ollama e ficam em `material/` só como referência.
- **Herança de código só do 004 para o 005.** O resto atravessa os módulos via `CASO.md`, seção 5.

## Disciplina 07 (pausada): `07-ferramentas-de-IA-para-gestao-de-projetos`

A 07 rompe com o padrão das anteriores: **quase não tem código**. Em 8 dos 10 módulos o artefato é
um *system prompt* executado sobre um input fixo, e a entrega acadêmica é o **relato de uma
iteração de prompt engineering** (V1 → falhas → V2 → comparação), não o output do modelo.

Consequências operacionais:

- **A herança entre módulos é documental, não de código.** `NNN` não parte de `NNN-1` — cada módulo
  tem prompt e input próprios. O que se acumula é o estado do case **RouteWise**: o backlog do M1
  alimenta o scoring do M2, que alimenta o cronograma do M3, e assim por diante. Nada de `cp -R`.
- **O relato da iteração vive em `entrega/<nível>/`, nunca no README.** O README continua canônico —
  a separação existe porque o relato é exatamente o que o template proíbe. Cada nível de rubrica é
  uma pasta autocontida; subir de nível cria pasta nova em vez de editar a anterior.
- **Alvo de rubrica: Intermediário** — análise causal (qual dado específico causou a mudança), não
  descritiva.
- **Engine: Claude.** O gabarito autoriza explicitamente (`modulo-01/nota-adaptacao-modelos.md`).
  As instruções de `temperatura 0.2/0.3` do material **não traduzem**: `temperature` foi removido
  dos modelos Claude atuais (400 em Opus 5, Sonnet 5, Opus 4.8/4.7, Fable 5). O equivalente é
  `output_config.effort`. Portanto uma diferença entre V1 e V2 **só conta como efeito do prompt se
  reproduzir** — verificar isso é parte da entrega.
- **Ferramentas**: Jira Cloud Free e Slack Free são reais; Danger roda local (`--local --mock`);
  o bot do M9 é o template Node + ngrok. Sem Make.com.
