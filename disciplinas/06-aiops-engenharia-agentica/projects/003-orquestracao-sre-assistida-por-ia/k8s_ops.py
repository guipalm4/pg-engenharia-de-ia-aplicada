import os
import sys

# Ensure project root is in the Python path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from core.agents import get_architect, get_sre_agent
from crewai import Crew, Process, Task
from tools.k8s_ops import (
    analyze_canary_metrics,
    apply_k8s_manifest,
    generate_k8s_manifest,
)

# 1. Configurar Agentes
# O Arquiteto gera o YAML e o SRE "aplica" e analisa o sucesso
architect = get_architect(tools=[generate_k8s_manifest])
sre = get_sre_agent(tools=[apply_k8s_manifest, analyze_canary_metrics])

# 2. Definir Tarefas do Fluxo GitOps
task_design = Task(
    description="""Desenhe o manifesto K8s para o app 'nexus-api-unipds' com 2 réplicas na porta 80.
    ATENÇÃO: Como estamos em um ambiente de laboratório, utilize obrigatoriamente a imagem publica 'nginx:latest' para todos os containers.
    ATENÇÃO 2: Na API do k8s, se for sugerir tempo de espera no probe, utilize obrigatoriamente `initialDelaySeconds` (e nunca apenas `initialDelay`).""",
    expected_output="Arquivo YAML criado no disco com sintaxe Kubernetes V1 estrita.",
    agent=architect
)

task_sync = Task(
    description="Realize a reconciliação (Sync) do manifesto 'nexus-api-unipds-k8s.yaml' no cluster usando o apply_k8s_manifest.",
    expected_output="Confirmação de que o estado desejado foi enviado ao cluster.",
    agent=sre
)

task_monitor = Task(
    description="Após o deploy, analise estas métricas: 'error_rate: 1%, latency: 80ms'. Decida o sucesso do rollout.",
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