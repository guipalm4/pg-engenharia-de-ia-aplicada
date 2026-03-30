---
name: commit-gh-padronizado
description: |
  Criar commits padronizados (mensagem + data) e, quando aplicável, preparar
  interação com GitHub via GitHub CLI (gh) para push/PR de forma repetível.
author: repo
version: 1.0.0
date: 2026-03-30
---

# Skill: Commit padronizado com gh

## Fonte oficial
- Template: `.cursor/templates/COMMIT_TEMPLATE.md`
- Regras: `.cursor/rules/20-commits.md`

## Pré-requisitos
- Repositório git inicializado.
- `gh` instalado e autenticado quando for interagir com GitHub (PR, etc.).

## Procedimento (sempre igual)
### 1) Pré-checagens rápidas (baixo ruído)
- Verificar autenticação (somente se for usar GitHub):

```bash
gh auth status
```

- Verificar estado do repositório:

```bash
git status
```

### 2) Staging intencional
- Preparar staging apenas do que entra no commit:

```bash
git add <arquivos-ou-pastas>
```

- Conferir o que vai entrar:

```bash
git diff --staged
```

### 3) Gerar mensagem pelo template (obrigatório)
- Ler `.cursor/templates/COMMIT_TEMPLATE.md`.
- Produzir mensagem com:
  - Linha 1: `tipo: descrição curta` (em PT-BR; objetiva; sem ponto final)
  - Linha 2: `Finalizado em: DD/MM/AAAA` (data do dia)
- Não adicionar corpo extra, a menos que a mudança precise de contexto para rastreabilidade.

### 4) Executar commit (com HEREDOC para padronização)

```bash
git commit -m "$(cat <<'EOF'
<tipo>: <descrição curta>
Finalizado em: <DD/MM/AAAA>
EOF
)"
```

### 5) Push / PR (quando aplicável)
- Push (se o usuário solicitar publicar no remoto):

```bash
git push -u origin HEAD
```

- Criar PR com `gh` (se o usuário solicitar PR):

```bash
gh pr create --title "<tipo>: <descrição curta>" --body "$(cat <<'EOF'
## Summary
- <1-3 bullets do que mudou e por quê>

## Test plan
- [ ] <passos mínimos para validar>
EOF
)"
```

## Regras de segurança/consistência
- Nunca incluir segredos (.env, chaves) em commit.
- Se não houver mudanças staged, não criar commit vazio.
- Mensagem sempre deve incluir a linha `Finalizado em:`.

