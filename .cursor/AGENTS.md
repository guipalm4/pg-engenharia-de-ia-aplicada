# Agentes (fonte oficial)

Este repositório usa **rules** e **skills** do Cursor como fonte de verdade para padronização.

## Onde olhar
- Rules: `.cursor/rules/`
- Skills: `.cursor/skills/`
- Templates: `.cursor/templates/`

## Capacidades esperadas do agente
- Gerar/atualizar `README.md` de projetos seguindo `.cursor/templates/README_TEMPLATE.md`.
- Criar commits padronizados seguindo `.cursor/templates/COMMIT_TEMPLATE.md`.
- Usar `gh` (GitHub CLI) para operações com GitHub (auth, PR) quando aplicável.

