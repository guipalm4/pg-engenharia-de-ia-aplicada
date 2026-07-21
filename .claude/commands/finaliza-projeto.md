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

```bash
find "$PROJECT" -type f \
  ! -path "*/node_modules/*" \
  ! -name "package-lock.json" \
  ! -name "yarn.lock" \
  ! -name "*.lock" \
  ! -name ".DS_Store" \
  ! -name "README.md" \
  | sort | while read f; do printf "\n=== %s ===\n" "$f"; cat "$f"; done
```

### 3. Preserva o README existente (mecânico, sem julgamento) e escreve o novo

```bash
if [ -f "$PROJECT/README.md" ] && [ ! -f "$PROJECT/README.original.md" ]; then
  cp "$PROJECT/README.md" "$PROJECT/README.original.md"
  echo "Original preservado em $PROJECT/README.original.md"
fi
```

Sempre rode isso antes de escrever, sem exceção — mesmo que o README pareça boilerplate de scaffold. Se `README.original.md` já existir, não mexer nele (é a cópia original; rodar o comando de novo não sobrescreve).

Escreve o novo `README.md` baseando-se exclusivamente no output do passo 2. Não inventar.

```
# Exemplo NNN — <Título descritivo>
> <Uma frase: o que demonstra + tecnologia principal>

## Contexto
- Disciplina / Período / Autor: guipalm4

## Descrição
<2–4 parágrafos: o que faz, qual problema resolve, relação com a disciplina>

## Tecnologias e Ferramentas
- [x] <tecnologia>

## Pré-requisitos          ← só se houver setup especial (API keys, flags de browser, etc.)

## Como executar
\`\`\`bash
<comandos>
\`\`\`

## Estrutura do Projeto    ← só se houver mais de 2–3 arquivos
<árvore comentada>

## Como funciona           ← obrigatório se a lógica não for óbvia
<pseudocódigo ou diagrama textual>

## Conceitos trabalhados
- [x] **<conceito>** — <como aparece no código>

## Aprendizados
- [x] <insight concreto>

## Documento Original          ← só se existir README.original.md
> Conteúdo original do README (scaffold ou material do professor) preservado em [`README.original.md`](./README.original.md).

## Referências
- [nome](url)
```

Seções marcadas com `←` são opcionais; as demais são obrigatórias.

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
