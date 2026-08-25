# Exemplo 003 — Orquestração SRE Assistida por IA

> Crew de três tasks que desenha um manifesto Kubernetes, faz o *sync* GitOps via `kubectl apply` e decide o destino do rollout analisando métricas de canário — o agente sai do papel de gerar código e passa a operar o cluster.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Uma `Crew` de dois papéis percorre o ciclo GitOps completo em três tasks sequenciais: o **Arquiteto** desenha o manifesto Kubernetes de um app a partir de uma especificação em linguagem natural, o **Engenheiro de SRE** faz a reconciliação chamando `kubectl apply`, e o mesmo SRE decide se o rollout segue ou é revertido, analisando métricas de canário contra limiares. O artefato (`Deployment` + `Service`) é gravado em disco e o veredito final é `Healthy` ou `Unhealthy`.

O que distingue esta aula é o **raio de ação**. As ferramentas até aqui produziam arquivos; `apply_k8s_manifest` executa `kubectl apply` num cluster de verdade — é a primeira tool do repositório com efeito fora do diretório do projeto. Por isso ela tem grade de proteção: só aplica em contextos que casem com uma **allowlist** de clusters descartáveis (`kind-*`, `minikube`, `docker-desktop`…), configurável por `K8S_ALLOWED_CONTEXTS`, avaliada antes de qualquer chamada ao cluster.

Quando o contexto é autorizado, a tool ainda **verifica se o cluster responde** (`kubectl api-versions`) e **valida o manifesto contra o API server** (`--dry-run=server --validate=strict`) antes de mutar qualquer coisa. Sem cluster ela degrada para simulação e **declara explicitamente que o manifesto não foi validado** — porque não foi: validar um manifesto K8s exige um API server, e nenhuma checagem local substitui isso.

O terceiro estágio é o que dá nome à aula e o que mais merece leitura crítica: a decisão de rollout é determinística e vive em Python (limiares de 5% de erro e 300ms de latência, falhando fechado), mas a **métrica que ela avalia é um literal fixado no entrypoint**, sem relação com o deploy que acabou de ser aplicado. A seção *Real vs. simulado* traça essa fronteira inteira.

O `nexus-api-unipds-k8s.yaml` versionado aqui é **saída do agente**, não código escrito à mão: é o arquivo que `generate_k8s_manifest` gravou em disco durante a execução do pipeline.

