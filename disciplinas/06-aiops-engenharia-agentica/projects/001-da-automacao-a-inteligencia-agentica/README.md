# Exemplo 001 — Da Automação à Inteligência Agêntica
> Primeiro agente autônomo da trilha AI-Ops: um Arquiteto de Cloud que projeta infraestrutura consultando, via RAG, as normas internas de compliance da empresa antes de responder.

## Contexto
- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição
Este projeto é o ponto de partida da trilha: um único agente CrewAI (`Arquiteto de Cloud Nexus`) recebe a tarefa de desenhar um bucket S3 para logs "seguindo as normas da empresa Nexus". Em vez de responder de memória, o agente é equipado com uma tool (`check_compliance_rules`) que consulta uma base de políticas corporativas e retorna as regras aplicáveis — aqui simuladas como uma resposta fixa (prefixo `nexus-`, região `us-east-1`, bucket sempre privado).

A ideia central da aula é a passagem de **IA generativa solta** para **IA consultiva**: o agente não inventa a política de nomenclatura/segurança, ele é obrigado a buscá-la numa fonte de verdade (aqui, um stub de RAG) antes de produzir o plano de infraestrutura. É a base sobre a qual os módulos seguintes da trilha (IaC declarativo, Kubernetes, troubleshooting, FinOps etc.) vão se apoiar.

A inteligência do projeto roda em cima da Groq (`qwen/qwen3.6-27b` via LiteLLM, trocável por `GROQ_MODEL`), com um workaround explícito no `llm_config.py` para um bug conhecido do CrewAI (`crewai/issues/5886`): o CrewAI marca toda mensagem com um `cache_breakpoint` pensado para prompt caching da Anthropic, e a Groq/LiteLLM rejeita esse campo desconhecido — o projeto neutraliza o marcador antes da chamada. O `llm_config.py` também lê o modelo de `GROQ_MODEL` (default `qwen/qwen3.6-27b`) e fixa `max_tokens=2560`. O teto importa mais do que parece: a Groq **reserva** `max_tokens` do orçamento no momento da chamada em vez de cobrar o consumo real, então um valor alto demais provoca rate limit sem consumir nada. Essas duas escolhas foram medidas na [aula 005](../005-observabilidade-preditiva/README.md#aprendizados) e aplicadas retroativamente às cinco.

## Tecnologias e Ferramentas
- [x] **Python 3** — runtime do agente
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — framework de agentes e orquestração de `Agent`/`Task`/`Crew`
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** (`qwen/qwen3.6-27b`, trocável por `GROQ_MODEL` no `.env`) — motor de inferência dos agentes (free tier)
- [x] **python-dotenv** — carga da `GROQ_API_KEY` a partir de `.env`

## Pré-requisitos
- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python e as dependências; não é preciso instalar Python à parte
- **Python 3.12.11** — baixado automaticamente pelo uv (pin em `projects/.python-version`; a mesma versão do material da professora, e evita o 3.13/3.14 por compatibilidade com CrewAI/Pydantic)
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`) — um único `.env` na raiz de `projects/` serve todas as aulas

## Como executar
Os projetos da disciplina compartilham um único ambiente (workspace uv). O setup é feito uma vez na raiz de `projects/` — detalhes no [README da disciplina](../README.md).

```bash
cd disciplinas/06-aiops-engenharia-agentica/projects

# 1. setup (uma vez para todas as aulas)
cp .env.example .env && $EDITOR .env   # cole a GROQ_API_KEY
uv sync --all-packages

# 2. rodar o agente
cd 001-da-automacao-a-inteligencia-agentica
uv run foundation.py
```

## Estrutura do Projeto
```
001-da-automacao-a-inteligencia-agentica/
├── foundation.py           # entrypoint: monta a Task e roda a Crew com um único agente
├── core/
│   ├── agents.py            # get_architect() — define o Agente Arquiteto de Cloud Nexus
│   └── llm_config.py        # configura o LLM da Groq + workaround do cache_breakpoint
├── tools/
│   └── policy_rag.py        # tool check_compliance_rules — consulta de políticas (RAG stub)
└── pyproject.toml           # dependências desta aula (membro do workspace uv)
```

## Como funciona
```
foundation.py
   │
   ├─ get_architect(tools=[check_compliance_rules])   # core/agents.py
   │        └─ Agent(role="Arquiteto de Cloud Nexus", llm=nexus_llm, ...)
   │
   ├─ Task("Desenhe um bucket S3 para logs seguindo as normas da empresa Nexus")
   │
   └─ Crew(agents=[architect], tasks=[task_design_s3]).kickoff()
              │
              ▼
     agente decide chamar check_compliance_rules(query)   # tools/policy_rag.py
              │
              ▼
     "Prefix nexus-, região us-east-1, bucket sempre privado"
              │
              ▼
     agente incorpora a política na resposta final (plano de bucket S3)
```

1. **Configuração do LLM** — `core/llm_config.py` centraliza a instância `LLM` da Groq usada por todos os agentes do projeto, incluindo o workaround para o bug do `cache_breakpoint` do CrewAI com a Groq/LiteLLM.
2. **Definição do agente** — `core/agents.py` expõe `get_architect(tools)`, que monta o `Agent` com role, goal e backstory fixos, aceitando uma lista de tools injetável (aqui, só `check_compliance_rules`).
3. **Tool de compliance** — `tools/policy_rag.py` expõe `check_compliance_rules` como uma `@tool` do CrewAI; hoje é uma resposta fixa, mas o papel dela na arquitetura é o de um RAG sobre normas corporativas.
4. **Execução** — `foundation.py` instancia o agente com a tool, cria uma `Task` de design de bucket S3 e roda a `Crew` com `kickoff()`, imprimindo o resultado do agente.

## Conceitos trabalhados
- [x] **IA consultiva vs. generativa solta** — o agente é forçado a consultar uma fonte de política antes de decidir, em vez de responder de memória
- [x] **Agente com tool única e objetivo restrito** — primeiro contato da trilha com `Agent`/`Task`/`Crew` do CrewAI
- [x] **Injeção de tools no agente** — `get_architect(tools=...)` recebe a lista de ferramentas de fora, desacoplando definição de agente de definição de capacidades
- [x] **Compatibilidade entre provedores de LLM** — workaround explícito para uma incompatibilidade real entre CrewAI e Groq/LiteLLM (`cache_breakpoint`)

## Aprendizados
- [x] Uma tool simples (mesmo que hoje seja uma resposta fixa) já muda o comportamento do agente de "gerar" para "consultar e depois gerar" — é o embrião do padrão RAG que a trilha vai aprofundar em módulos posteriores.
- [x] Trocar de provedor de LLM (aqui, Groq em vez de OpenAI/Anthropic) expõe incompatibilidades de baixo nível entre frameworks (CrewAI) e adaptadores (LiteLLM) que não aparecem na documentação — o `llm_config.py` documenta o bug e a razão do workaround diretamente no código.

## Referências
- [CrewAI Docs](https://docs.crewai.com/)
- [Groq API](https://console.groq.com/docs)
- [CrewAI issue #5886 — cache_breakpoint incompatível com Groq/LiteLLM](https://github.com/crewAIInc/crewAI/issues/5886)
