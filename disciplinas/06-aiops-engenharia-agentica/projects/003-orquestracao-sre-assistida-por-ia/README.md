# Exemplo 003 — Orquestração SRE Assistida por IA

> Crew de três tasks que desenha um manifesto Kubernetes, faz o *sync* GitOps via `kubectl apply` e decide o destino do rollout analisando métricas de canário — o agente sai do papel de gerar código e passa a operar o cluster.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Este projeto evolui o [002 — Geração, Auditoria e Self-Healing com IA](../002-geracao-auditoria-e-self-healing-com-IA), onde dois agentes geravam e auditavam um `main.tf`. O delta da aula é a mudança de **alvo** e de **postura**: sai o Terraform (IaC declarativa que ninguém aplica), entra o Kubernetes; e o pipeline deixa de parar no artefato — ele **aplica** o manifesto no cluster e **decide** se o rollout continua ou volta atrás.

Três coisas são novas. Um terceiro papel em `core/agents.py`, o `get_sre_agent()` — Engenheiro de SRE especialista em K8s, cuja *backstory* menciona explicitamente GitOps e análise de métricas de tráfego. Um novo módulo de tools, `tools/k8s_ops.py`, com as três operações do ciclo (gerar manifesto, aplicar, analisar canário). E um novo entrypoint, `k8s_ops.py`, que monta uma `Crew` sequencial de **três** tasks em vez de duas.

O runtime herdado continua idêntico e não é redocumentado aqui: `core/llm_config.py` (Groq via LiteLLM), a fábrica `get_*(tools=...)` por injeção, e as tools das aulas anteriores (`file_writer.py`, `policy_rag.py`, `security_scan.py`) seguem no diretório — vivas, mas fora deste pipeline, que não as carrega.

A diferença conceitual em relação ao 002 é o **raio de ação**. `write_file` escrevia num arquivo local; `apply_k8s_manifest` roda `kubectl apply` **no contexto ativo do `kubectl`**, ou seja, num cluster real se houver um configurado. A tool degrada em três níveis — cluster respondeu (sync de verdade), `kubectl` existe mas nenhum cluster respondeu (simulação declarada), `kubectl` nem está instalado (modo simulação puro) — e nunca falha o pipeline por ausência de infraestrutura. É o que torna a aula executável na máquina do aluno sem cluster, mas é também o ponto onde um erro de contexto sai caro.

O `nexus-api-unipds-k8s.yaml` versionado aqui é **saída do agente**, não código escrito à mão: é o arquivo que `generate_k8s_manifest` gravou em disco durante a execução do pipeline.

## Tecnologias e Ferramentas

- [x] **Python 3.12** — runtime dos agentes
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — orquestração `Agent`/`Task`/`Crew` em processo sequencial
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** (`llama-3.1-8b-instant`) — motor de inferência dos agentes
- [x] **Kubernetes / `kubectl`** — alvo das operações; `kubectl apply` invocado via `subprocess`
- [x] **YAML (Kubernetes API v1 / apps/v1)** — formato do artefato gerado (`Deployment` + `Service`)
- [x] **Checkov 3.3.8** — herdado do `pyproject.toml` da aula 002; não é usado por este pipeline
- [x] **uv (workspace)** — ambiente único compartilhado por todas as aulas da disciplina

## Pré-requisitos

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python e as dependências; não é preciso instalar Python à parte
- **Python 3.12.11** — baixado automaticamente pelo uv (pin em `projects/.python-version`)
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`) — um único `.env` na raiz de `projects/` serve todas as aulas
- **`kubectl` (opcional)** apontando para um **cluster descartável** (kind/minikube)

> ⚠️ `apply_k8s_manifest` executa `kubectl apply` no **contexto ativo**. Rode `kubectl config current-context` antes de executar o pipeline e troque para um cluster local. Sem `kubectl` no `PATH`, a tool cai em modo simulação e não toca em cluster nenhum — a aula roda normalmente assim.

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
```

> O `nexus-api-unipds-k8s.yaml` do repositório é sobrescrito a cada execução — ele é a saída do agente arquiteto.

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
            │      + guardrails no prompt: imagem `nginx:latest`, `initialDelaySeconds`
            │                     │
            │                     ▼
            │      generate_k8s_manifest(app_name, replicas, port)
            │            └─ template f-string → Deployment + Service
            │                  └─ grava "nexus-api-unipds-k8s.yaml" em disco
            │
            ├── Task 2 — SRE  (sync / GitOps)
            │      apply_k8s_manifest("nexus-api-unipds-k8s.yaml")
            │            ├─ arquivo não existe        → ❌ erro
            │            ├─ kubectl apply, rc == 0    → ✅ GitOps Sync Success
            │            ├─ kubectl apply, rc != 0    → ⚠️ simulação (YAML válido, sem cluster)
            │            └─ FileNotFoundError         → ℹ️ sem kubectl: ArgoCD/Flux aplicaria aqui
            │
            └── Task 3 — SRE  (canary decision)
                   analyze_canary_metrics("error_rate: 1%, latency: 80ms")
                         ├─ regex extrai error_rate
                         ├─ > 5%   → ❌ ROLLBACK
                         └─ senão  → ✅ PROCEED
                                     │
                                     ▼
                            veredito Healthy / Unhealthy
