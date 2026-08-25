import os
import sys

from core.agents import get_architect, get_auditor
from crewai import Crew, Process, Task
from tools.file_writer import write_file
from tools.security_scan import run_checkov_scan, validate_opa_policies

# Raiz do projeto: nesta trilha o entrypoint fica na raiz da aula, não em labs/
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Instantiate Agents with tools
architect = get_architect(tools=[write_file])
auditor = get_auditor(tools=[run_checkov_scan, validate_opa_policies])

task_gerar = Task(
    description="Gere um arquivo 'main.tf' para um bucket S3 seguro chamado 'nexus-apollo-data'. Região deve ser us-east-1.",
    expected_output="Arquivo main.tf gerado com sucesso.",
    agent=architect,
)

task_auditar = Task(
    description="Valide o 'main.tf' usando o checkov e OPA. Se houver erro, o arquiteto deve corrigir.",
    expected_output="Relatório de conformidade final.",
    agent=auditor,
)

nexus_pipeline = Crew(
    agents=[architect, auditor],
    tasks=[task_gerar, task_auditar],
    process=Process.sequential,
    verbose=True,
)

if __name__ == "__main__":
    print("\n🚀 EXECUTANDO PIPELINE MODULAR (MÓDULO 2)\n")
    nexus_pipeline.kickoff()
