# Exemplo 010 — RAG e Auto-Remediação

> Um agente de SRE consulta o runbook oficial de um incidente de banco e escreve o plano de remediação com o post-mortem. O runbook tem 441 bytes e **acaba antes de chegar à remediação** — o comando SQL que o agente apresenta como "baseado no runbook oficial" não está lá.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Um agente com o papel de *Engenheiro SRE de Resposta a Incidentes* recebe o alerta `PostgresqlTooManyConnections`, consulta a base de conhecimento da empresa através da tool `consult_runbook` e devolve dois artefatos: o plano de remediação e um rascunho de post-mortem.

Esta aula acrescenta o padrão **RAG** à trilha — recuperar documentação oficial antes de responder, em vez de confiar na memória do modelo. Na prática, a "recuperação" aqui é `open()` de um arquivo Markdown cujo nome é montado a partir do argumento da tool: não há chunking, embedding, vector store nem ranking. É o degrau zero do RAG, e serve bem para isolar o que o padrão realmente promete.

O material da aula está no que acontece quando o documento recuperado **não contém a resposta**. O runbook do repositório descreve o sintoma e o comando de diagnóstico, e termina no meio de um bloco `sql` — não há seção de remediação. A task, porém, pede explicitamente "identifique o comando SQL exato para limpar conexões ociosas". Nas duas execuções medidas o agente entregou `pg_terminate_backend(...)` sob o título *"Baseado no Runbook Oficial"*, com guardas diferentes em cada volta. O RAG não impediu a alucinação; deu a ela a aparência de citação. Está em *Aprendizados*.

## Herança

- **Esta aula acrescenta:** `get_sre_knowledge_agent` (10º papel da trilha) · `remediation.py`, que declara a tool `consult_runbook` inline · `data/runbook_db.md`, a base de conhecimento.
- **Vem da 009 sem alteração:** `core/llm_config.py`, os 41 testes de `tests/` e as **8 tools de `tools/`, nenhuma delas usada neste pipeline** — inclusive `policy_rag.py`, que está na pasta desde a aula 001 e é a única outra tool da trilha com "RAG" no nome. O `data/inventario_cloud.json` da 009 saiu junto com o entrypoint que o consumia.

## Tecnologias e Ferramentas

- [x] **Python 3.12** — runtime dos agentes
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — orquestração `Agent`/`Task`/`Crew`
- [x] **`@tool` decorator do CrewAI** — a tool desta aula é declarada no entrypoint, não em `tools/`
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** — motor de inferência (free tier); modelo em `GROQ_MODEL`, default `qwen/qwen3.6-27b`
- [x] **PostgreSQL** — **apenas o vocabulário** (`pg_stat_activity`, slots de conexão); nenhum banco sobe, nada é executado
- [x] **pytest** — 41 testes herdados das aulas 003–005
- [x] **uv (workspace)** — ambiente único compartilhado por todas as aulas da disciplina

## Pré-requisitos

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python e as dependências
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`)

> ⚠️ **O `cd` faz parte do comando.** Parar em `projects/` em vez da pasta da aula dá `ModuleNotFoundError: core`, porque os imports `core.*`/`tools.*` resolvem pelo diretório do script.

## Como executar

```bash
cd disciplinas/06-aiops-engenharia-agentica/projects

# setup (uma vez para todas as aulas)
cp .env.example .env && $EDITOR .env   # cole a GROQ_API_KEY
uv sync --all-packages

cd 010-rag-e-auto-remediacao

# resposta ao incidente com consulta ao runbook
uv run remediation.py

# testes (não precisam de API key)
uv run pytest -v
```

## Saída esperada

`uv run remediation.py` imprime o painel `🤖 Agent Started` com o enunciado; uma linha `Tool consult_runbook executed with result: # Runbook: Saturação de Conexões no PostgreSQL...` (o painel corta o retorno, mas o arquivo inteiro vai para o modelo — são 441 bytes); e o painel `✅ Agent Final Answer` com o plano de remediação e o post-mortem em Markdown. Sai com código 0 em poucos segundos, faz **uma** chamada de tool e **não escreve nada em disco**.

`uv run pytest -v` reporta **41 passed** (~3s) — os testes herdados das aulas 003 a 005; esta aula não acrescenta testes.

**O que foi estável nas 2 execuções medidas** (`qwen/qwen3.6-27b`): a tool é chamada exatamente uma vez, com `service_name="db"`; o comando de diagnóstico sai idêntico ao do runbook; a resposta tem sempre as duas partes pedidas (remediação + post-mortem) e nunca é truncada.

