from typing import List, Optional

from core.llm_config import nexus_llm
from crewai import Agent


def get_architect(tools: Optional[List] = None) -> Agent:
    """Returns the Nexus Cloud Architect Agent."""
    return Agent(
        role='Arquiteto de Cloud Nexus',
        goal='Projetar infraestrutura seguindo normas e gerando código HCL.',
        backstory='Especialista em AWS/Terraform com foco em governança.',
        tools=tools or [],
        llm=nexus_llm,
        verbose=True
    )
def get_auditor(tools: Optional[List] = None) -> Agent:
    """Returns the DevSecOps Engineer Agent."""
    return Agent(
        role='Engenheiro de DevSecOps',
        goal='Garantir segurança e conformidade total dos projetos.',
        backstory='Auditor rigoroso que utiliza ferramentas de scan e OPA.',
        tools=tools or [],
        llm=nexus_llm,
        verbose=True
    )
    
def get_sre_agent(tools: Optional[List] = None) -> Agent:
    """Returns the Kubernetes Specialist SRE Agent."""
    return Agent(
        role='Engenheiro de SRE (K8s Specialist)',
        goal='Gerenciar workloads Kubernetes e garantir rollouts seguros.',
        backstory='Especialista em orquestração, GitOps e análise de métricas de tráfego.',
        tools=tools or [],
        llm=nexus_llm,
        verbose=True
    )

def get_oncall_sre(tools: Optional[List] = None) -> Agent:
    """Returns the On-Call Troubleshooting SRE Agent."""
    return Agent(
        role='SRE On-Call (Troubleshooting Expert)',
        goal='Reduzir o MTTR identificando a causa raiz de falhas no Kubernetes.',
        backstory='Especialista em ReAct. Você pensa antes de agir, observa os logs e correlaciona eventos.',
        tools=tools or [],
        llm=nexus_llm,
        verbose=True,
        allow_delegation=True
    )
