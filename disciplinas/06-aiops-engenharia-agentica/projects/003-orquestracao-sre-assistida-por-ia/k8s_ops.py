import os
import sys

# Raiz do projeto: nesta trilha o entrypoint fica na raiz da aula, não em labs/
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from core.agents import get_architect, get_sre_agent
from crewai import Crew, Process, Task
from tools.k8s_ops import (
    analyze_canary_metrics,
    apply_k8s_manifest,
    generate_k8s_manifest,
)

# Troque para "error_rate: 8%, latency: 80ms" para exercitar o caminho de ROLLBACK.
CANARY_METRICS = "error_rate: 1%, latency: 80ms"

# 1. Configurar Agentes
# O Arquiteto gera o YAML e o SRE "aplica" e analisa o sucesso
architect = get_architect(tools=[generate_k8s_manifest])
sre = get_sre_agent(tools=[apply_k8s_manifest, analyze_canary_metrics])

# 2. Definir Tarefas do Fluxo GitOps
# A imagem do container e a forma do readinessProbe NÃO são pedidas aqui: elas são
# garantidas pelo template em tools/k8s_ops.py, onde o LLM não tem como violá-las.
task_design = Task(
    description="Desenhe o manifesto K8s para o app 'nexus-api-unipds' com 2 réplicas na porta 80.",
    expected_output="Arquivo YAML criado no disco com sintaxe Kubernetes V1 estrita.",
    agent=architect
)

task_sync = Task(
    description="Realize a reconciliação (Sync) do manifesto 'nexus-api-unipds-k8s.yaml' no cluster usando o apply_k8s_manifest.",
    expected_output="Confirmação de que o estado desejado foi enviado ao cluster.",
    agent=sre
)

task_monitor = Task(
    description=(
        f"Após o deploy, analise estas métricas com a ferramenta analyze_canary_metrics, "
        f"repassando a string EXATAMENTE como está: '{CANARY_METRICS}'. "
        f"Decida o sucesso do rollout com base na resposta da ferramenta."
    ),
    expected_output="Decisão final sobre o estado do deploy (Healthy/Unhealthy).",
    agent=sre,
    tools=[analyze_canary_metrics]
)

# 3. Orquestração
nexus_k8s_pipeline = Crew(
    agents=[architect, sre],
    tasks=[task_design, task_sync, task_monitor],
    process=Process.sequential,
    verbose=True
)

if __name__ == "__main__":
    print("\n🚀 INICIANDO MÓDULO 3: K8S AI-OPS & GITOPS FLOW\n")
    nexus_k8s_pipeline.kickoff()
