import os
import sys

from core.agents import get_aiops_agent
from crewai import Crew, Task
from tools.aiops_tools import (
    generate_grafana_dashboard,
    nl_to_promql,
    predictive_disk_alert,
)

# Ensure project root is in the Python path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

# Instanciando o Agente com suas 3 ferramentas
aiops_agent = get_aiops_agent(
    tools=[nl_to_promql, predictive_disk_alert, generate_grafana_dashboard]
)

# Tarefa única que passa por todas as ferramentas da aula
task_aiops_workflow = Task(
    description="""Temos um relato de lentidão no banco de dados e suspeita de disco enchendo. Execute o fluxo de AIOps.

    REGRA OBRIGATÓRIA: cada passo abaixo DEVE ser executado chamando a ferramenta indicada.
    Nunca produza o resultado de um passo de cabeça — a saída válida é a que a ferramenta retornar.

    1. Chame `nl_to_promql` com "qual a porcentagem de disco livre?".
    2. Chame `predictive_disk_alert` com 'Uso atual 85%. Crescimento de 2GB por hora contínuo'.
    3. Chame `generate_grafana_dashboard` com 'Disk Saturation' para persistir o painel em disco.

    Só depois de as três ferramentas terem retornado, escreva a resposta final.""",
    expected_output="O PromQL gerado, o alerta preditivo detalhado e o JSON do dashboard.",
    agent=aiops_agent,
)

if __name__ == "__main__":
    print("\n📈 INICIANDO MÓDULO 5: AIOPS & OBSERVABILIDADE PREDITIVA\n")
    crew = Crew(agents=[aiops_agent], tasks=[task_aiops_workflow], verbose=True)
    crew.kickoff()
