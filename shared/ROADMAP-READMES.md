# Roadmap — adequar os READMEs ao template revisado

Retrofit dos READMEs da disciplina 06 ao [`templates/README_TEMPLATE.md`](templates/README_TEMPLATE.md)
revisado em 24/08/2026. A **007** já está adequada e serve de referência viva.

Marque `[x]` conforme concluir. Uma aula por sessão é o ritmo natural — as tarefas
da Faixa B custam cota da Groq.

---

## O que mudou no template

| Seção | Situação nos READMEs 001–006 |
|---|---|
| `Herança` (2 linhas, substitui a narrativa de delta) | nenhum tem — seis abrem narrando a evolução |
| `Saída esperada` | **0 de 6** |
| `Real vs. simulado` | **0 de 6** (001 e 006 tocam no assunto no meio do texto) |
| `O que faria diferente` | **0 de 6** |
| `Medição` datada e versionada | **0 de 6** — nenhum registra data nem versão |

Regra que atravessa tudo: **separe o achado (durável) do número que o produziu
(perecível)**. Achado nos `Aprendizados`, número em `Medição`.

---

## Duas faixas de trabalho

O que decide o esforço não é o tamanho do README — é **se a tarefa exige rodar o
pipeline de novo**.

**Faixa A — mesa.** Não roda nada, não gasta cota, não precisa de cluster.
`Herança` · reescrever a abertura da `Descrição` · `O que faria diferente` ·
mover números já existentes para o bloco `Medição`.

**Faixa B — execução.** Exige rodar e observar.
`Saída esperada` · `Medição` nova, datada e versionada · confirmar `Real vs. simulado`
contra o código.

> ⚠️ **Planeje a cota.** O teto da Groq é de 200.000 tokens/dia **por modelo**.
> Uma bateria de Faixa B em várias aulas no mesmo dia esgota o orçamento do modelo
> padrão. Meça a aula-alvo no `qwen/qwen3.6-27b` (é o número que vai para o README)
> e use `GROQ_MODEL=groq/openai/gpt-oss-120b` para qualquer teste exploratório —
> orçamento separado.

---

## Ordem sugerida

A ordem é por **risco para quem reusa o código**, não por número da aula.

### 1. `003-orquestracao-sre-assistida-por-ia` — prioridade máxima

O maior risco de reuso do repositório. É a única aula que **muta um cluster de
verdade** (`kubectl apply`), e o README tem **zero** menções a simulação — o
canário e as métricas que decidem o rollout são sintéticos. Quem copiar aquele
código pode achar que a decisão de rollout é real.

- [x] **Faixa A** — `Real vs. simulado`: `kubectl apply` **real** (com allowlist de contextos) · métricas de canário **simuladas** · limiares determinísticos **reais** · manifesto por template, não gerado por LLM
- [x] **Faixa A** — `Herança` + reescrever abertura da `Descrição`
- [x] **Faixa A** — `O que faria diferente`
- [ ] **Faixa B** — `Saída esperada`: **dois** cenários, com e sem cluster (a degradação graciosa é comportamento documentado e ninguém diz como ela se parece)
- [ ] **Faixa B** — `Medição` (não existe nenhuma hoje)

> Precisa de `kind`/`minikube` para o caminho completo. Se não tiver cluster à mão,
> faça a Faixa A e a `Medição`, e deixe a `Saída esperada` do caminho com cluster
> marcada como pendente — melhor um README honesto sobre a lacuna.

### 2. `002-geracao-auditoria-e-self-healing-com-IA`

Roda **Checkov de verdade** por `subprocess` e um **OPA falso** por substring, no
mesmo pipeline, e o README não separa os dois. Segundo maior risco de leitura
errada.

- [ ] **Faixa A** — `Real vs. simulado`: Checkov **real** (binário, via `uv run`) · OPA **simulado** (casamento de substring) · `main.tf` gravado em disco **real**
- [ ] **Faixa A** — `Herança` + abertura da `Descrição`
- [ ] **Faixa A** — `O que faria diferente`
- [ ] **Faixa B** — `Saída esperada` (inclui o `main.tf` gerado — dizer que o conteúdo varia)
- [ ] **Faixa B** — `Medição` (não existe nenhuma hoje)

### 3. `004-reduzindo-mttr-com-inteligencia-agentica` — tem contradição a resolver

Dois números conflitantes sobre a mesma aula:

| Fonte | Diz |
|---|---|
| README da 004, linha 43 | *"Com o modelo padrão atual (`qwen/qwen3.6-27b`) são **~4.900 tokens**"* |
| README da disciplina, tabela | *"~8.900 · `gpt-oss-20b` · **A 004 não foi remedida** depois da troca de modelo"* |

A 004 **foi** remedida; o índice afirma que não. Nenhum dos dois é datado — é
exatamente o apodrecimento que o bloco `Medição` existe para evitar.

