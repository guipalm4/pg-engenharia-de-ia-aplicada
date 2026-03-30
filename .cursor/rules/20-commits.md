---
description: Padrão de commits (mensagem, data, fluxo com gh + git).
---

## Objetivo
Padronizar mensagens de commit e tornar o fluxo repetível, com baixo ruído e compatível com automação.

## Mensagem de commit (obrigatório)
- Seguir o template oficial: `.cursor/templates/COMMIT_TEMPLATE.md`.
- Formato:
  - Linha 1: `tipo: descrição curta` (ex.: `feat: adiciona pipeline de pré-processamento`)
  - Linha 2: `Finalizado em: DD/MM/AAAA`
- Tipos permitidos: `feat`, `fix`, `docs`, `refactor`, `chore`, `test`, `perf`, `build`, `ci`.

## Escopo (recomendado)
- Preferir commits pequenos e coerentes por tema.
- Evitar “mega commits” com mudanças não relacionadas.

## Fluxo operacional (padrão)
- Validar branch e alterações locais.
- Preparar staging conscientemente.
- Gerar mensagem seguindo o template e o `git diff --staged`.
- Executar `git commit`.
- Para interação com GitHub (push/PR), usar `gh` quando aplicável (ex.: `gh auth status`, `gh pr create`).

