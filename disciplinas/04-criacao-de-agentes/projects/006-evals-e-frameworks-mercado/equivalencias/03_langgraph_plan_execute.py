"""
Equivalencia 3 — LangGraph (Plan-and-Execute com grafo de estados)

O mesmo agente implementado com LangGraph.
Mostra que Plan-Execute no nosso framework ≈ workflow em grafo do LangGraph.

Requisitos:
  pip install langgraph langchain-openai

Nota: Este arquivo e DIDATICO. Mostra a equivalencia de conceitos.
"""

from typing import TypedDict, Annotated
from langgraph.graph import StateGraph, END
from langchain_openai import ChatOpenAI


# --- ESTADO (equivalente ao nosso criar_estado) ---

class EstadoAgente(TypedDict):
    entrada: str
    plano: list          # lista de passos planejados
    passo_atual: int
    resultados: dict     # resultados por ferramenta
    diagnostico: str


# --- NOS DO GRAFO (cada no = uma fase do ciclo) ---

def planejar(estado: EstadoAgente) -> EstadoAgente:
    """Fase de planejamento — gera plano completo.
    Equivalente ao nosso planner.md com modo_execucao: plan_execute.
    """
    llm = ChatOpenAI(model="gpt-4o-mini", temperature=0)

    resposta = llm.invoke(
        f"Voce e um planejador de incidentes. "
        f"Crie um plano com 4 passos para investigar: {estado['entrada']}. "
        f"Retorne apenas os nomes dos passos separados por virgula."
    )

    passos = [p.strip() for p in resposta.content.split(",")]
    return {**estado, "plano": passos, "passo_atual": 0}


def executar_passo(estado: EstadoAgente) -> EstadoAgente:
    """Executa o proximo passo do plano.
    Equivalente ao nosso executor.py seguindo o plano armazenado.
    """
    passo = estado["plano"][estado["passo_atual"]]
    # Em producao: chamaria a ferramenta real
    resultado = f"Resultado simulado de: {passo}"

    resultados = {**estado["resultados"], passo: resultado}
    return {**estado, "resultados": resultados, "passo_atual": estado["passo_atual"] + 1}


def avaliar(estado: EstadoAgente) -> EstadoAgente:
    """Avalia se o plano foi completado.
    Equivalente ao nosso avaliar() no executor.py.
    """
    if estado["passo_atual"] >= len(estado["plano"]):
        diagnostico = f"Plano completo. {len(estado['resultados'])} passos executados."
        return {**estado, "diagnostico": diagnostico}
    return estado


def deve_continuar(estado: EstadoAgente) -> str:
    """Decide se continua executando ou finaliza.
    Equivalente as condicoes_parada do nosso loop.md.
    """
    if estado.get("diagnostico"):
        return "fim"
    if estado["passo_atual"] >= len(estado["plano"]):
        return "fim"
    return "executar"


# --- GRAFO (equivalente ao nosso ciclo.py) ---

def criar_grafo():
    grafo = StateGraph(EstadoAgente)

    # adicionar nos
    grafo.add_node("planejar", planejar)
    grafo.add_node("executar", executar_passo)
    grafo.add_node("avaliar", avaliar)

    # definir fluxo
    grafo.set_entry_point("planejar")
    grafo.add_edge("planejar", "executar")
    grafo.add_edge("executar", "avaliar")
    grafo.add_conditional_edges("avaliar", deve_continuar, {
        "executar": "executar",
        "fim": END,
    })

    return grafo.compile()


# --- MAPEAMENTO DE CONCEITOS ---
#
# Nosso Framework                →  LangGraph
# ─────────────────────────────────────────────────
# agent.md                       →  EstadoAgente (TypedDict)
# contracts/loop.md              →  StateGraph (definicao do grafo)
# contracts/planner.md           →  no "planejar"
# contracts/executor.md          →  no "executar"
# ciclo.py (loop principal)      →  grafo.compile() + invoke()
# condicoes_parada               →  conditional_edges (deve_continuar)
# modo_execucao: plan_execute    →  fluxo: planejar → executar → avaliar → (loop ou fim)
# estado (dict com historico)    →  EstadoAgente (TypedDict)
# hooks.md                       →  callbacks do LangGraph
# trace.json                     →  LangSmith traces
# --arquitetura plan_execute     →  estrutura do grafo define a arquitetura
#
# DIFERENCA CHAVE:
# No nosso framework, a arquitetura e definida por contrato (Markdown).
# No LangGraph, a arquitetura e definida por codigo (Python).
# O conceito e o mesmo. A representacao e diferente.
#

if __name__ == "__main__":
    app = criar_grafo()
    resultado = app.invoke({
        "entrada": "alerta de latencia elevada no servico de pagamentos",
        "plano": [],
        "passo_atual": 0,
        "resultados": {},
        "diagnostico": "",
    })
    print(resultado["diagnostico"])
