# Agentes — ponteiro

A fonte da verdade deste repositório é **`CLAUDE.md` (raiz)** e **`shared/templates/`**.

## Onde olhar
- Padrão geral, convenções e disciplina ativa: `CLAUDE.md` na raiz
- Template de README: `shared/templates/README_TEMPLATE.md`
- Template de commit: `shared/templates/COMMIT_TEMPLATE.md`
- Rules do Cursor: `.cursor/rules/` (apontam para os arquivos acima, não os duplicam)

## Capacidades esperadas do agente
- Gerar/atualizar `README.md` de projetos seguindo o template canônico em `shared/`.
- Criar commits padronizados: linha 1 `tipo: descrição curta`, linha 2 `Finalizado em: DD/MM/AAAA`.
- Usar `gh` (GitHub CLI) para operações com GitHub quando aplicável.
