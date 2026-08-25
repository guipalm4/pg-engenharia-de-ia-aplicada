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

**Régua de tamanho e voz** — medida nos READMEs das disciplinas 01–05, que são o padrão do repositório:

| Alvo | Limite |
|---|---|
| README inteiro | ≤ 1.600 palavras |
| `## Aprendizados` | 4–6 bullets de **uma frase**, ≤ 200 palavras no total |
| Linha do projeto no índice raiz | ≤ 60 palavras |

- **`Aprendizados` explica o que o exemplo ensina — não julga o exemplo.** Cada bullet é um conhecimento técnico transferível, afirmativo e curto, no tom dos que já existem no repositório: *"o RAG só funciona bem se o chunking for adequado ao documento"*, *"MCP = o que o agente pode fazer; skill = como ele deve fazer"*, *"forçar JSON estruturado não basta: é preciso um circuit breaker"*. **Não entram** achados de code review, contagem de execuções, valores medidos, crítica ao material da aula, ironia sobre nomes de tools, nem ressalvas sobre o que o exemplo deixou de fazer. Isso é conversa para o chat com o usuário, não conteúdo de documento.
- **Não invente seções.** A estrutura canônica é a do template. `Real vs. simulado`, `Saída esperada`, `Herança` e parentes **não existem** nas disciplinas 01–05. O que o exemplo simula cabe numa frase da `Descrição`; o que aparece quando funciona cabe numa frase no fim de `Como executar`; o que a aula acrescenta à trilha cabe num parágrafo da `Descrição`.
- **Calibre pelo padrão do repositório, não pelo README anterior da mesma trilha.** Antes de escrever, abra dois READMEs de disciplinas 01–05 e use-os como referência de tom e tamanho. Tomar o `NNN-1` como régua faz cada aula crescer sobre a anterior: na disciplina 06 isso levou `Aprendizados` de 87 palavras (aula 001) a 1.302 (aula 007), e o README inteiro de 956 a 3.242.


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
