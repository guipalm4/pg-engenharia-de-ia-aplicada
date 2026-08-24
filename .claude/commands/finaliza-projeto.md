# Skill: finaliza-projeto

Cria o README.md, atualiza o índice raiz e commita tudo (documentação + código-fonte) do projeto **$ARGUMENTS**.

Equivale a `/readme-projeto` seguido de `/commit-projeto`, em sequência otimizada com descoberta única do projeto.

## Passos

### 1. Descoberta + git state (script único — leia só o output)

```bash
PROJECT=$(find . -maxdepth 7 -type d -name "*$ARGUMENTS*" ! -path "*/node_modules/*" | head -1)
echo "PROJECT=$PROJECT"
echo "=== Fontes não rastreados (excl. README.md raiz; READMEs internos entram) ==="
git ls-files --others --exclude-standard -- "$PROJECT" | grep -vx "${PROJECT#./}/README.md"
```

### 2. Dump dos arquivos-fonte (script único — leia só o output)

Primeiro, detecta se existe um projeto anterior na mesma disciplina, pela convenção `NNN-slug`
(ex: `disciplinas/04-criacao-de-agentes/projects/002-runtime` → anterior é `001-contratos`;
`disciplinas/06-aiops-engenharia-agentica/projects/002-*` → anterior é `001-*`). Isso independe
do nome da disciplina — funciona para qualquer trilha que reaproveite o projeto `NNN-1` como base
do `NNN` (padrão já visto em `04-criacao-de-agentes` e `06-aiops-engenharia-agentica`).

```bash
DISC_DIR=$(dirname "$PROJECT")
NUM=$(basename "$PROJECT" | grep -oE '^[0-9]+')
PREV=""
if [ -n "$NUM" ]; then
  PREV_NUM=$(printf "%03d" $((10#$NUM - 1)))
  PREV=$(find "$DISC_DIR" -maxdepth 1 -type d -name "${PREV_NUM}-*" | head -1)
fi
echo "PREV=$PREV"
```

**Se `PREV` vier vazio** (projeto standalone, sem predecessor), dump completo de sempre:
```bash
find "$PROJECT" -type f \
  ! -path "*/node_modules/*" ! -path "*/.venv/*" ! -path "*/__pycache__/*" \
  ! -name "package-lock.json" \
  ! -name "yarn.lock" \
  ! -name "*.lock" \
  ! -name ".DS_Store" \
  ! -name "README.md" \
  ! -name ".env" ! -name ".env.*" \
  | sort | while read f; do printf "\n=== %s ===\n" "$f"; cat "$f"; done
```

`.env`/`.env.*` ficam de fora do dump por padrão: são segredos (API keys, tokens) e imprimi-los no
contexto é um risco mesmo quando o arquivo já está no `.gitignore` e nunca seria commitado — "não vai
pro git" não é o mesmo que "seguro imprimir". Se o `.env` tiver alguma variável não-sensível que
realmente precise aparecer no README (ex: nome de uma env var esperada, sem o valor), citar isso à mão
depois de ler o arquivo separadamente — nunca via dump automático.

**Se `PREV` existir** (projeto incremental): o conteúdo pedagógico da aula é o *delta* em relação
ao anterior — o resto é runtime herdado que já foi documentado no README de `PREV`. Reler e recitar
tudo de novo é ruído e é a causa mais comum de dump grande demais (>100KB, trunca na primeira leitura).
Dump só do que mudou estruturalmente + conteúdo completo dos arquivos novos/alterados:
```bash
diff -rq "$PREV" "$PROJECT" -x ".venv" -x "__pycache__" -x ".DS_Store" -x "README.md" -x "README.original.md" -x "*.lock" -x ".env" -x ".env.*"

echo "=== Conteúdo completo dos arquivos novos/alterados ==="
{
  diff -rq "$PREV" "$PROJECT" -x ".venv" -x "__pycache__" -x ".DS_Store" -x "README.md" -x "README.original.md" -x "*.lock" -x ".env" -x ".env.*" \
    | grep "^Only in $PROJECT" | sed "s|^Only in ||;s|: |/|"
  diff -rq "$PREV" "$PROJECT" -x ".venv" -x "__pycache__" -x ".DS_Store" -x "README.md" -x "README.original.md" -x "*.lock" -x ".env" -x ".env.*" \
    | grep " differ\$" | awk '{print $4}'
} | while read f; do
  if [ -d "$f" ]; then
    find "$f" -type f ! -path "*/.venv/*" ! -path "*/__pycache__/*" ! -name ".DS_Store" \
      | while read sf; do printf "\n=== %s ===\n" "$sf"; cat "$sf"; done
  else
    printf "\n=== %s ===\n" "$f"; cat "$f"
  fi
done
```

