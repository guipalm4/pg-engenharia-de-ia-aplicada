# Exemplo 004 — Reduzindo o MTTR com Inteligência Agêntica

> Crew de dois papéis que investiga um incidente pelo framework ReAct — métricas, traces e logs — e devolve o hotfix em YAML: o agente deixa de construir infraestrutura e passa a consertá-la.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Este projeto evolui o [003 — Orquestração SRE Assistida por IA](../003-orquestracao-sre-assistida-por-ia), onde o pipeline *construía*: gerava o manifesto, aplicava no cluster e decidia o rollout. O delta da aula é a inversão do sentido — aqui o pipeline **investiga o que já quebrou** e propõe a correção. A métrica que dá nome à aula é o **MTTR** (*Mean Time To Recovery*): o tempo entre o incidente e o restabelecimento.

Três coisas são novas. Um quarto papel em `core/agents.py`, o `get_oncall_sre()` — SRE de plantão cuja *backstory* diz explicitamente "Especialista em ReAct. Você pensa antes de agir" — e que é o primeiro agente da trilha com `allow_delegation=True`. Dois novos módulos de tools: `tools/k8s_diag.py` (inspeção de pod e sugestão de correção) e `tools/obs_tools.py` (Prometheus e Jaeger). E um novo entrypoint, `troubleshooting.py`, com uma `Crew` de **duas** tasks: diagnosticar e corrigir.

O ciclo de *self-healing* que a aula 002 apenas insinuou aqui se fecha de ponta a ponta. O SRE correlaciona três fontes — métrica (`query_prometheus_metrics`), trace (`query_jaeger_traces`) e log/evento do pod (`inspect_pod_failure`) — chega a uma causa raiz, e o **Arquiteto** grava o hotfix em `checkout-k8s-fix.yaml` via `write_file`. O diagnóstico de um agente vira o input de outro.

A diferença de mecânica em relação ao 003 está em **quem escreve o YAML**. No 003, `generate_k8s_manifest` montava o manifesto por template f-string e o LLM só fornecia três valores. Aqui é o LLM que redige o manifesto inteiro, e `write_file` grava o que vier. Por isso as cinco regras estritas no prompt da segunda task — imagem, porta, `path` do probe, `initialDelaySeconds` — **são de fato necessárias** nesta aula, ao contrário das que removi do 003.

O `checkout-k8s-fix.yaml` versionado aqui é **saída do agente**, não código escrito à mão.

