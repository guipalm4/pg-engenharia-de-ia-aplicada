# Exemplo 010 — RAG e Auto-Remediação

> Um agente de SRE recebe um alerta de saturação de conexões no PostgreSQL, consulta o runbook oficial do serviço e devolve o plano de remediação junto com o rascunho do post-mortem.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

A aula fecha a trilha com o padrão **RAG** (*Retrieval-Augmented Generation*): antes de propor qualquer ação, o agente vai buscar a documentação oficial da empresa. Um *Engenheiro SRE de Resposta a Incidentes* recebe o alerta `PostgresqlTooManyConnections`, usa a tool `consult_runbook` para ler o runbook do serviço `db` e produz os dois artefatos de um plantão: o plano de remediação e o rascunho de post-mortem.

É a diferença entre um agente que responde com o que o modelo sabe sobre PostgreSQL e um agente que responde com o que **a sua empresa** documentou sobre aquele incidente — mesmo padrão da tool de compliance da aula 001, agora aplicado à base de conhecimento operacional.

**O que esta aula acrescenta à trilha:** o 10º papel (`get_sre_knowledge_agent`), o entrypoint `remediation.py` com a tool `consult_runbook` declarada inline e a base de conhecimento em `data/runbook_db.md`. O `core/llm_config.py`, os testes e as tools de `tools/` vêm das aulas anteriores sem alteração.

## Como funciona

```
alerta ("Saturação de Conexões" no serviço db)
   │
   ▼
Agente SRE de Resposta a Incidentes
   │  decide consultar a base de conhecimento e escolhe o serviço
   ▼
consult_runbook("db")  ──▶  data/runbook_db.md  ──▶  conteúdo no contexto do LLM
   │
   ▼
Resposta final em Markdown
   ├── Plano de remediação (diagnóstico + comandos SQL)
   └── Rascunho de post-mortem (resumo, linha do tempo, causa raiz, ações preventivas)
```

1. **Alerta** — a `Task` descreve o incidente e pede três coisas: consultar o runbook do serviço `db`, identificar o comando SQL de limpeza e escrever o post-mortem.
2. **Recuperação** — o agente decide chamar `consult_runbook` e escolhe o argumento `service_name`; a tool monta o caminho `data/runbook_{service_name}.md` e devolve o arquivo inteiro.
3. **Geração fundamentada** — o runbook entra no contexto do modelo, que redige o plano de remediação apoiado no que o documento traz sobre sintoma e diagnóstico.
4. **Post-mortem** — como o contexto do incidente já está carregado, o rascunho do documento pós-incidente sai na mesma volta, sem nova consulta.

O runbook (`data/runbook_db.md`) segue a estrutura clássica: **Sintoma** (o alerta, o erro da aplicação, a latência) e **Diagnóstico** (a query de `pg_stat_activity` que revela o estado das conexões).

## Tecnologias e Ferramentas

- [x] **Python 3.12** — runtime dos agentes
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — orquestração `Agent`/`Task`/`Crew`
- [x] **`@tool` decorator do CrewAI** — a tool de recuperação é declarada no próprio entrypoint
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** — motor de inferência (free tier); modelo em `GROQ_MODEL`, default `qwen/qwen3.6-27b`
- [x] **Markdown como base de conhecimento** — o runbook é um arquivo versionado no repositório, não um banco vetorial
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

Funcionando, o terminal mostra o painel `🤖 Agent Started` com o enunciado, a linha `Tool consult_runbook executed with result: # Runbook: Saturação de Conexões no PostgreSQL...` confirmando a recuperação, e o painel `✅ Agent Final Answer` com o plano de remediação e o post-mortem em Markdown. Roda em poucos segundos, com uma chamada de tool e sem escrever nada em disco. `uv run pytest -v` reporta **41 passed**.

## Estrutura do Projeto

```
010-rag-e-auto-remediacao/
├── remediation.py                # entrypoint: a tool consult_runbook, a task do
│                                 #   incidente e a Crew de um agente
├── data/
│   └── runbook_db.md             # base de conhecimento: sintoma + diagnóstico do
│                                 #   incidente de saturação de conexões
├── core/
│   ├── agents.py                 # + get_sre_knowledge_agent()  ← o 10º papel da trilha
│   └── llm_config.py             # Groq + RateLimitAwareLLM (herdado)
├── tools/                        # tools das aulas 001–006 (não usadas neste pipeline)
├── tests/                        # 41 testes herdados das aulas 003–005
└── pyproject.toml                # membro virtual do workspace uv; pythonpath = ["."]
```

## Conceitos trabalhados

- [x] **RAG (Retrieval-Augmented Generation)** — recuperar documentação oficial em tempo de execução para fundamentar a resposta, em vez de confiar na memória do modelo
- [x] **Runbook como fonte de verdade operacional** — sintoma, diagnóstico e remediação num documento versionado ao lado do código
- [x] **Agente de resposta a incidentes** — o 10º papel da trilha, com objetivo de propor remediação apoiada na base de conhecimento
- [x] **Tool de recuperação** — `consult_runbook` traduz "consultar a base de conhecimento" numa capacidade do agente
- [x] **Argumento de tool decidido pelo LLM** — é o modelo que escolhe qual runbook recuperar, a partir do serviço citado no alerta
- [x] **Auto-remediação e post-mortem** — os dois entregáveis do plantão gerados no mesmo ciclo

## Aprendizados

- [x] Dar ao agente uma tool que lê o runbook muda a resposta de "o que o modelo sabe sobre PostgreSQL" para "o que a empresa documentou sobre este incidente" — é o mesmo salto de *gerar* para *consultar e depois gerar* que a aula 001 introduziu com a tool de compliance
- [x] Num pipeline RAG o artefato a manter atualizado é o **documento**, não o prompt: o trecho coberto pelo runbook sai igual a cada execução, enquanto o que ele não cobre volta a ser preenchido pelo modelo
- [x] Pedir o post-mortem na mesma task é barato porque o contexto do incidente já está carregado — o rascunho sai da mesma volta do plano de remediação, sem nova consulta
- [x] Quando o argumento da tool vira caminho de arquivo, vale validá-lo contra uma lista de runbooks conhecidos: quem escolhe o valor é o modelo, e num pipeline real o alerta chega de fora (webhook, ticket, chat)
- [x] Recuperar um arquivo por nome é o degrau zero do RAG — indexação, embeddings e ranking só entram quando há vários documentos candidatos e a escolha de qual recuperar vira uma decisão

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [CrewAI — Tools](https://docs.crewai.com/concepts/tools)
- [Lewis et al. (2020) — Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks](https://arxiv.org/abs/2005.11401)
- [PostgreSQL — `pg_stat_activity`](https://www.postgresql.org/docs/current/monitoring-stats.html#MONITORING-PG-STAT-ACTIVITY-VIEW)
- [PostgreSQL — Funções de sinalização de servidor (`pg_terminate_backend`)](https://www.postgresql.org/docs/current/functions-admin.html#FUNCTIONS-ADMIN-SIGNAL)
- [Google SRE Book — Postmortem Culture](https://sre.google/sre-book/postmortem-culture/)
- [Groq — Rate limits (TPM/TPD por modelo)](https://console.groq.com/docs/rate-limits)
