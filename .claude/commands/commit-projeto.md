# Skill: commit-projeto

Commita os arquivos-fonte do projeto **$ARGUMENTS** com o padrão do repositório e faz push.

## Passos

### 1. Descoberta + git state (script único — leia só o output)

```bash
PROJECT=$(find . -maxdepth 7 -type d -name "*$ARGUMENTS*" ! -path "*/node_modules/*" | head -1)
TITLE=$(head -1 "$PROJECT/README.md" 2>/dev/null | sed 's/^# //' || echo "$ARGUMENTS")
echo "PROJECT=$PROJECT"
echo "TITLE=$TITLE"
echo "=== Fontes não rastreados (excl. README.md raiz; READMEs internos entram) ==="
git -c core.quotePath=false ls-files --others --exclude-standard \
  -- "$PROJECT" ":(exclude)$PROJECT/README.md"
echo "=== Fontes modificados ==="
git -c core.quotePath=false diff --name-only \
  -- "$PROJECT" ":(exclude)$PROJECT/README.md"
```

### 2. Stage, commit e push

> **Nome com acento ou espaço quebra o `xargs`.** `git ls-files` cita esses caminhos com escapes
> octais (`gest\303\243o`), e um espaço faz o `xargs` partir o nome em dois — os PDFs do professor
> (`Atividade - Módulo 1.pdf`) têm os dois. Por isso `-z` no `git` e `-0` no `xargs`, sempre, e
> `:(exclude)` como pathspec no lugar de filtrar com `grep`. Nas linhas de leitura,
> `-c core.quotePath=false` mostra o acento em vez do escape.

```bash
# Stage fontes + READMEs internos (exclui só o README.md raiz do projeto, responsabilidade do /readme-projeto)
git ls-files --others --exclude-standard -z \
  -- "$PROJECT" ":(exclude)$PROJECT/README.md" | xargs -0 -r git add --
git diff --name-only -z \
  -- "$PROJECT" ":(exclude)$PROJECT/README.md" | xargs -0 -r git add --

git commit -m "feat: adiciona $ARGUMENTS (<título do passo 1>) Finalizado em: DD/MM/AAAA"
git push
```

Use a data atual do `currentDate` do contexto de sessão.
Artefatos indesejados (`node_modules/`, `*.sqlite`, lock files, `.DS_Store`) são ignorados pelo `.gitignore` raiz.
