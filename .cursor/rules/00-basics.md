---
description: Padrões globais do repositório (idioma, fonte única, templates).
---

## Idioma
- Produzir instruções e artefatos em **Português (PT-BR)**, com acentuação correta.

## Fonte única de verdade
- O padrão do repositório vive em **`CLAUDE.md` (raiz)** e em **`shared/templates/`**.
- `.cursor/` contém apenas **ponteiros** para lá — nunca cópias. Se encontrar aqui um template
  com conteúdo próprio, ele é dívida: a versão de `shared/` vence.

## Templates oficiais
- README: `shared/templates/README_TEMPLATE.md`
- Commits: `shared/templates/COMMIT_TEMPLATE.md`
