# Workflow — Disciplina 07 (Ferramentas de IA para Gestão de Projetos)

Guia de retomada. Se você voltou depois de um tempo, leia daqui.

## Estado atual

> **Módulo 1** — `outputs/backlog-estruturado-v1.md` gerado. **Próximo passo: você ler o V1 e identificar duas falhas.**
> Branch de trabalho: `modulo-7.1` (a `main` tem só os commits de setup).
>
> *Atualize estas três linhas ao terminar cada módulo.*

## O ciclo de um módulo

```
1. /novo-modulo NNN-slug        → eu: cria a pasta, copia o material, lê o enunciado
2. /roda-prompt NNN v1          → eu: executa em subagente isolado → outputs/<artefato>-v1.md
3. VOCÊ lê o V1 e acha as falhas
4. VOCÊ decide a alteração      → prompts/<ferramenta>-v2.md
5. /roda-prompt NNN v2          → eu: executa em subagente NOVO → outputs/<artefato>-v2.md
6. /entrega-modulo NNN          → eu: escreve o ENTREGA.md com a SUA análise
7. /finaliza-projeto NNN        → eu: README + índice raiz + commits
```

**Os passos 3 e 4 são seus, e não por formalidade.** A rubrica avalia exatamente isso: *"onde ele
inventou uma especificação que o stakeholder não deu? onde faltou uma flag de risco que você como
dev sênior teria visto?"* Se eu gerasse as falhas, o passo 5 mediria a minha hipótese sobre o
prompt, não a sua — e a entrega perderia o que ela existe para exercitar. Os commands estão
escritos para recusar isso.

No passo 3 você me traz o que achou **em linguagem solta**. Formato é problema do `/entrega-modulo`.

### O que procurar no passo 3

Três coisas concretas, que são as que o enunciado do M1 lista:

- **Especificação inventada** — um número, prazo ou regra que não está no insumo
- **Ambiguidade mal sinalizada** — marcada onde estava claro, ou ausente onde não estava
- **Risco não visto** — algo que você, como engenheiro, sabe que vai doer

## Anatomia de uma pasta de módulo

```
disciplinas/07-.../projects/NNN-slug/
├── README.md      consulta daqui a um ano · voz expositiva · segue o template canônico
├── ENTREGA.md     o que o professor lê · voz analítica · V1→falhas→V2→comparação
├── prompts/       <ferramenta>-v1.md (do professor) e -v2.md (seu)
├── inputs/        os dados que a atividade manda usar
├── material/      enunciado + Exemplo resolvido + output-* do professor
└── outputs/       <artefato>-v1.md e -v2.md — com procedência no cabeçalho
```

**Nada se chama `v1.md`.** O prompt leva o nome da ferramenta, o output leva o nome do artefato, e o
sufixo `-v1`/`-v2` marca a iteração — é ele que os commands resolvem. No módulo 1:
`prompts/requirements-copilot-v1.md` → `outputs/backlog-estruturado-v1.md`.

**`README.md` e `ENTREGA.md` têm vozes opostas de propósito.** O README é material de consulta e
segue `shared/templates/README_TEMPLATE.md`, que proíbe relato de execução, crítica ao material e
números medidos. O ENTREGA.md é exatamente isso. Separá-los é o que impede um de degradar o outro —
foi a mistura dos dois que estragou os READMEs da disciplina 06.

**Não abra `material/Exemplo - Módulo N.pdf` antes de escrever a sua análise.** É o gabarito
resolvido. Ele está na pasta porque torna o módulo legível depois, não porque deva ser consultado
agora.

## Três coisas que só apareceram rodando

**1. Temperatura não existe no Claude.** O material da disciplina especifica temperatura 0.2–0.3 em
vários módulos. Isso é do AI Studio: nos modelos Claude atuais o parâmetro foi **removido** (400 em
Opus 5, Sonnet 5, Opus 4.8/4.7, Fable 5). Consequência prática, e ela vira rigor da entrega em vez
de limitação:

> Uma diferença entre V1 e V2 só conta como efeito do prompt **se ela reproduzir**. Para testar,
> rode `/roda-prompt NNN v1` uma segunda vez: se a falha reaparecer, é sistemática do prompt; se
> não, era ruído de amostragem, e o `ENTREGA.md` diz isso em vez de creditar ao prompt.

Vale fazer nas duas falhas que você vai defender — não em todas.

**2. Jira e Slack só a partir do M6.** Os `jira-estado-board.md` que aparecem em 8 módulos são
cenografia da demo do vídeo, não insumo de entrega. As ferramentas reais são exigidas em dois
pontos: **M6** (criar 2 cards e cronometrar) e **M9** (print da automação funcionando). Faça o setup
das contas gratuitas antes do M6, não antes — você chega nele já sabendo qual backlog importar.

**3. `$1` e `$2` não funcionam dentro de um slash command.** O harness substitui esses tokens no
texto do arquivo antes do shell executar. Use `cut -d' ' -f1` e variáveis nomeadas. Já corrigido nos
commands, mas a armadilha volta se você escrever outro.

## Decisões travadas (não re-decidir)

| | |
|---|---|
| Estrutura | 10 pastas `NNN-slug` em `projects/`, uma por módulo |
| Case | RouteWise, do gabarito |
| Entrega | `ENTREGA.md` separado; README permanece canônico |
| Rubrica-alvo | **Intermediário** — análise causal, não descritiva |
| Engine | Claude (o gabarito autoriza em `modulo-01/nota-adaptacao-modelos.md`) |
| Execução | Subagente de contexto limpo, via `/roda-prompt` |
| Material do professor | Copiado para dentro da pasta — é conteúdo didático |
| Ferramentas | Jira Free + Slack Free; Danger local (`--local --mock`); sem Make.com |

**Por que subagente e não esta sessão:** se o output fosse produzido por uma sessão que já leu o
gabarito resolvido ou já discutiu o que o prompt deveria fazer, a análise de falhas seria circular.
O V2 também roda em subagente novo — senão ele "corrige" o que viu, e a comparação deixa de medir o
prompt.

## Os dez módulos

| # | Módulo | Ferramenta | Código? |
|---|---|---|---|
| 001 | Planejamento e Escopo | Requirements Copilot | — |
| 002 | Priorização de Backlog | Backlog Scorer (RICE, WSJF) | — |
| 003 | Cronograma e Capacidade | Scheduling Prompt | — |
| 004 | Estimativas e Previsões | Probability Forecast | Monte Carlo (JS/Py) |
| 005 | Riscos e AIOps | Risk Monitor | — |
| 006 | Reuniões Turbinadas | Meeting Digest | *(Jira real)* |
| 007 | Status Reports | Status Report | — |
| 008 | Governança e Compliance | Compliance Checklist | Danger (JS/Py) |
| 009 | Automação de Ecossistema | NL to Workflow | Bot Node + ngrok |
| 010 | Portfólio e OKRs | OKR Aligner | — |

A trilha é encadeada: o backlog que você curar no M1 é a entrada do M2, que alimenta o M3, e assim
por diante. **Prepare um módulo por vez** — preparar o M5 hoje congelaria uma entrada que ainda não
existe.

## Onde mais olhar

- `CLAUDE.md` — convenções do repositório inteiro (carregado automaticamente em toda sessão)
- `shared/templates/README_TEMPLATE.md` — a fonte única do padrão de README
- `disciplinas/07-.../projects/README.md` — índice da disciplina
- Gabarito do professor: `~/Dev/Projects/Personal/unipds/unipds-gabarito/modulo07-*/`
