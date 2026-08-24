import os
import sys

from core.agents import get_cicd_agent
from crewai import Crew, Task
from crewai.tools import tool

# Raiz do projeto: nesta trilha o entrypoint fica na raiz da aula, não em labs/
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


# --- TOOL DEFINITION ---
@tool("analyze_workflow_yaml")
def analyze_workflow_yaml(file_path: str) -> str:
    """Reads a CI/CD workflow YAML file and returns its content for bottleneck analysis."""
    with open(file_path, "r", encoding="utf-8") as file:
        return file.read()


# --- CONFIGURATION ---
yaml_workflow_path = os.path.join(PROJECT_ROOT, "data", "workflow_lento.yaml")

agent = get_cicd_agent(tools=[analyze_workflow_yaml])

task_optimize_cicd = Task(
    description=f"""
    Analise o workflow em '{yaml_workflow_path}'.
    Identifique por que ele está lento e custando caro (dica: falta de cache).
    Reescreva o trecho do YAML aplicando as melhores práticas de cache para Node.js
    e explique quanto tempo estimamos economizar.""",
    agent=agent,
    expected_output="Sugestão de YAML otimizado com explicação técnica das melhorias.",
)

if __name__ == "__main__":
    print("\n⚡ INICIANDO MÓDULO 8: OTIMIZAÇÃO DE CI/CD\n")
    crew = Crew(agents=[agent], tasks=[task_optimize_cicd])
    crew.kickoff()
