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
`moduloNN-*` por disciplina. Material autoral do professor **não é redistribuído aqui**: referencie
por caminho relativo à raiz do gabarito, com `sha256`, em vez de copiar.

## Commands

| Command | Quando |
|---|---|
| `/novo-modulo NNN-slug` | Prepara a pasta de um módulo da disciplina 07 |
| `/roda-prompt NNN v1\|v2` | Executa um prompt em subagente de contexto limpo e grava o output |
| `/entrega-modulo NNN` | Escreve o `ENTREGA.md` (relato da iteração de prompt) |
| `/readme-projeto NNN` | README do projeto + índice raiz + commit |
| `/commit-projeto NNN` | Commita os fontes do projeto |
| `/finaliza-projeto NNN` | README + índice + commits, em sequência |
| `/readme-index` | Reconstrói o índice raiz do zero |
| `/nova-aula-aiops` | ⚠️ Congelado — específico da disciplina 06, encerrada |

## Disciplina ativa: `07-ferramentas-de-IA-para-gestão-de-projetos`

Disciplinas 01–06 estão concluídas e permanecem no repo.

A 07 rompe com o padrão das anteriores: **quase não tem código**. Em 8 dos 10 módulos o artefato é
um *system prompt* executado sobre um input fixo, e a entrega acadêmica é o **relato de uma
iteração de prompt engineering** (V1 → falhas → V2 → comparação), não o output do modelo.

Consequências operacionais:

- **A herança entre módulos é documental, não de código.** `NNN` não parte de `NNN-1` — cada módulo
  tem prompt e input próprios. O que se acumula é o estado do case **RouteWise**: o backlog do M1
  alimenta o scoring do M2, que alimenta o cronograma do M3, e assim por diante. Nada de `cp -R`.
- **O relato da iteração vive em `ENTREGA.md`, nunca no README.** O README continua canônico. Essa
  separação existe porque o relato é exatamente o que o template proíbe.
- **Alvo de rubrica: Intermediário** — análise causal (qual dado específico causou a mudança), não
  descritiva.
- **Engine: Claude.** O gabarito autoriza explicitamente (`modulo-01/nota-adaptacao-modelos.md`).
  As instruções de `temperatura 0.2/0.3` do material **não traduzem**: `temperature` foi removido
  dos modelos Claude atuais (400 em Opus 5, Sonnet 5, Opus 4.8/4.7, Fable 5). O equivalente é
  `output_config.effort`. Portanto uma diferença entre V1 e V2 **só conta como efeito do prompt se
  reproduzir** — verificar isso é parte da entrega.
- **Ferramentas**: Jira Cloud Free e Slack Free são reais; Danger roda local (`--local --mock`);
  o bot do M9 é o template Node + ngrok. Sem Make.com.
