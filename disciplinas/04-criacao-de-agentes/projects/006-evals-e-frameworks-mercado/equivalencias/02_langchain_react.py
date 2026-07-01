"""
Equivalencia 2 — LangChain (ReAct com AgentExecutor)

O mesmo agente de monitoramento implementado com LangChain.
Mostra que ReAct no nosso framework ≈ AgentExecutor do LangChain.

Requisitos:
  pip install langchain langchain-openai

Nota: Este arquivo e DIDATICO. Mostra a equivalencia de conceitos.
      Em producao, voce adicionaria error handling, retry, etc.
"""

from langchain_openai import ChatOpenAI
from langchain.agents import AgentExecutor, create_react_agent
from langchain.tools import tool
from langchain.prompts import PromptTemplate


# --- TOOLS (equivalente a skills.md) ---

@tool
def consultar_metricas(nome_servico: str, janela_tempo_minutos: int = 60) -> dict:
    """Consulta metricas de latencia, throughput e taxa de erro do servico."""
    # Em producao: chamaria API do Grafana/Datadog/etc
    return {
        "latencia_p99_ms": 450.2,
        "vazao_rps": 120,
        "taxa_erro": 12.3,
        "status": "degradado",
    }


@tool
def buscar_logs(nome_servico: str, janela_tempo_minutos: int = 60, nivel_minimo: str = "WARN") -> dict:
    """Busca logs estruturados do servico em uma janela de tempo."""
    return {
        "eventos": [
            {"nivel": "ERROR", "mensagem": "timeout em upstream-service"},
            {"nivel": "WARN", "mensagem": "latencia acima do SLO"},
        ],
        "contagem_total": 2,
    }


@tool
def historico_deploys(nome_servico: str, janela_tempo_horas: int = 24) -> dict:
    """Consulta historico de deploys recentes do servico."""
    return {
        "deploys": [
            {"versao": "v2.3.1", "data": "ha 30 min", "autor": "ci/cd"},
        ],
        "contagem_total": 1,
    }


@tool
def relatorio_incidente(nome_servico: str, severidade: str, evidencia: str, recomendacao: str) -> dict:
    """Abre incidente formal com evidencias e recomendacao."""
    return {
        "id_incidente": "INC-2024-042",
        "status": "aberto",
    }


# --- PROMPT (equivalente a planner.md) ---

template = """Voce e um agente de monitoramento de incidentes de producao.

Objetivo: resolver_incidente

Voce tem acesso a estas ferramentas:
{tools}

Use o formato:
Thought: o que eu sei e o que preciso fazer
Action: nome da ferramenta
Action Input: argumentos em JSON
Observation: resultado da ferramenta
... (repete ate resolver)
Thought: ja tenho evidencias suficientes
Final Answer: diagnostico completo

Regras:
- Coletar evidencias de metricas, logs e deploys antes de diagnosticar
- So finalizar apos registrar o incidente
- Nunca inventar evidencia

{agent_scratchpad}

Pergunta: {input}
"""

prompt = PromptTemplate.from_template(template)


# --- AGENTE (equivalente ao nosso ciclo.py + planner + executor) ---

def criar_agente():
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    ferramentas = [consultar_metricas, buscar_logs, historico_deploys, relatorio_incidente]

    # create_react_agent → equivalente ao nosso ReAct planner
    agente = create_react_agent(llm, ferramentas, prompt)

    # AgentExecutor → equivalente ao nosso ciclo.py
    executor = AgentExecutor(
        agent=agente,
        tools=ferramentas,
        verbose=True,         # equivalente aos nossos hooks de log
        max_iterations=10,    # equivalente ao nosso max_etapas
        handle_parsing_errors=True,  # equivalente ao nosso circuit breaker
    )

    return executor


# --- MAPEAMENTO DE CONCEITOS ---
#
# Nosso Framework          →  LangChain
# ─────────────────────────────────────────────
# agent.md                 →  prompt template
# skills.md                →  @tool decorators
# planner.md (ReAct)       →  create_react_agent()
# ciclo.py                 →  AgentExecutor
# rules.md (max_etapas)    →  max_iterations
# hooks.md (log)           →  verbose=True
# circuit_breaker          →  handle_parsing_errors
# trace.json               →  callbacks / LangSmith
# --arquitetura react      →  create_react_agent (padrao)
#

if __name__ == "__main__":
    executor = criar_agente()
    resultado = executor.invoke({
        "input": "alerta de latencia elevada no servico de pagamentos"
    })
    print(resultado["output"])