```

1. **Design** — o arquiteto traduz a especificação em linguagem natural em três parâmetros (`app_name`, `replicas`, `port`) e chama a tool. O YAML em si sai de um template f-string dentro da tool, não do LLM: o modelo escolhe *os valores*, o código garante *a sintaxe*.
2. **Sync** — o SRE chama `apply_k8s_manifest`, que tenta o `kubectl apply` de verdade com `check=False` e interpreta o *return code*. Ausência de cluster ou de binário vira mensagem explicativa, nunca exceção.
3. **Monitor** — `analyze_canary_metrics` extrai a taxa de erro da string de métricas por regex e aplica um limiar fixo de 5%. Com o input da aula (1%) a decisão é sempre `PROCEED`; trocar para `error_rate: 8%` exercita o caminho de `ROLLBACK`.

## Conceitos trabalhados

- [x] **Agente que opera, não só gera** — a fronteira entre produzir artefato (002) e executar mudança no ambiente (003) é onde AI-Ops começa a ter consequência real
- [x] **Fluxo GitOps em três estágios** — *desired state* declarado em arquivo → reconciliação → verificação pós-deploy, o ciclo que ArgoCD/Flux automatizam
- [x] **Decisão de rollout como tool determinística** — o *julgamento* (limiar de 5%) vive em Python; ao LLM cabe decidir *quando* consultar a ferramenta e como narrar o resultado
- [x] **Template no código, parâmetros no LLM** — a tool aceita só `app_name`/`replicas`/`port`, o que torna sintaticamente impossível o modelo emitir YAML inválido
- [x] **Degradação graciosa de tool com dependência externa** — três níveis de fallback (cluster / sem cluster / sem `kubectl`) mantêm o pipeline executável em qualquer máquina
- [x] **Papéis especializados acumuláveis** — arquiteto, auditor e SRE coexistem em `core/agents.py`; cada pipeline compõe o subconjunto que precisa
- [x] **Tools por task além das do agente** — `task_monitor` declara `tools=[analyze_canary_metrics]` explicitamente, restringindo o escopo daquela etapa

## Aprendizados

- [x] **Guardrail no prompt e guardrail no código não são intercambiáveis.** A `task_design` carrega dois avisos em caixa alta (usar `nginx:latest`, escrever `initialDelaySeconds` e não `initialDelay`) — mas `generate_k8s_manifest` monta o YAML por f-string, então nenhum dos dois pode ser violado pelo LLM. Os avisos são cicatriz de uma versão anterior em que o modelo escrevia o manifesto inteiro; ao mover a estrutura para o código, o problema deixou de ser instruível e passou a ser impossível. O prompt hoje protege contra um erro que não existe mais — e é exatamente esse o argumento a favor de codificar a restrição em vez de pedi-la.
- [x] **`check=False` é a escolha certa aqui, e é uma escolha.** Se `subprocess.run` levantasse em erro, a ausência de cluster derrubaria a Crew inteira. Tratar o *return code* à mão permite distinguir "manifesto inválido" de "não há cluster" — mas o código atual agrupa os dois no mesmo ramo de simulação, ou seja, um YAML genuinamente quebrado seria reportado como "sintaticamente válido, sem cluster detectado". Para uso real, o `stderr` do `kubectl` precisaria ser inspecionado.
- [x] **Análise de canário por regex sobre string é o mesmo tipo de fragilidade que o OPA por substring da aula 002.** `analyze_canary_metrics` recebe `"error_rate: 1%, latency: 80ms"` como texto livre e só olha a taxa de erro — a latência é ignorada, e uma métrica formatada de outro jeito passa direto pelo `re.search` e cai no `PROCEED` por omissão. O ponto pedagógico se mantém (a decisão é determinística, fora do LLM), mas um analisador real consulta Prometheus e falha fechado quando não consegue ler a métrica.
- [x] **A tool que aplica no cluster é a primeira do repositório com efeito colateral fora do diretório do projeto.** Tudo até aqui escrevia arquivos locais. `kubectl apply` obedece ao `current-context`, que pode ser produção se o desenvolvedor esqueceu de trocar — uma tool com esse alcance deveria exigir confirmação humana ou validar o nome do contexto contra uma allowlist antes de executar.
- [x] **Herança preguiçosa acumula peso morto.** `tools/file_writer.py`, `security_scan.py` e `policy_rag.py` vieram junto na cópia da pasta anterior, e o `pyproject.toml` ainda declara o `checkov` — nada disso participa deste pipeline. Para a trilha isso é proposital (permite abrir 001, 002 e 003 lado a lado e ver o delta), mas num projeto real seria dívida se ninguém a nomeasse.

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [Kubernetes — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes — Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Argo CD — GitOps continuous delivery](https://argo-cd.readthedocs.io/)
- [Flagger — Progressive delivery / canary analysis](https://docs.flagger.app/)
- [Groq API](https://console.groq.com/docs)