> ℹ️ **Runtime atualizado na aula 005.** O modelo agora vem de `GROQ_MODEL` no `.env` (default `qwen/qwen3.6-27b`, no lugar do `openai/gpt-oss-20b`), `max_tokens` deixou de ser capado (a Groq debita o consumo real, não o teto pedido — capar não economizava cota e arriscava truncar) e o retry de rate limit passou a ler os formatos de tempo compostos da Groq (`3m9.648s`), que antes caíam num fallback curto demais e matavam o pipeline. Detalhes em [005 · Aprendizados](../005-observabilidade-preditiva/README.md#aprendizados).

## Tecnologias e Ferramentas

- [x] **Python 3.12** — runtime dos agentes
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — orquestração `Agent`/`Task`/`Crew` em processo sequencial, com delegação habilitada
- [x] **ReAct** — o padrão de raciocínio pedido ao SRE: observar, pensar, agir, repetir
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** (`qwen/qwen3.6-27b`, trocável por `GROQ_MODEL` no `.env`) — motor de inferência dos agentes (free tier)
- [x] **Kubernetes / `kubectl`** — onde o incidente é reproduzido e o hotfix validado
- [x] **Prometheus e Jaeger** — fontes de observabilidade, aqui **simuladas** por tools que devolvem resposta roteirizada
- [x] **pytest** — testes dos helpers de decisão e da limpeza de cercas
- [x] **uv (workspace)** — ambiente único compartilhado por todas as aulas da disciplina

## Pré-requisitos

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python e as dependências
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`)
- **`kubectl` (opcional)** apontando para um **cluster descartável** (kind/minikube) — necessário só para reproduzir o incidente e validar o hotfix; o pipeline em si roda sem cluster

> ⚠️ Esta é a aula mais cara da trilha, por causa do `allow_delegation=True`. Com o modelo padrão atual (`qwen/qwen3.6-27b`) são **~4.900 tokens por execução**, dentro do teto de 8.000/minuto do free tier. Com o antigo `openai/gpt-oss-20b` eram ~8.900, e o run estourava o limite sozinho. Se mesmo assim bater em rate limit, o `RateLimitAwareLLM` (`core/llm_config.py`) segura o pipeline pausando e imprime `⏳ Limite de tokens/minuto da Groq atingido` — é a proteção funcionando, não erro.

## Como executar

```bash
cd disciplinas/06-aiops-engenharia-agentica/projects

# setup (uma vez para todas as aulas)
cp .env.example .env && $EDITOR .env   # cole a GROQ_API_KEY
uv sync --all-packages

cd 004-reduzindo-mttr-com-inteligencia-agentica

# 1. reproduza o incidente no cluster (opcional, mas é o que dá sentido à aula)
kubectl config current-context          # confirme que é um cluster descartável
kubectl apply -f checkout-broken.yaml
kubectl get pods -l app=checkout-api    # deve aparecer ErrImagePull / ImagePullBackOff

# 2. rode o SRE de plantão: diagnóstico + hotfix
uv run troubleshooting.py

# 3. aplique o hotfix que o agente gerou e confirme a recuperação
kubectl apply -f checkout-k8s-fix.yaml
kubectl get deploy checkout-api

# 4. limpe o cenário
kubectl delete -f checkout-k8s-fix.yaml

# testes (não precisam de cluster nem de API key)
uv run pytest -v
```

## Estrutura do Projeto

```
004-reduzindo-mttr-com-inteligencia-agentica/
├── troubleshooting.py            # entrypoint: Crew sequencial (diagnosticar → corrigir)
├── checkout-broken.yaml          # cenário do incidente: tag de imagem inexistente
├── checkout-k8s-fix.yaml         # artefato GERADO pelo agente (sobrescrito a cada run)
├── core/
│   ├── agents.py                 # + get_oncall_sre()  ← novo papel, com allow_delegation
│   └── llm_config.py             # Groq + RateLimitAwareLLM (herdado)
├── tools/
│   ├── k8s_diag.py               # ← NOVO: inspect_pod_failure, suggest_fix
│   ├── obs_tools.py              # ← NOVO: query_prometheus_metrics, query_jaeger_traces
│   ├── file_writer.py            # write_file — limpeza de cercas corrigida nesta aula
│   ├── k8s_ops.py                # herdado da 003 — não usado neste pipeline
│   ├── security_scan.py          # herdado da 002 — não usado neste pipeline
│   └── policy_rag.py             # herdado da 001 — não usado neste pipeline
├── tests/
│   ├── test_file_writer.py       # regressão da limpeza de cercas (o bug desta aula)
│   └── test_k8s_ops.py           # herdado da 003; as tools continuam no diretório
└── pyproject.toml
```

## Como funciona

```
troubleshooting.py
   │
   ├─ sre_oncall = get_oncall_sre(tools=[inspect_pod_failure, suggest_fix,
   │                                     query_prometheus_metrics, query_jaeger_traces])
   ├─ architect  = get_architect(tools=[write_file])
   │
   └─ Crew(process=sequential).kickoff()
            │
            ├── Task 1 — SRE On-Call  (diagnóstico ReAct)
            │      "usuários reportam lentidão e erros no checkout"
            │            │
            │            ├─ query_prometheus_metrics("error rate", "latency")
            │            │     └─ 📊 latência 850ms (P99 estourado) · erro 5XX em 12%
            │            ├─ query_jaeger_traces("checkout-api")
            │            │     └─ 🔍 gargalo na chamada ao PostgreSQL (span 800ms)
            │            ├─ inspect_pod_failure("checkout-api")
            │            │     └─ eventos + logs do pod
            │            └─ suggest_fix(tipo_do_problema)
            │                  └─ remediação correspondente
            │                        │
            │                        ▼
            │                 relatório de incidente (causa raiz + correção)
            │
            └── Task 2 — Arquiteto  (self-healing)
                   recebe o relatório como contexto
                        │
                        └─ write_file(content, "checkout-k8s-fix.yaml")
                              └─ remove a cerca de markdown e grava o YAML
                                    │
                                    ▼
                              manifesto pronto para `kubectl apply`
```

1. **Correlação** — o SRE não tem uma única fonte de verdade: métrica diz *que* está ruim, trace diz *onde*, log diz *por quê*. O papel do ReAct é encadear as três antes de concluir.
2. **Decisão** — `suggest_fix` mapeia tipo de problema para remediação por dicionário; a escolha do *tipo* é do LLM, a remediação é determinística.
3. **Self-healing** — a `Task 2` recebe o relatório da `Task 1` como contexto do processo sequencial, e o Arquiteto redige o manifesto corrigido.
4. **Persistência** — `write_file` grava o YAML. Como o LLM redige o manifesto inteiro aqui (não há template), a limpeza de cerca de markdown é o que separa um arquivo válido de um arquivo corrompido.

## Conceitos trabalhados

- [x] **MTTR como objetivo de design** — o pipeline inteiro existe para encurtar o intervalo entre incidente e recuperação, não para produzir artefato novo
- [x] **ReAct** — observar → pensar → agir → repetir, pedido explicitamente no prompt e na *backstory* do agente
- [x] **Correlação de sinais de observabilidade** — métrica, trace e log respondem perguntas diferentes; a causa raiz sai do cruzamento
- [x] **Self-healing entre agentes** — o diagnóstico de um papel vira o input de outro, fechando o loop que a 002 só insinuou
- [x] **Delegação entre agentes** — `allow_delegation=True` deixa o SRE acionar o Arquiteto, e cobra por isso em chamadas de LLM
- [x] **Guardrail no prompt quando não há guardrail no código** — sem template, as regras estritas do prompt passam a ser a única defesa
- [x] **Acúmulo como método** — quatro papéis e seis módulos de tools convivem; cada pipeline compõe o subconjunto de que precisa

## Aprendizados

- [x] **O `write_file` corrompia YAML, e só esta aula revelou isso.** A tool nasceu na 002 limpando cercas com `.replace("```hcl","").replace("```","")` — o que funciona para HCL e falha para qualquer outra linguagem: com ```yaml, a palavra `yaml` sobrava como primeira linha e o manifesto ficava inválido. A 004 é a primeira aula a gravar YAML por essa tool. *Correção:* limpeza agnóstica de linguagem por regex, com teste de regressão. Um detalhe apareceu ao testar: exigir que a cerca de fechamento esteja em linha própria, senão um conteúdo terminado em crases inline perde texto.
- [x] **O guardrail do prompt aqui é legítimo — e isso não contradiz a aula 003, completa.** No 003 removi avisos em caixa alta porque o template f-string tornava impossível violá-los: pedir ao LLM o que o código já garante é ruído. Aqui não há template, o LLM redige o manifesto inteiro, e as cinco regras (`kind: Deployment`, `nginx:latest`, porta 80, `path: /`, `initialDelaySeconds`) são a única coisa entre o agente e um YAML quebrado. A regra não é "guardrail em prompt é ruim"; é **guardrail em prompt é o que sobra quando não dá para codificar a restrição**.
- [x] **O diagnóstico é roteirizado, e contradiz o incidente real.** `inspect_pod_failure` decide a resposta por *substring do nome do pod*: qualquer nome contendo `api` recebe "Cannot connect to database... Back-off restarting". Mas o `checkout-broken.yaml` que a aula manda aplicar produz **`ErrImagePull`**, por tag de imagem inexistente — problema completamente diferente. O agente "diagnostica" uma falha de banco num pod que na verdade não consegue baixar a imagem, e o hotfix funciona por acidente: o prompt obriga `nginx:latest`, que por tabela conserta a imagem quebrada. É a mesma fragilidade do OPA por substring da 002 e do canário por regex da 003, agora com uma consequência mais visível — o cenário no cluster e a resposta da ferramenta contam histórias diferentes.
- [x] **`allow_delegation=True` custa caro e quase inviabilizou a aula no free tier.** Medido com o `openai/gpt-oss-20b` que era o padrão na época: 7 chamadas ao LLM, **8.870 tokens por execução**, com pior janela de 60 segundos em **8.041** — acima do teto de 8.000 tokens/minuto da Groq. Um único run estourava o limite sozinho e só terminava porque o `RateLimitAwareLLM` pausava e repetia, levando ~70s em vez de ~3s. A delegação não é gratuita: ela adiciona ferramentas de coordenação ao prompt de cada agente e multiplica as idas ao modelo. *Atualização (aula 005):* trocar o padrão para `qwen/qwen3.6-27b` derrubou o mesmo pipeline para **4.924 tokens** — a delegação continua cara, mas cabe no orçamento. O gargalo era metade delegação, metade escolha de modelo.
- [x] **Observabilidade simulada ensina a correlação, não a instrumentação.** As tools de Prometheus e Jaeger devolvem string fixa, então a aula treina o raciocínio de cruzar três sinais — que é transferível — mas não expõe o trabalho real de escrever PromQL correto, lidar com cardinalidade ou amostragem de traces. Vale saber onde a simulação termina.

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [ReAct — Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [Kubernetes — Debug Running Pods](https://kubernetes.io/docs/tasks/debug/debug-application/debug-running-pod/)
- [Kubernetes — Images e política de pull](https://kubernetes.io/docs/concepts/containers/images/)
- [Prometheus — Querying basics (PromQL)](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Jaeger — Distributed tracing](https://www.jaegertracing.io/docs/)
- [Google SRE Book — Effective Troubleshooting](https://sre.google/sre-book/effective-troubleshooting/)