**O que mudou:** o `pg_terminate_backend` — presente nas duas — veio com guardas diferentes (`AND pid <> pg_backend_pid()` numa volta; `AND query_start < now() - interval '5 minutes' AND usename != 'postgres'` na outra), e a segunda execução acrescentou passos que não existem no runbook, incluindo um `SHOW max_connections;` comentado com `-- max_connections = 200 -- valor de exemplo`.

## Real vs. simulado

| Componente | Real ou simulado | O que isso implica para quem reusar |
|---|---|---|
| **Agente e inferência** | **Real** — chamada à API da Groq | é a única parte que custa e que varia |
| **"RAG"** | **`open()` + `read()`** de um caminho montado por interpolação | sem chunking, embedding, vector store ou ranking; o documento inteiro entra no prompt. Não demonstra retrieval, demonstra *file lookup* |
| **`data/runbook_db.md`** | **Fixture de 441 bytes, incompleto** | tem `## Sintoma` e `## Diagnóstico`; termina no meio do bloco ```` ```sql ```` sem fechá-lo, e **não tem seção de remediação** |
| **Comando de remediação** | **Gerado pelo modelo**, não recuperado | `grep -c pg_terminate_backend data/runbook_db.md` → `0`. O plano credita ao "Runbook Oficial" um comando que o runbook não contém |
| **PostgreSQL** | **Simulado** — nenhum banco, nenhuma conexão, nenhum `psql` | nada é diagnosticado nem terminado; não há tool que execute SQL |
| **Post-mortem** | **Ficção plausível** — linha do tempo `T+00`…`T+20`, causa raiz, severidade P1 | nenhum desses fatos vem de dado nenhum; o incidente nunca ocorreu |
| **Persistência** | **Nenhuma** | o plano e o post-mortem existem só no stdout de um processo que já terminou; a `file_writer` herdada segue ociosa pela terceira aula seguida |

## Estrutura do Projeto

```
010-rag-e-auto-remediacao/
├── remediation.py                # entrypoint — e também onde vive a tool desta aula
│                                 #   @tool("consult_runbook") declarada inline
├── data/
│   └── runbook_db.md             # a "base de conhecimento": 441 bytes, sintoma +
│                                 #   diagnóstico, sem a seção de remediação
├── core/
│   ├── agents.py                 # + get_sre_knowledge_agent()  ← novo papel (o 10º)
│   └── llm_config.py             # Groq + RateLimitAwareLLM — herdado, intocado
├── tools/                        # 8 tools herdadas das aulas 001–006
│                                 #   NENHUMA é usada neste pipeline
├── tests/                        # 41 testes herdados das aulas 003–005
└── pyproject.toml                # membro virtual do workspace uv; pythonpath = ["."]
```

## Conceitos trabalhados

- [x] **RAG como padrão de fundamentação** — recuperar documentação oficial antes de responder, em vez de confiar na memória do modelo
- [x] **Agente de resposta a incidentes** — o 10º papel da trilha, com `goal` de propor remediação baseada em runbook
- [x] **Runbook como fonte de verdade operacional** — sintoma, diagnóstico e remediação como documento versionado
- [x] **Auto-remediação e post-mortem** — os dois entregáveis de um plantão, gerados na mesma volta
- [x] **Tool declarada inline no entrypoint** — quinto pipeline seguido com esse padrão, sem passar por `tools/`
- [x] **Argumento de tool decidido pelo LLM** — o `service_name` que vira caminho de arquivo é escolhido pelo modelo, não pelo código
- [x] **O limite do RAG** — o que acontece quando o documento recuperado não contém a resposta pedida

## Aprendizados

- [x] **O comando central da resposta não está no runbook, e as duas execuções o apresentam como se estivesse.** `grep -c pg_terminate_backend data/runbook_db.md` devolve `0`; o arquivo tem 441 bytes e para no meio do bloco `sql` do diagnóstico, sem chegar a uma seção de remediação. Ainda assim, a task pede "o comando SQL **exato**", e o agente entrega — sob o título *"Plano de Remediação (Baseado no Runbook Oficial)"*. **Esse é o modo de falha específico do RAG: a alucinação não some, ela ganha uma procedência.** Sem RAG, um plano gerado do zero se lê como sugestão do modelo; com RAG, o mesmo texto se lê como citação de documento aprovado — e nada na saída distingue o trecho recuperado do trecho inventado, porque os dois saem no mesmo Markdown, com a mesma formatação.
- [x] **O que veio do arquivo é idêntico nas duas voltas; o que não veio, muda.** O `SELECT count(*), state FROM pg_stat_activity GROUP BY state;` sai igual, caractere a caractere, nas duas execuções — está no runbook. O `pg_terminate_backend` sai com guardas diferentes: `AND pid <> pg_backend_pid()` numa volta, `AND query_start < now() - interval '5 minutes' AND usename != 'postgres'` na outra. É a mesma régua da aula 009 aplicada a texto em vez de aritmética — **a estabilidade da saída mede a cobertura da fonte, não a qualidade da resposta** — e aqui ela é mais perigosa, porque a variação está na cláusula `WHERE` de um comando destrutivo: as duas variantes matam conjuntos diferentes de conexões, e uma delas encerraria conexões ociosas de qualquer usuário que não seja `postgres`.
- [x] **O runbook incompleto é o achado da aula, não um defeito a corrigir sem pensar.** Um arquivo que termina no meio de um code fence é, involuntariamente, o melhor fixture possível para o tema: ele separa com precisão cirúrgica o que o RAG recuperou do que o modelo preencheu. Corrigi-lo — acrescentando a seção de remediação com o `pg_terminate_backend` — faria a saída parecer certa e apagaria a lição. **O que faltaria, em qualquer dos dois casos, é o pipeline saber que faltou:** nada no código compara a resposta com o documento, e o agente não é instruído a declarar quando a fonte é omissa.
- [x] **Chamar de RAG um `open()` com nome de arquivo interpolado é o vício de nomenclatura da trilha, agora no título da aula.** `consult_runbook` faz `os.path.join(PROJECT_ROOT, "data", f"runbook_{service_name}.md")` e lê o arquivo — nenhuma etapa de *retrieval* de verdade (indexação, similaridade, ranking, corte de contexto) aparece. O padrão se repete desde a 007 (`analyze_trivy_report`), 008 (`analyze_workflow_yaml`) e 009 (`analyze_cloud_costs`), todos `json.load` ou `read()` disfarçados. A ironia desta aula é que **`tools/policy_rag.py`, herdada da aula 001 e nunca usada, é um `return` de string literal** — duas tools com "RAG" no nome no mesmo repositório, nenhuma das duas fazendo retrieval.
- [x] **O argumento que vira caminho de arquivo é escolhido pelo modelo.** O `service_name` não é validado contra uma lista de serviços conhecidos: o prefixo `data/runbook_` e o sufixo `.md` limitam o estrago, mas não impedem que um valor com `../` alcance qualquer `.md` fora da pasta. Aqui o valor vem do enunciado da task (`'db'`) e o risco é teórico; num pipeline em que o alerta chega de fora — webhook, ticket, mensagem de chat — o nome do serviço passa a ser entrada não confiável percorrendo o modelo até o filesystem. **Toda tool de leitura por nome precisa de allowlist**, e é barato: um `if service_name not in RUNBOOKS: return erro` resolve.
- [x] **"Auto-remediação" no título, zero remediação na execução.** O agente não tem tool que execute SQL, não há banco, e o plano nunca sai do terminal. É o mesmo diagnóstico das aulas 008 e 009 — a `file_writer` está na pasta desde a 002 e continua sem ser entregue a ninguém — mas aqui pesa mais, porque **um post-mortem que não é arquivado não é um post-mortem**: o artefato existe justamente para ser lido depois do plantão.
- [x] **O que faria diferente:** dar ao agente uma allowlist de runbooks em vez de interpolação livre; instruir a task a **citar textualmente** o trecho do runbook que sustenta cada passo e a declarar explicitamente quando o documento é omisso (o que teria exposto o buraco na primeira execução); entregar a `file_writer` para gravar o post-mortem em `data/postmortems/`; e, se o objetivo for ensinar RAG de fato, trocar o `open()` por um índice sobre vários runbooks — com mais de um documento, a escolha de qual recuperar passa a ser uma decisão real, e o padrão deixa de ser um `read()` com nome pomposo.

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [CrewAI — Tools](https://docs.crewai.com/concepts/tools)
- [PostgreSQL — `pg_stat_activity`](https://www.postgresql.org/docs/current/monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW)
- [PostgreSQL — Funções de sinalização de servidor (`pg_terminate_backend`)](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADMIN-SIGNAL)
- [PostgreSQL — `idle_in_transaction_session_timeout`](https://www.postgresql.org/docs/current/runtime-config-client.html)
- [Google SRE Book — Postmortem Culture](https://sre.google/sre-book/postmortem-culture/)
- [Lewis et al. (2020) — Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- [Groq — Rate limits (TPM/TPD por modelo)](https://console.groq.com/docs/rate-limits)