> ℹ️ **Runtime atualizado na aula 005.** O modelo agora vem de `GROQ_MODEL` no `.env` (default `qwen/qwen3.6-27b`, no lugar do `openai/gpt-oss-20b`), `max_tokens` deixou de ser capado (a Groq debita o consumo real, não o teto pedido — capar não economizava cota e arriscava truncar) e o retry de rate limit passou a ler os formatos de tempo compostos da Groq (`3m9.648s`), que antes caíam num fallback curto demais e matavam o pipeline. Detalhes em [005 · Aprendizados](../005-observabilidade-preditiva/README.md#aprendizados).

## Herança

- **Esta aula acrescenta:** `get_sre_agent` (3º papel da trilha) · `tools/k8s_ops.py`, com as três operações do ciclo (`generate_k8s_manifest`, `apply_k8s_manifest`, `analyze_canary_metrics`) · o entrypoint `k8s_ops.py`, que monta uma `Crew` sequencial de três tasks · `tests/test_k8s_ops.py`, os primeiros testes da trilha.
- **Vem da 002 sem alteração:** `core/llm_config.py`, a fábrica `get_*(tools=...)` por injeção, e as tools `file_writer.py`, `security_scan.py` e `policy_rag.py` — presentes no diretório e **não usadas neste pipeline**. A dependência `checkov`, que só a 002 exercitava, foi removida do `pyproject.toml`.

## Tecnologias e Ferramentas

- [x] **Python 3.12** — runtime dos agentes
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — orquestração `Agent`/`Task`/`Crew` em processo sequencial
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** (`qwen/qwen3.6-27b`, trocável por `GROQ_MODEL` no `.env`) — motor de inferência dos agentes (free tier)
- [x] **Kubernetes / `kubectl`** — alvo das operações; `kubectl apply` invocado via `subprocess`
- [x] **YAML (Kubernetes API v1 / apps/v1)** — formato do artefato gerado (`Deployment` + `Service`)
- [x] **pytest** — testes dos helpers de decisão (dependency group `dev`)
- [x] **uv (workspace)** — ambiente único compartilhado por todas as aulas da disciplina

## Pré-requisitos

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python e as dependências; não é preciso instalar Python à parte
- **Python 3.12.11** — baixado automaticamente pelo uv (pin em `projects/.python-version`)
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`) — um único `.env` na raiz de `projects/` serve todas as aulas
- **`kubectl` (opcional)** apontando para um **cluster descartável** (kind/minikube)
- **`K8S_ALLOWED_CONTEXTS` (opcional)** — lista CSV de padrões glob de contexto autorizados a receber `apply`

> `apply_k8s_manifest` só aplica em contexto que case com a allowlist. O default cobre os clusters locais usuais — `kind-*`, `k3d-*`, `minikube`, `docker-desktop`, `rancher-desktop`, `orbstack`, `colima` — então um kind local funciona sem configurar nada. Para autorizar outro contexto:
>
> ```bash
> K8S_ALLOWED_CONTEXTS="kind-*,meu-cluster-de-lab" uv run k8s_ops.py
> ```
>
> Sem `kubectl` no `PATH`, ou com o cluster fora do ar, a tool cai em simulação e não toca em cluster nenhum — a aula roda normalmente assim.

## Como executar

Os projetos da disciplina compartilham um único ambiente (workspace uv). O setup é feito uma vez na raiz de `projects/` — detalhes no [README da disciplina](../README.md).

```bash
cd disciplinas/06-aiops-engenharia-agentica/projects

# 1. setup (uma vez para todas as aulas)
cp .env.example .env && $EDITOR .env   # cole a GROQ_API_KEY
uv sync --all-packages

# 2. conferir para onde o kubectl aponta (se estiver instalado)
kubectl config current-context

# 3. rodar o pipeline (gera → aplica → decide)
cd 003-orquestracao-sre-assistida-por-ia
uv run k8s_ops.py

# 4. testes dos helpers de decisão (não precisam de cluster nem de API key)
uv run pytest -v
```

> O `nexus-api-unipds-k8s.yaml` do repositório é sobrescrito a cada execução — ele é a saída do agente arquiteto.

## Real vs. simulado

Esta é a aula de maior consequência da trilha — a única que muta um cluster de verdade. A fronteira
entre o que é real e o que é encenação **não é intuitiva**, e o passo que mais parece produção é o
que menos é:

| Componente | Real ou simulado | O que isso implica para quem reusar |
|---|---|---|
| Agente e inferência | **Real** — chamada à API da Groq | é a única parte que custa e que varia entre execuções |
| `generate_k8s_manifest` | **Real**, mas o YAML sai de um template f-string | o LLM escolhe só `app_name`/`replicas`/`port`; a sintaxe é garantida pelo código, não pelo modelo |
| `nexus-api-unipds-k8s.yaml` | **Real e válido** — passa em `--dry-run=server --validate=strict` | pode ser usado como manifesto de referência |
| Imagem do container | **`nginx:latest`** — o "nexus-api-unipds" **não** é a aplicação da Nexus | o workload que sobe é um nginx padrão; ele não expõe as métricas que a Task 3 finge medir |
| `kubectl apply` | **Real** — muta o cluster apontado por `current-context` | primeira tool do repositório com efeito fora do diretório do projeto; leia a allowlist antes de reusar |
| Allowlist de contexto + sonda + `--dry-run=server` | **Reais** | as três grades funcionam e são o que há de mais aproveitável aqui |
| Degradação sem cluster | **Simulação declarada** — a tool diz que o manifesto **não** foi validado | comportamento correto e raro; é o modelo a copiar |
| **Métricas de canário** | **Simuladas** — `CANARY_METRICS = "error_rate: 1%, latency: 80ms"`, literal fixo no topo de `k8s_ops.py` | ⚠️ **o maior risco de leitura errada desta aula** |
| Limiares e decisão (5% / 300ms) | **Reais e determinísticos**, falhando fechado | a lógica é sólida e testada (`tests/test_k8s_ops.py`); só o dado de entrada é inventado |
| Rollback | **Não executado** — a decisão é uma string | nada chama `kubectl rollout undo`; um `ROLLBACK` não reverte coisa alguma |

Vale explicitar a consequência da linha destacada: **a Task 3 não mede o deploy que a Task 2 acabou de
fazer.** A métrica é fixada antes de o pipeline começar, o mesmo valor sai qualquer que tenha sido o
resultado do `apply`, e o app implantado é um `nginx:latest` que não produziria essas métricas de
nenhum jeito. O que a aula demonstra é a *forma* de uma análise de canário — quem decide, com que
limiar, falhando para que lado — e não a análise em si.


## Estrutura do Projeto

```
003-orquestracao-sre-assistida-por-ia/
├── k8s_ops.py                    # entrypoint: Crew sequencial (design → sync → monitor)
├── nexus-api-unipds-k8s.yaml     # artefato GERADO pelo agente (sobrescrito a cada run)
├── core/
│   ├── agents.py                 # get_architect() + get_auditor() + get_sre_agent()  ← novo papel SRE
│   └── llm_config.py             # LLM da Groq via LiteLLM (herdado)
├── tools/
│   ├── k8s_ops.py                # ← NOVO: generate_k8s_manifest, apply_k8s_manifest, analyze_canary_metrics
│   ├── file_writer.py            # herdado da 002 — não usado neste pipeline
│   ├── security_scan.py          # herdado da 002 — não usado neste pipeline
│   └── policy_rag.py             # herdado da 001 — não usado neste pipeline
├── tests/
│   └── test_k8s_ops.py           # helpers de decisão: sem rede, sem cluster, sem API key
└── pyproject.toml                # dependências desta aula (membro do workspace uv)
```

> Repare na colisão de nomes proposital: `k8s_ops.py` na raiz é o **entrypoint**, `tools/k8s_ops.py` é o **módulo de tools**. O entrypoint insere a raiz do projeto no `sys.path` antes dos imports justamente para que `from tools.k8s_ops import ...` resolva sem ambiguidade.

## Como funciona

```
k8s_ops.py
   │
   ├─ architect = get_architect(tools=[generate_k8s_manifest])
   ├─ sre       = get_sre_agent(tools=[apply_k8s_manifest, analyze_canary_metrics])
   │
   └─ Crew(process=sequential).kickoff()
            │
            ├── Task 1 — Arquiteto  (design)
            │      "manifesto K8s para 'nexus-api-unipds', 2 réplicas, porta 80"
            │                     │
            │                     ▼
            │      generate_k8s_manifest(app_name, replicas, port)
            │            └─ template f-string → Deployment + Service
            │                  └─ grava "nexus-api-unipds-k8s.yaml" em disco
            │
            ├── Task 2 — SRE  (sync / GitOps)
            │      apply_k8s_manifest("nexus-api-unipds-k8s.yaml")
            │            │
            │            ├─ arquivo não existe          → ❌ erro
            │            ├─ sem kubectl / sem contexto  → ℹ️ simulação  "NÃO validado"
            │            ├─ contexto fora da allowlist  → ⛔ BLOQUEADO, nada é aplicado
            │            ├─ cluster não responde        → ⚠️ simulação  "NÃO validado"
            │            │     (sonda positiva: kubectl api-versions)
            │            ├─ apply --dry-run=server --validate=strict
            │            │     └─ recusado              → ❌ REJEITADO + stderr do API server
            │            └─ kubectl apply --context <ctx>
            │                  ├─ rc == 0               → ✅ sync, nomeando o contexto
            │                  └─ rc != 0               → ❌ falha + stderr real
            │
            └── Task 3 — SRE  (canary decision)
                   analyze_canary_metrics("error_rate: 1%, latency: 80ms")
                         ├─ error_rate ausente/ilegível → ❌ ROLLBACK   (falha FECHADO)
                         ├─ latency    ausente/ilegível → ❌ ROLLBACK   (falha FECHADO)
                         ├─ error_rate > 5%             → ❌ ROLLBACK
                         ├─ latency    > 300ms          → ❌ ROLLBACK
                         └─ senão                       → ✅ PROCEED
                                     │
                                     ▼
                            veredito Healthy / Unhealthy
```

1. **Design** — o arquiteto traduz a especificação em linguagem natural em três parâmetros (`app_name`, `replicas`, `port`) e chama a tool. O YAML em si sai de um template f-string dentro da tool, não do LLM: o modelo escolhe *os valores*, o código garante *a sintaxe*. Por isso o prompt não precisa pedir a imagem nem a forma do probe — nenhum dos dois é violável.
2. **Guarda de contexto** — antes de qualquer chamada ao cluster, a tool lê `kubectl config current-context` e o confronta com a allowlist por glob. Contexto não autorizado devolve `⛔ BLOCKED` sem tocar em nada.
3. **Sonda de alcançabilidade** — `kubectl api-versions` estabelece por **sinal positivo** que o API server responde. Classificar `stderr` para inferir "sem cluster" não funciona: o conjunto de falhas de rede é aberto, e o que não é reconhecido vira acusação indevida de manifesto inválido.
4. **Validação** — `--dry-run=server --validate=strict` é a única validação real disponível; `--dry-run=client` não checa schema nenhum. Se o cluster recusa, o `stderr` dele aparece inteiro na resposta.
5. **Sync** — só então roda o `kubectl apply`, com `--context` explícito no comando, o que deixa o alvo auditável no trace em vez de implícito no ambiente.
6. **Monitor** — `analyze_canary_metrics` exige as duas métricas e **falha fechado**: métrica ausente ou ilegível é `ROLLBACK`, não aprovação por omissão. Troque `CANARY_METRICS` em `k8s_ops.py` para `error_rate: 8%` e o caminho de reversão é exercitado.

## Conceitos trabalhados

- [x] **Agente que opera, não só gera** — a fronteira entre produzir artefato (002) e executar mudança no ambiente (003) é onde AI-Ops começa a ter consequência real
- [x] **Fluxo GitOps em três estágios** — *desired state* declarado em arquivo → reconciliação → verificação pós-deploy, o ciclo que ArgoCD/Flux automatizam
- [x] **Blast radius como decisão de design** — allowlist de contexto e `--context` explícito transformam "em qual cluster isso vai cair?" de acidente de ambiente em invariante do código
- [x] **Falhar fechado** — não conseguir medir o canário é, em risco, indistinguível de medir e achar problema; a decisão default é reverter
- [x] **Sinal positivo vale mais que ausência de erro conhecido** — alcançabilidade se prova perguntando ao cluster, não classificando strings de `stderr` de um conjunto aberto de falhas
- [x] **Decisão de rollout como tool determinística** — o *julgamento* (limiares de 5% e 300ms) vive em Python; ao LLM cabe decidir *quando* consultar a ferramenta e como narrar o resultado
- [x] **Template no código, parâmetros no LLM** — a tool aceita só `app_name`/`replicas`/`port`, o que torna sintaticamente impossível o modelo emitir YAML inválido
- [x] **Lógica pura fora do wrapper `@tool`** — `@tool` devolve um objeto `Tool`, não uma função; extrair os helpers é o que torna a decisão testável sem cluster e sem API key
- [x] **Papéis especializados acumuláveis** — arquiteto, auditor e SRE coexistem em `core/agents.py`; cada pipeline compõe o subconjunto que precisa

## Aprendizados

- [x] Guardrail no prompt e guardrail no código não são intercambiáveis: quando o manifesto é montado por template em `generate_k8s_manifest`, a restrição deixa de ser instruível e passa a ser impossível de violar
- [x] `kubectl apply --dry-run=client` valida *sintaxe de arquivo*, não *objeto Kubernetes* — aceita `replicas: "dois"` e campos inventados; só `--dry-run=server --validate=strict` recusa, e isso exige API server
- [x] Sem cluster alcançável, a tool declara explicitamente que **não** validou: afirmar validade sem ter verificado é pior que não validar
- [x] Alcançabilidade se estabelece por sinal positivo (`kubectl api-versions` responde) e não por lista de mensagens de erro conhecidas — conjunto fechado de sucessos é mais confiável que conjunto aberto de falhas
- [x] Análise de canário precisa **falhar fechado**: métrica ausente ou ilegível devolve `ROLLBACK` com motivo, porque aprovar por omissão é o lado errado do erro num rollout
- [x] Toda tool com efeito fora do projeto precisa de allowlist (contextos `kind-*`/`minikube`) e de timeout — sem cluster, o `kubectl` reconecta com backoff e trava o pipeline indefinidamente

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [Kubernetes — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes — Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Argo CD — GitOps continuous delivery](https://argo-cd.readthedocs.io/)
- [Flagger — Progressive delivery / canary analysis](https://docs.flagger.app/)
- [kubectl — Server-side dry run e validação de campos](https://kubernetes.io/docs/reference/using-api/api-concepts/#dry-run)
- [pytest](https://docs.pytest.org/)
- [Groq API](https://console.groq.com/docs)
