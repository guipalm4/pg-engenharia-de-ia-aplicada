# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-04-06] Sempre produzir texto e artefatos em PT-BR**
   Do instead: responder em Português (PT-BR), incluindo commits, READMEs e comentários.

2. **[2026-04-06] Fonte única de verdade em `.cursor/`**
   Do instead: antes de criar rules/skills/templates, verificar se já existe em `.cursor/rules/`, `.cursor/skills/`, ou `.cursor/templates/`.

## Commits & Git
1. **[2026-04-06] Mensagem de commit sempre no formato do template oficial**
   Do instead: linha 1 `tipo: descrição curta`, linha 2 `Finalizado em: DD/MM/AAAA`. Usar tipos: feat, fix, docs, refactor, chore, test, perf, build, ci.

2. **[2026-04-06] Commits pequenos e coerentes por tema**
   Do instead: nunca criar mega commits com mudanças não relacionadas — separar por contexto.

## README & Documentação
1. **[2026-04-06] Todo projeto precisa de README na raiz gerado a partir do template**
   Do instead: usar `.cursor/templates/README_TEMPLATE.md` — preencher todos os campos, nunca deixar seção vazia.

2. **[2026-04-06] Atualizar Estrutura do Projeto no README quando estrutura mudar**
   Do instead: sempre que adicionar arquivos relevantes, atualizar a seção "Estrutura do Projeto" para refletir a árvore real.

## Estrutura do Repositório
1. **[2026-04-06] Projetos ficam em `disciplinas/<disciplina>/projects/<nome>/`**
   Do instead: ao criar novo projeto, respeitar esse caminho. Disciplina atual ativa: `01-fundamentos-IA-LLM`.

2. **[2026-04-06] `disciplinas/*.md` são documentação humana / ponteiros — não fonte de verdade**
   Do instead: não editar como se fossem configuração; apontar para `.cursor/` quando relevante.
