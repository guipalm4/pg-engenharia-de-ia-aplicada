# Skill: readme-projeto

Cria o README.md do projeto **$ARGUMENTS**, atualiza o índice raiz, faz commit e push.

## Passos

### 1. Descoberta do projeto (script único)

```bash
find . -maxdepth 7 -type d -name "*$ARGUMENTS*" ! -path "*/node_modules/*" | head -1
```

### 2. Dump dos arquivos-fonte (script único — leia só o output)

Substitua `$PROJECT` pelo path retornado no passo 1.

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
```bash
<comandos>
```

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

**Voz da seção `Aprendizados`** — o modelo é o dos READMEs das disciplinas 01–05:

- **Cada bullet tem que ser sobre o assunto DA AULA.** Se a aula é sobre observabilidade preditiva, os bullets falam de PromQL, janela de ação e projeção de série temporal — não de troca de modelo, cota de tokens, rate limit, `sys.path`, truncamento de painel ou qualquer incidente encontrado ao rodar o projeto. Teste antes de salvar: **um bullet que faria igual sentido no README de outra aula qualquer não é aprendizado desta aula.** Problemas de runtime que valha registrar vão para a seção onde pertencem (`Pré-requisitos`, `Como executar`) ou para o chat.
- **A seção explica o que o exemplo ensina — não julga o exemplo.** Fato técnico concreto sobre a tecnologia central do projeto, uma frase, afirmativo. Não entram achados de code review, contagem de execuções, valores medidos, crítica ao material da aula nem ressalvas sobre o que o exemplo deixou de fazer.
- **Leia dois READMEs da disciplina 02 ou 04 antes de escrever esta seção** (`002-langchain-intro`, `006-rag-neo4j-students-z`, `007-doc-analysis`, `001-contratos`) e escreva no mesmo registro — *"modelos de visão leem PDF direto via `data:application/pdf;base64`, sem converter para texto antes"*, *"usar o schema real do banco no prompt reduz erros de property inexistente"*.
- **Não invente seções.** A estrutura canônica é a do template. `Real vs. simulado`, `Saída esperada`, `Herança` e parentes não existem nas disciplinas 01–05. O que o exemplo simula cabe numa frase da `Descrição`; o que aparece quando funciona, numa frase no fim de `Como executar`; o que a aula acrescenta à trilha, num parágrafo da `Descrição`.
- **Calibre pelo padrão do repositório, não pelo README anterior da mesma trilha.** Tomar o `NNN-1` como régua faz cada aula crescer sobre a anterior.

### 4. Atualiza o índice raiz

Lê o `README.md` raiz, adiciona o projeto na seção e tema corretos, atualiza a contagem de projetos.

- Se a disciplina ainda não tiver linha na tabela `## Disciplinas` nem seção própria, crie as duas (nova linha na tabela + `## NN · <Nome da disciplina>` com pelo menos um tema).

### 5. Commit + push

```bash
git add "$PROJECT/README.md" README.md
git commit -m "feat: adiciona $ARGUMENTS (<título resumido>) Finalizado em: DD/MM/AAAA"
git push
```

Use a data atual do `currentDate` do contexto de sessão.
Apenas o README do projeto e o README raiz entram neste commit. Arquivos-fonte são responsabilidade do `/commit-projeto`.
