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

**A estrutura canônica é [`shared/templates/README_TEMPLATE.md`](../../shared/templates/README_TEMPLATE.md) — leia o arquivo.** Ele traz a ordem das seções,
quais são obrigatórias e a voz de cada uma. Não mantenha uma segunda cópia da estrutura aqui:
duas fontes da verdade divergem, e foi assim que a disciplina 06 saiu do padrão.

**Voz do README** — o modelo são os 39 READMEs padronizados das disciplinas 01–05. O README é material de consulta do autor: storytelling da evolução dos estudos, fonte dos conceitos da aula e guia de execução do projeto. **Não é relatório da sessão que o escreveu.**

- **Nada que você descobriu rodando o projeto entra no README.** Cota de tokens, rate limit, troca de modelo, `max_tokens`, `sys.path`, truncamento de painel, exit code, teste vermelho, quantas execuções cabem numa cota — tudo isso é assunto do chat. Vale para todas as seções, não só `Aprendizados`.
- **Sem números de execução.** Tokens consumidos, tempo de parede, `N passed`, variação entre runs ("em 7 execuções…", "o que muda é o texto") não aparecem em nenhum dos 39 READMEs de referência, nem nos que chamam OpenAI, OpenRouter ou Gemini. Envelhecem em semanas e não ajudam quem volta para consultar.
- **O README apresenta o exemplo; não o julga.** Sem crítica ao material da aula, ao fixture, ao nome de uma tool ou ao enunciado da task; sem ressalvas sobre o que o exemplo deixou de fazer; sem narrar correções feitas no caminho. Isso vale para o resumo do `>`, para a `Descrição`, para `Como funciona` e para `Conceitos trabalhados` tanto quanto para `Aprendizados`.
- **`Aprendizados`: de dois a cinco bullets, uma frase cada, sobre o assunto DA AULA.** Se a aula é sobre observabilidade preditiva, os bullets falam de PromQL, janela de ação e projeção de série temporal. Teste antes de salvar: **um bullet que faria igual sentido no README de outra aula qualquer não é aprendizado desta aula.**
- **Leia dois READMEs da disciplina 02 ou 04 antes de escrever** (`002-langchain-intro`, `006-rag-neo4j-students-z`, `007-doc-analysis`, `001-contratos`) e escreva no mesmo registro — *"modelos de visão leem PDF direto via `data:application/pdf;base64`, sem converter para texto antes"*, *"usar o schema real do banco no prompt reduz erros de property inexistente"*.
- **Não invente seções.** A ordem canônica e a lista de obrigatórias estão no fim do template. `Real vs. simulado`, `Saída esperada`, `Medição`, `Herança`, `O que faria diferente` e parentes não existem nas disciplinas 01–05 — foram tentadas na 06 e é de onde veio a degradação. O que o exemplo simula se declara no item de `Tecnologias e Ferramentas` (*"**Trivy** — apenas o formato do relatório; o binário não é instalado"*); o que a aula acrescenta à trilha cabe em **uma linha** da `Descrição`.
- **Calibre pelo padrão do repositório, não pelo README anterior da mesma trilha.** Tomar o `NNN-1` como régua faz cada aula crescer sobre a anterior.


**Disciplina 07** — o projeto tem um `ENTREGA.md` ao lado. Ele é **fonte** para a `Descrição` e os
`Conceitos trabalhados`, e **nunca** conteúdo: falhas do V1, comparação V1×V2, anti-padrão e números
medidos não atravessam para o README. Em `Como executar`, descreva como reproduzir a execução
(`/roda-prompt NNN v1`), não o que o output deu.

### 4. Atualiza o índice raiz

Lê o `README.md` raiz, adiciona o projeto na seção e tema corretos, atualiza a contagem de projetos.

- Se a disciplina ainda não tiver linha na tabela `## Disciplinas` nem seção própria, crie as duas (nova linha na tabela + `## NN · <Nome da disciplina>` com pelo menos um tema).
- **A linha do índice descreve o que o projeto é e o que ele demonstra** — mesma voz do resumo do `>`. Não é lugar de veredito sobre o exemplo ("o portão quase nunca decide", "o mesmo arquivo devolve quatro totais diferentes"), de resultado medido, nem de configuração de runtime (nome de modelo, env var) — a menos que o modelo seja o assunto do projeto, como nas aulas de Ollama e OpenRouter da disciplina 01.

### 5. Commit + push

```bash
git add "$PROJECT/README.md" README.md
git commit -m "feat: adiciona $ARGUMENTS (<título resumido>) Finalizado em: DD/MM/AAAA"
git push
```

Use a data atual do `currentDate` do contexto de sessão.
Apenas o README do projeto e o README raiz entram neste commit. Arquivos-fonte são responsabilidade do `/commit-projeto`.
