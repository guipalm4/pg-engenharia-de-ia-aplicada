import os
import sys

from core.agents import get_sre_knowledge_agent
from crewai import Crew, Task
from crewai.tools import tool

# Raiz do projeto: nesta trilha o entrypoint fica na raiz da aula, não em labs/
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


# --- TOOL DEFINITION (RAG FOR RUNBOOK) ---
@tool("consult_runbook")
def consult_runbook(service_name: str) -> str:
    """Reads the official runbook file for a specific service and returns the remediation steps."""
    runbook_path = os.path.join(PROJECT_ROOT, "data", f"runbook_{service_name}.md")
    try:
        with open(runbook_path, "r", encoding="utf-8") as file:
            return file.read()
    except FileNotFoundError:
        return f"Error: Runbook for service '{service_name}' not found."


# --- CONFIGURATION ---
agent = get_sre_knowledge_agent(tools=[consult_runbook])

task_remediate_incident = Task(
    description="""
    Recebemos um alerta de 'Saturação de Conexões' no banco de dados (db).
    1. Consulte o runbook oficial para o serviço 'db'.
    2. Identifique o comando SQL exato para limpar conexões ociosas.
    3. Escreva um rascunho de 'Post-mortem' resumindo o incidente e a solução aplicada.""",
    agent=agent,
    expected_output="Plano de remediação baseado no runbook e rascunho de Post-mortem.",
)

if __name__ == "__main__":
    print("\n📚 INICIANDO MÓDULO 10: RAG & AUTO-REMEDIAÇÃO\n")
    crew = Crew(agents=[agent], tasks=[task_remediate_incident])
    crew.kickoff()
