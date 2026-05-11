# Skill: commit-projeto

Commita os arquivos-fonte do projeto **$ARGUMENTS** com o padrão do repositório e faz push.

## Passos

### 1. Descoberta + git state (script único — leia só o output)

```bash
PROJECT=$(find . -maxdepth 7 -type d -name "*$ARGUMENTS*" ! -path "*/node_modules/*" | head -1)
TITLE=$(head -1 "$PROJECT/README.md" 2>/dev/null | sed 's/^# //' || echo "$ARGUMENTS")
echo "PROJECT=$PROJECT"
echo "TITLE=$TITLE"
echo "=== Fontes não rastreados (excl. README.md) ==="
git ls-files --others --exclude-standard -- "$PROJECT" | grep -v "README.md$"
echo "=== Fontes modificados ==="
git diff --name-only -- "$PROJECT" | grep -v "README.md$"
```

### 2. Stage, commit e push

```bash
# Stage apenas fontes (exclui README.md, responsabilidade do /readme-projeto)
git ls-files --others --exclude-standard -- "$PROJECT" | grep -v "README.md$" | xargs -r git add
git diff --name-only -- "$PROJECT" | grep -v "README.md$" | xargs -r git add

git commit -m "feat: adiciona $ARGUMENTS (<título do passo 1>) Finalizado em: DD/MM/AAAA"
git push
```

Use a data atual do `currentDate` do contexto de sessão.
Artefatos indesejados (`node_modules/`, `*.sqlite`, lock files, `.DS_Store`) são ignorados pelo `.gitignore` raiz.