Se essa segunda seção vier vazia mesmo com `PREV` existindo (ex: 002 reaproveitou 001 byte a byte, sem
mudar código), o delta é conceitual, não de arquivo — ler o README de `PREV` e escrever a Descrição em
cima do que a aula explorou de diferente sobre o mesmo runtime, sem inventar um "o que mudou" que não existe.

Se mesmo assim o dump vier grande e a primeira leitura vier truncada (`[Truncated: PARTIAL view...]`),
usar `Read` com `offset`/`limit` paginado até cobrir tudo — não escrever o README com base numa página parcial.

### 3. Preserva o README existente (mecânico, sem julgamento) e escreve o novo

```bash
if [ -f "$PROJECT/README.md" ] && [ ! -f "$PROJECT/README.original.md" ]; then
  cp "$PROJECT/README.md" "$PROJECT/README.original.md"
  echo "Original preservado em $PROJECT/README.original.md"
fi
```

Sempre rode isso antes de escrever, sem exceção — mesmo que o README pareça boilerplate de scaffold. Se `README.original.md` já existir, não mexer nele (é a cópia original; rodar o comando de novo não sobrescreve).

Escreve o novo `README.md` baseando-se exclusivamente no output do passo 2. Não inventar.

**A estrutura canônica é [`shared/templates/README_TEMPLATE.md`](../../shared/templates/README_TEMPLATE.md) — leia o arquivo.**

Três notas que o template não cobre:

- **O delta do passo 2 é estratégia de leitura, não de escrita.** Ele existe para você não reler os arquivos herdados que já foram documentados em `PREV`. O README **não** abre comparando com a aula anterior: uma linha dizendo o que a aula acrescenta basta, e a narrativa da evolução mora no índice da disciplina.
- **Só `Contexto`, `Descrição`, `Tecnologias`, `Como executar`, `Conceitos` e `Aprendizados` são obrigatórios.** As demais entram quando têm o que dizer.
- **Se existir `README.original.md`**, acrescente ao final:
  `> Conteúdo original do README preservado em [`README.original.md`](./README.original.md).`

### 4. Atualiza o índice raiz

Lê o `README.md` raiz, adiciona o projeto na seção e tema corretos, atualiza a contagem de projetos.

- Se a disciplina ainda não tiver linha na tabela `## Disciplinas` nem seção própria, crie as duas (nova linha na tabela + `## NN · <Nome da disciplina>` com pelo menos um tema).

### 5. Commit 1 — documentação

```bash
git add "$PROJECT/README.md" README.md
git commit -m "feat: adiciona $ARGUMENTS (<título resumido>) Finalizado em: DD/MM/AAAA"
git push
```

### 6. Commit 2 — código-fonte

```bash
git ls-files --others --exclude-standard -- "$PROJECT" | grep -vx "${PROJECT#./}/README.md" | xargs -r git add
git commit -m "feat: adiciona $ARGUMENTS (<título resumido>) Finalizado em: DD/MM/AAAA"
git push
```

Use a data atual do `currentDate` do contexto de sessão.
Artefatos indesejados (`node_modules/`, `*.sqlite`, lock files, `.DS_Store`) são ignorados pelo `.gitignore` raiz.
