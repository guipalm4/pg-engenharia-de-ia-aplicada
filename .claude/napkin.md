# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-04-06] Sempre produzir texto e artefatos em PT-BR**
   Do instead: responder em Português (PT-BR), incluindo commits, READMEs e comentários.

2. **[2026-08-29] Fonte única de verdade: `CLAUDE.md` (raiz) + `shared/templates/`**
   Do instead: antes de criar rule/skill/template, checar `CLAUDE.md` e `shared/templates/`. Nunca criar uma segunda cópia de um template — foi o que degradou os READMEs da 06.

## Commits & Git
1. **[2026-04-06] Mensagem de commit sempre no formato do template oficial**
   Do instead: linha 1 `tipo: descrição curta`, linha 2 `Finalizado em: DD/MM/AAAA`. Usar tipos: feat, fix, docs, refactor, chore, test, perf, build, ci.

2. **[2026-04-06] Commits pequenos e coerentes por tema**
   Do instead: nunca criar mega commits com mudanças não relacionadas — separar por contexto.

## README & Documentação
1. **[2026-04-06] Todo projeto precisa de README na raiz gerado a partir do template**
   Do instead: usar `shared/templates/README_TEMPLATE.md` — preencher todos os campos, nunca deixar seção vazia, nunca inventar seção.

2. **[2026-04-06] Atualizar Estrutura do Projeto no README quando estrutura mudar**
   Do instead: sempre que adicionar arquivos relevantes, atualizar a seção "Estrutura do Projeto" para refletir a árvore real.

## Estrutura do Repositório
1. **[2026-08-29] Projetos ficam em `disciplinas/<disciplina>/projects/NNN-slug/`**
   Do instead: ao criar novo projeto, respeitar esse caminho e a numeração sequencial. Disciplina ativa: `07-ferramentas-de-IA-para-gestão-de-projetos` (01–06 concluídas, permanecem no repo).

2. **[2026-08-29] Na disciplina 07 o relato da iteração de prompt vai em `ENTREGA.md`, não no README**
   Do instead: README segue o template canônico; V1/falhas/V2/comparação ficam no `ENTREGA.md` ao lado. Os dois documentos têm vozes opostas de propósito.
