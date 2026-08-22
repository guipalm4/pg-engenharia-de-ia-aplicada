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

A diferença conceitual em relação ao 002 é o **raio de ação**. `write_file` escrevia num arquivo local; `apply_k8s_manifest` roda `kubectl apply` num cluster real. Por isso a tool tem grade de proteção: ela só aplica em contextos que casem com uma **allowlist** de clusters descartáveis (`kind-*`, `minikube`, `docker-desktop`…), configurável por `K8S_ALLOWED_CONTEXTS`. Contexto fora da lista é bloqueado antes de qualquer chamada ao cluster.

Quando o contexto é autorizado, a tool ainda **verifica se o cluster responde** (`kubectl api-versions`) e **valida o manifesto contra o API server** (`--dry-run=server --validate=strict`) antes de mutar qualquer coisa. Sem cluster ela degrada para simulação e **declara explicitamente que o manifesto não foi validado** — porque não foi: validar um manifesto K8s exige um API server, e nenhuma checagem local substitui isso.

O `nexus-api-unipds-k8s.yaml` versionado aqui é **saída do agente**, não código escrito à mão: é o arquivo que `generate_k8s_manifest` gravou em disco durante a execução do pipeline.

> ℹ️ **Runtime atualizado na aula 005.** O modelo agora vem de `GROQ_MODEL` no `.env` (default `qwen/qwen3.6-27b`, no lugar do `openai/gpt-oss-20b`) e `max_tokens` caiu de 4096 para 2560 — a Groq reserva esse teto do orçamento em vez de cobrar o consumo real, e era a causa dos rate limits da trilha. Detalhes em [005 · Aprendizados](../005-observabilidade-preditiva/README.md#aprendizados).

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

Estes cinco pontos nasceram como crítica ao código da aula e foram corrigidos depois — o diagnóstico ficou porque é ele que explica *por que* o código está como está.

- [x] **Guardrail no prompt e guardrail no código não são intercambiáveis.**
  *Problema:* a `task_design` carregava dois avisos em caixa alta — usar `nginx:latest`, escrever `initialDelaySeconds` e não `initialDelay` — mas `generate_k8s_manifest` monta o YAML por f-string, então nenhum dos dois podia ser violado pelo LLM. Eram cicatriz de uma versão anterior em que o modelo escrevia o manifesto inteiro.
  *Correção:* os avisos saíram do prompt e um comentário no template marca onde a restrição de fato vive. Ao mover a estrutura para o código, o problema deixou de ser instruível e passou a ser impossível — que é o argumento a favor de codificar a restrição em vez de pedi-la.

- [x] **Não afirme o que você não verificou.**
  *Problema:* sem cluster, `apply_k8s_manifest` respondia que o manifesto *"is syntactically valid, but no cluster was detected"* — sem nunca tê-lo validado. Um YAML genuinamente quebrado recebia atestado de saúde.
  *Correção:* a frase saiu de todos os ramos sem cluster, que agora dizem explicitamente **"the manifest was NOT validated"**. A tentação era construir validação offline; medir mostrou que ela não existe — `kubectl apply --dry-run=client` aceitou um manifesto com `replicas: "dois"` e o campo inventado `initialDelay`, retornando `rc=0`. Só `--dry-run=server --validate=strict` valida de verdade, e exige API server. Validar *sintaxe de arquivo* e validar *objeto Kubernetes* são coisas diferentes.

- [x] **Classificar erro por lista de padrões conhecidos falha no caso que você não previu.**
  *Problema:* a primeira correção distinguia "cluster ausente" de "manifesto recusado" casando o `stderr` contra marcadores como `connection refused`. Um cluster morto de verdade devolveu `error: EOF` — fora da lista — e a tool acusou o API server de ter rejeitado um manifesto que ele nunca viu. O bug que a correção deveria eliminar, reintroduzido pela própria correção.
  *Correção:* alcançabilidade passou a ser estabelecida por **sinal positivo** (`kubectl api-versions` responde ou não), e a classificação de `stderr` virou rede de segurança secundária para o cluster cair no meio da operação. Conjunto fechado de sucessos é sempre mais confiável que conjunto aberto de falhas.

- [x] **Análise de canário tem que falhar fechado.**
  *Problema:* `analyze_canary_metrics` ignorava a latência e, se o regex não casasse, caía em `PROCEED` por omissão — uma métrica parafraseada pelo LLM aprovava o rollout sem ninguém ter medido nada.
  *Correção:* as duas métricas são obrigatórias e qualquer uma ausente ou ilegível devolve `ROLLBACK` com o motivo explícito; a latência ganhou limiar próprio. Os limiares viraram constantes nomeadas no topo do módulo. O trade-off é real e deliberado: uma paráfrase do LLM agora reverte o deploy em vez de aprová-lo — que é o lado certo do erro para um canário.

- [x] **Uma tool com efeito colateral fora do projeto precisa de grade, e de relógio.**
  *Problema:* `kubectl apply` obedecia ao `current-context`, que pode ser produção se o desenvolvedor esqueceu de trocar. Era a primeira tool do repositório com alcance fora do diretório do projeto.
  *Correção:* allowlist de contextos por glob (`kind-*`, `minikube`, …), sobrescrevível por `K8S_ALLOWED_CONTEXTS`, avaliada antes de qualquer chamada ao cluster; e o `--context` passou a ir explícito no comando, fechando a janela entre checar e aplicar. Um segundo defeito apareceu ao testar: sem cluster alcançável o `kubectl` tenta reconectar com backoff e **trava para sempre** — uma tool que bloqueia indefinidamente dentro de um pipeline de agente é tão inútil quanto uma que erra. Todas as chamadas passaram por um helper único com `--request-timeout` e timeout de subprocesso.

- [x] **Herança preguiçosa acumula peso morto — e o remédio depende do que a duplicação está pagando.**
  `tools/file_writer.py`, `security_scan.py` e `policy_rag.py` vieram na cópia da pasta anterior e não participam deste pipeline. **Ficaram de propósito:** o [README da disciplina](../README.md) vende essa duplicação como o mecanismo que permite abrir 001, 002 e 003 lado a lado e ver o delta — removê-los custaria mais do que economizaria. Já a dependência `checkov` no `pyproject.toml` não pagava nada: era declaração falsa, e saiu. Peso morto nomeado é decisão; peso morto silencioso é dívida.

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [Kubernetes — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes — Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Argo CD — GitOps continuous delivery](https://argo-cd.readthedocs.io/)
- [Flagger — Progressive delivery / canary analysis](https://docs.flagger.app/)
- [kubectl — Server-side dry run e validação de campos](https://kubernetes.io/docs/reference/using-api/api-concepts/#dry-run)
- [pytest](https://docs.pytest.org/)
- [Groq API](https://console.groq.com/docs)
