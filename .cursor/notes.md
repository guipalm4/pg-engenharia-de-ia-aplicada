# Napkin Runbook

## Curation Rules
- Re-prioritize on every read.
- Keep recurring, high-value notes only.
- Max 10 items per category.
- Each item includes date + "Do instead".

## Execution & Validation (Highest Priority)
1. **[2026-03-30] Fonte única de verdade em `.cursor/`**
   Do instead: manter templates, rules e skills oficiais em `.cursor/` e tratar `disciplinas/*.md` apenas como documentação/ponteiros.
2. **[2026-03-30] Responder sempre em Português**
   Do instead: produzir respostas, templates e instruções em PT-BR, inclusive mensagens e seções de README quando fizer sentido.
3. **[2026-03-30] Usar Context7 para docs/config de ferramentas**
   Do instead: ao precisar de sintaxe/flags (ex.: `gh`), consultar Context7 antes de escrever instruções finais.

## Repo Standards (Readmes & Commits)
1. **[2026-03-30] README padronizado por projeto**
   Do instead: sempre gerar/atualizar `README.md` a partir de `.cursor/templates/README_TEMPLATE.md`, preenchendo todos os campos e mantendo checklist útil.
2. **[2026-03-30] Commit padronizado com data**
   Do instead: sempre usar `.cursor/templates/COMMIT_TEMPLATE.md` e incluir `Finalizado em: DD/MM/AAAA` (data local do dia).
3. **[2026-03-31] Evitar versionar dependências**
   Do instead: garantir `.gitignore` cobrindo `node_modules/` e revisar `git status` antes de commitar para não incluir artefatos gerados.

## Shell & Command Reliability
1. **[2026-03-30] Evitar ruído e reduzir tokens**
   Do instead: coletar só evidências mínimas (ex.: `git status`, `git diff --staged`) e gerar saída objetiva; nunca colar diffs longos sem necessidade.

