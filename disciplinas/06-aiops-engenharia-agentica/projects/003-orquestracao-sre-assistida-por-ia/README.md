# Exemplo 003 — Orquestração SRE Assistida por IA

> Crew de três tasks que desenha um manifesto Kubernetes, faz o *sync* GitOps via `kubectl apply` e decide o destino do rollout analisando métricas de canário — o agente sai do papel de gerar código e passa a operar o cluster.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Uma `Crew` de dois papéis percorre o ciclo GitOps completo em três tasks sequenciais: o **Arquiteto** desenha o manifesto Kubernetes de um app a partir de uma especificação em linguagem natural, o **Engenheiro de SRE** faz a reconciliação chamando `kubectl apply`, e o mesmo SRE decide se o rollout segue ou é revertido analisando métricas de canário contra limiares. O artefato (`Deployment` + `Service`) é gravado em disco e o veredito final é `Healthy` ou `Unhealthy`.

O que distingue esta aula é o **raio de ação**: `apply_k8s_manifest` executa `kubectl apply` num cluster de verdade — é a primeira tool do repositório com efeito fora do diretório do projeto. Por isso ela tem grade de proteção: só aplica em contextos que casem com uma **allowlist** de clusters descartáveis (`kind-*`, `minikube`, `docker-desktop`…, configurável por `K8S_ALLOWED_CONTEXTS`), verifica se o cluster responde (`kubectl api-versions`) e valida o manifesto contra o API server (`--dry-run=server --validate=strict`) antes de mutar qualquer coisa. Sem cluster, degrada para simulação e **declara que o manifesto não foi validado** — porque não foi: validar um manifesto K8s exige um API server, e nenhuma checagem local substitui isso.

O terceiro estágio é o que dá nome à aula. A decisão de rollout é determinística e vive em Python — limiares de 5% de erro e 300ms de latência, falhando fechado —, e a métrica que ela avalia é o literal `CANARY_METRICS` fixado no topo do entrypoint, editável para exercitar os dois caminhos. O que a aula demonstra é a **forma** de uma análise de canário: quem decide, contra que limiar e para que lado o erro cai quando não há medida confiável.

Esta aula acrescenta o `get_sre_agent` (3º papel), o módulo `tools/k8s_ops.py` com as três operações do ciclo e `tests/test_k8s_ops.py`, os primeiros testes da trilha. O `nexus-api-unipds-k8s.yaml` versionado aqui é **saída do agente**, sobrescrita a cada execução, não código escrito à mão.

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

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python (3.12.11, pin em `projects/.python-version`) e as dependências
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`) — um único `.env` serve todas as aulas
- **`kubectl` (opcional)** apontando para um **cluster descartável** (kind/minikube)
- **`K8S_ALLOWED_CONTEXTS` (opcional)** — lista CSV de padrões glob de contexto autorizados a receber `apply`

> A allowlist default cobre os clusters locais usuais (`kind-*`, `k3d-*`, `minikube`, `docker-desktop`, `rancher-desktop`, `orbstack`, `colima`), então um kind local funciona sem configurar nada; para autorizar outro, `K8S_ALLOWED_CONTEXTS="kind-*,meu-lab" uv run k8s_ops.py`. Sem `kubectl` no `PATH` ou com o cluster fora do ar, a tool cai em simulação e a aula roda normalmente.

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

> Colisão de nomes proposital: `k8s_ops.py` na raiz é o **entrypoint**, `tools/k8s_ops.py` é o **módulo de tools** — o entrypoint insere a raiz do projeto no `sys.path` para que `from tools.k8s_ops import ...` resolva sem ambiguidade.

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

1. **Design** — o arquiteto traduz a especificação em três parâmetros (`app_name`, `replicas`, `port`) e chama a tool; o YAML sai de um template f-string dentro dela, então o modelo escolhe *os valores* e o código garante *a sintaxe*.
2. **Guarda de contexto** — antes de qualquer chamada ao cluster, a tool confronta o `current-context` com a allowlist por glob; contexto não autorizado devolve `⛔ BLOCKED` sem tocar em nada.
3. **Sonda de alcançabilidade** — `kubectl api-versions` estabelece por **sinal positivo** que o API server responde; classificar `stderr` não funciona, porque o conjunto de falhas de rede é aberto.
4. **Validação** — `--dry-run=server --validate=strict` é a única validação real disponível (`--dry-run=client` não checa schema); se o cluster recusa, o `stderr` dele aparece inteiro na resposta.
5. **Sync** — só então roda o `kubectl apply`, com `--context` explícito, o que deixa o alvo auditável no trace em vez de implícito no ambiente.
6. **Monitor** — `analyze_canary_metrics` exige as duas métricas e **falha fechado**. Troque `CANARY_METRICS` em `k8s_ops.py` para `error_rate: 8%` e o caminho de reversão é exercitado.

## Conceitos trabalhados

- [x] **Agente que opera, não só gera** — a fronteira entre produzir artefato (002) e executar mudança no ambiente (003) é onde AI-Ops começa a ter consequência real
- [x] **Fluxo GitOps em três estágios** — *desired state* declarado em arquivo → reconciliação → verificação pós-deploy, o ciclo que ArgoCD/Flux automatizam
- [x] **Blast radius como decisão de design** — allowlist de contexto e `--context` explícito transformam "em qual cluster isso vai cair?" de acidente de ambiente em invariante do código
- [x] **Falhar fechado** — não conseguir medir o canário é, em risco, indistinguível de medir e achar problema; a decisão default é reverter
- [x] **Decisão determinística numa tool** — o julgamento (limiares de 5% e 300ms) vive em Python; ao LLM cabe decidir *quando* consultar a ferramenta e como narrar o resultado
- [x] **Template no código, parâmetros no LLM** — a tool aceita só `app_name`/`replicas`/`port`, o que torna sintaticamente impossível o modelo emitir YAML inválido; e manter a lógica pura fora do wrapper `@tool` é o que a torna testável sem cluster

## Aprendizados

- [x] Toda tool com efeito fora do diretório do projeto precisa de allowlist de destino e de timeout explícito, porque quem escolhe chamá-la é o modelo e o alvo não pode depender do que estiver configurado no ambiente
- [x] Guardrail no prompt e guardrail no código não são intercambiáveis: quando o manifesto é montado por template em `generate_k8s_manifest`, a restrição deixa de ser instruível e passa a ser impossível de violar
- [x] `kubectl apply --dry-run=client` valida *sintaxe de arquivo*, não *objeto Kubernetes* — aceita `replicas: "dois"` e campos inventados; só `--dry-run=server --validate=strict` recusa, e isso exige API server: sem cluster alcançável, o honesto é declarar que **não** validou, porque afirmar validade sem ter verificado é pior que não validar
- [x] Alcançabilidade se estabelece por sinal positivo (`kubectl api-versions` responde) e não por lista de mensagens de erro conhecidas — conjunto fechado de sucessos é mais confiável que conjunto aberto de falhas
- [x] Análise de canário precisa **falhar fechado**: métrica ausente ou ilegível devolve `ROLLBACK` com motivo, porque aprovar por omissão é o lado errado do erro num rollout

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [Kubernetes — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes — Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Argo CD — GitOps continuous delivery](https://argo-cd.readthedocs.io/)
- [Flagger — Progressive delivery / canary analysis](https://docs.flagger.app/)
- [kubectl — Server-side dry run e validação de campos](https://kubernetes.io/docs/reference/using-api/api-concepts/#dry-run)
- [pytest](https://docs.pytest.org/)
- [Groq API](https://console.groq.com/docs)