- [ ] **Faixa A** — `Medição` com os dois números: o atual como corrente, o `gpt-oss-20b` como **histórico**, ambos datados
- [ ] **Faixa A** — corrigir a linha da 004 na tabela do README da disciplina
- [ ] **Faixa A** — `Real vs. simulado`: Prometheus, Jaeger e eventos de pod **todos simulados** (o README já admite isso num Aprendizado — promover a seção própria) · gravação do hotfix em YAML **real**
- [ ] **Faixa A** — `Herança` + abertura da `Descrição` + `O que faria diferente`
- [ ] **Faixa B** — `Saída esperada`; confirmar o número atual (é a aula mais cara, com `allow_delegation=True` — reserve cota)

### 4. `005-observabilidade-preditiva`

Tem medição (`1.900–3.500 tokens, 4 chamadas, ~7s`) e é o README com **mais
menções a modelo específico da trilha: 13**. É o que mais ganha com a separação
achado/número.

- [ ] **Faixa A** — `Medição` datada; tirar do texto as 13 menções que forem só medição, preservando as que são o achado
- [ ] **Faixa A** — `Real vs. simulado`: NL→PromQL **real** (gerado pelo LLM) · série temporal e "predição" **simuladas** (aritmética sobre números fixos no prompt) · JSON do dashboard **real e válido para o Grafana**
- [ ] **Faixa A** — `Herança` + abertura da `Descrição` + `O que faria diferente`
- [ ] **Faixa B** — `Saída esperada` (inclui o `incident_dashboard.json` gerado)

### 5. `006-chatops-e-human-in-the-loop`

O melhor conteúdo da trilha e o mais próximo de aderente — já trata simulação e
não-determinismo no texto. Falta promover a seções e datar.

- [ ] **Faixa A** — `Real vs. simulado`: `execute_terraform` **não executa nada**, devolve string (já está num Aprendizado — promover) · a UI é local, sem Slack
- [ ] **Faixa A** — `Medição` datada, com as duas colunas que já existem (`qwen3.6-27b` e `gpt-oss-120b`)
- [ ] **Faixa A** — `Herança` + abertura da `Descrição` + `O que faria diferente`
- [ ] **Faixa B** — `Saída esperada` — caso especial: o entrypoint é Streamlit, então descreva a **tela** e o roteiro das três mensagens que já está documentado

### 6. `001-da-automacao-a-inteligencia-agentica` — o mais barato

Sem antecessor, logo **sem `Herança`**. É o menor README (94 linhas) e o de menor
risco. Deixe por último ou use como aquecimento.

- [ ] **Faixa A** — `Real vs. simulado`: `check_compliance_rules` devolve **resposta fixa** — não é RAG, apesar do nome do módulo (`policy_rag`); o README já diz isso de passagem
- [ ] **Faixa A** — `O que faria diferente`
- [ ] **Faixa B** — `Saída esperada` + `Medição` (não existe nenhuma hoje)

---

## Fechamento

Depois das seis, um passe final:

- [ ] Reconciliar a tabela de consumo do README da disciplina com os blocos `Medição`
      de cada aula — hoje ela é a única fonte e já diverge da 004. Considerar
      transformá-la em ponteiro para os READMEs, para não haver dois lugares a manter.
- [ ] `.cursor/templates/README_TEMPLATE.md` está divergente do canônico em
      `shared/templates/`. Quatro arquivos ainda apontam para ele:
      `.cursor/rules/10-readmes.md`, `.cursor/AGENTS.md`, `disciplinas/agents.md`,
      `.claude/napkin.md`. Decidir entre transformá-lo em ponteiro de uma linha ou
      remover a stack `.cursor` (não é tocada desde 14/04/2026).
- [ ] Avaliar o retrofit nas disciplinas **04** (também incremental, `NNN` herda
      `NNN-1`) e **01/02/03/05** (standalone — sem `Herança`, mas `Real vs. simulado`
      e `Saída esperada` continuam valendo).

---

## Como verificar a aderência de um README

```bash
# da raiz do repo — troca o caminho pela aula que você acabou de mexer
P=disciplinas/06-aiops-engenharia-agentica/projects/00X-slug

diff <(grep '^## ' shared/templates/README_TEMPLATE.md | sed 's/^## //') \
     <(grep '^## ' "$P/README.md"      | sed 's/^## //')
# diferenças aceitáveis: seções condicionais que não se aplicam
#   (Herança na 001, Documento Original onde não há README.original.md,
#    Pré-requisitos onde não há setup especial)

# a Medição está datada e versionada?
grep -A1 '^## Medição' "$P/README.md"

# links relativos de pé?
grep -oE '\]\(\.\.?/[^)#]*\)' "$P/README.md" | tr -d '])(' \
  | while read l; do [ -e "$P/$l" ] || echo "QUEBRADO: $l"; done
```
