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
# A disciplina 07 NÃO é incremental: cada módulo tem prompt e input próprios.
case "$PROJECT" in *07-ferramentas-de-IA*) PREV=""; echo "disciplina 07 -> PREV zerado (sem herança de código)";; esac
```

**Disciplina 07 — duas diferenças que mudam este passo:**

- **`PREV` é sempre vazio.** A numeração é sequencial, mas `NNN` não parte de `NNN-1`: o que se
  acumula entre os módulos é o estado do case RouteWise, não arquivo. Rodar o delta aqui compararia
  dois módulos sem relação e produziria ruído.
- **`ENTREGA.md` entra no dump como fonte, nunca como conteúdo.** Ele diz o que você exercitou e
  qual foi o insumo — use isso para escrever a `Descrição` e os `Conceitos trabalhados`. **Não
  transponha nada dele**: as falhas do V1, a comparação V1×V2, o anti-padrão e qualquer número
  medido ficam onde estão. É exatamente o material que o template proíbe no README.


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

**Voz do README** — o modelo são os 39 READMEs padronizados das disciplinas 01–05. O README é material de consulta do autor: storytelling da evolução dos estudos, fonte dos conceitos da aula e guia de execução do projeto. **Não é relatório da sessão que o escreveu.**

- **Nada que você descobriu rodando o projeto entra no README.** Cota de tokens, rate limit, troca de modelo, `max_tokens`, `sys.path`, truncamento de painel, exit code, teste vermelho, quantas execuções cabem numa cota — tudo isso é assunto do chat. Vale para todas as seções, não só `Aprendizados`.
- **Sem números de execução.** Tokens consumidos, tempo de parede, `N passed`, variação entre runs ("em 7 execuções…", "o que muda é o texto") não aparecem em nenhum dos 39 READMEs de referência, nem nos que chamam OpenAI, OpenRouter ou Gemini. Envelhecem em semanas e não ajudam quem volta para consultar.
- **O README apresenta o exemplo; não o julga.** Sem crítica ao material da aula, ao fixture, ao nome de uma tool ou ao enunciado da task; sem ressalvas sobre o que o exemplo deixou de fazer; sem narrar correções feitas no caminho. Isso vale para o resumo do `>`, para a `Descrição`, para `Como funciona` e para `Conceitos trabalhados` tanto quanto para `Aprendizados`.
- **`Aprendizados`: de dois a cinco bullets, uma frase cada, sobre o assunto DA AULA.** Se a aula é sobre observabilidade preditiva, os bullets falam de PromQL, janela de ação e projeção de série temporal. Teste antes de salvar: **um bullet que faria igual sentido no README de outra aula qualquer não é aprendizado desta aula.**
- **Leia dois READMEs da disciplina 02 ou 04 antes de escrever** (`002-langchain-intro`, `006-rag-neo4j-students-z`, `007-doc-analysis`, `001-contratos`) e escreva no mesmo registro — *"modelos de visão leem PDF direto via `data:application/pdf;base64`, sem converter para texto antes"*, *"usar o schema real do banco no prompt reduz erros de property inexistente"*.
- **Não invente seções.** A ordem canônica e a lista de obrigatórias estão no fim do template. `Real vs. simulado`, `Saída esperada`, `Medição`, `Herança`, `O que faria diferente` e parentes não existem nas disciplinas 01–05 — foram tentadas na 06 e é de onde veio a degradação. O que o exemplo simula se declara no item de `Tecnologias e Ferramentas` (*"**Trivy** — apenas o formato do relatório; o binário não é instalado"*); o que a aula acrescenta à trilha cabe em **uma linha** da `Descrição`.
- **Calibre pelo padrão do repositório, não pelo README anterior da mesma trilha.** Tomar o `NNN-1` como régua faz cada aula crescer sobre a anterior.

Duas notas que o template não cobre:

- **O delta do passo 2 é estratégia de leitura, não de escrita.** Ele existe para você não reler os arquivos herdados que já foram documentados em `PREV`. O README **não** abre comparando com a aula anterior: uma linha dizendo o que a aula acrescenta basta, e a narrativa da evolução mora no índice da disciplina.
- **Se existir `README.original.md`**, acrescente ao final:
  `> Conteúdo original do README preservado em [`README.original.md`](./README.original.md).`

### 4. Atualiza o índice raiz

Lê o `README.md` raiz, adiciona o projeto na seção e tema corretos, atualiza a contagem de projetos.

- Se a disciplina ainda não tiver linha na tabela `## Disciplinas` nem seção própria, crie as duas (nova linha na tabela + `## NN · <Nome da disciplina>` com pelo menos um tema).
- **A linha do índice descreve o que o projeto é e o que ele demonstra** — mesma voz do resumo do `>`. Não é lugar de veredito sobre o exemplo ("o portão quase nunca decide", "o mesmo arquivo devolve quatro totais diferentes"), de resultado medido, nem de configuração de runtime (nome de modelo, env var) — a menos que o modelo seja o assunto do projeto, como nas aulas de Ollama e OpenRouter da disciplina 01.

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
