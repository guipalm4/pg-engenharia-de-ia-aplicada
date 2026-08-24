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

## O que faria diferente

1. **Ligar o canário ao deploy.** É a lacuna que sustenta todas as outras: trocar o literal
   `CANARY_METRICS` por uma consulta real — `kubectl get --raw /apis/metrics.k8s.io/...`, ou um
   Prometheus no cluster de teste. Sem isso, a Task 3 é uma demonstração de formato.
2. **Subir algo que emita métrica.** Mesmo com a consulta real, `nginx:latest` não produz
   `error_rate`. Uma imagem que exponha `/metrics` (ou um gerador de carga sintética) é pré-requisito
   para o item 1 fazer sentido.
3. **Esperar o rollout antes de medir.** A Task 3 roda imediatamente após o `apply`. Um canário de
   verdade aguarda `kubectl rollout status` e observa por uma janela de tempo — medir antes dos pods
   ficarem prontos mede o estado anterior.
4. **Tirar a métrica do caminho do LLM.** `CANARY_METRICS` é uma constante Python que a task pede ao
   modelo para "repassar EXATAMENTE como está" até voltar ao código como argumento da tool. Todo o
   mecanismo de falhar fechado existe para se defender de uma paráfrase nessa transcrição — passar o
   valor direto elimina a necessidade da defesa. É o mesmo padrão estrutural do caminho de arquivo na
   [007](../007-devsecops-com-agentes-de-IA/README.md): um valor determinístico desviado por uma etapa
   probabilística sem necessidade.
5. **Executar o rollback.** `ROLLBACK` hoje é texto. Uma tool `rollback_deployment` chamando
   `kubectl rollout undo`, sob a mesma allowlist, fecharia o ciclo que a aula descreve — e obrigaria a
   enfrentar a pergunta de quem autoriza a reversão, que é o assunto da 006.
6. **Cobrir o caminho de bloqueio nos testes.** `tests/test_k8s_ops.py` testa bem os helpers de
   decisão. A guarda de contexto — a parte que impede um `apply` em produção — não tem teste, e é a
   que teria consequência real se regredisse.


## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [Kubernetes — Deployments](https://kubernetes.io/docs/concepts/workloads/controllers/deployment/)
- [Kubernetes — Configure Liveness, Readiness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/)
- [Argo CD — GitOps continuous delivery](https://argo-cd.readthedocs.io/)
- [Flagger — Progressive delivery / canary analysis](https://docs.flagger.app/)
- [kubectl — Server-side dry run e validação de campos](https://kubernetes.io/docs/reference/using-api/api-concepts/#dry-run)
- [pytest](https://docs.pytest.org/)
- [Groq API](https://console.groq.com/docs)
