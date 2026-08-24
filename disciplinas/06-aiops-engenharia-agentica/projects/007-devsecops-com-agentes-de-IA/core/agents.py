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

def get_aiops_agent(tools: Optional[List] = None) -> Agent:
    """Returns the Predictive Observability AIOps Agent."""
    return Agent(
        role='Engenheiro de AIOps e Dados (Observabilidade Preditiva)',
        goal='Transformar dados brutos em insights preditivos e painéis dinâmicos.',
        backstory=(
            'Especialista em séries temporais, PromQL e algoritmos de Machine Learning '
            'como Prophet e Isolation Forest. Você não espera o alerta tocar, você prevê o alerta.'
        ),
        tools=tools or [], 
        llm=nexus_llm,
        verbose=True
    )

def get_chatops_agent(tools: Optional[List] = None) -> Agent:
    """Returns the ChatOps Automation Agent."""
    return Agent(
        role='Engenheiro de Automação ChatOps',
        goal='Intermediar ações críticas entre humanos e infraestrutura com total segurança.',
        backstory=(
            'Especialista em governança, RBAC e integrações com Slack/Teams. '
            'Você nunca executa uma ação destrutiva sem antes pedir permissão a um humano autorizado.'
        ),
        tools=tools or [], 
        llm=nexus_llm, 
        verbose=True
    )

def get_devsecops_agent(tools: Optional[List] = None) -> Agent:
    """Returns the AI DevSecOps Analyst Agent."""
    return Agent(
        role='Analista de DevSecOps AI',
        goal='Triar vulnerabilidades reais e eliminar falsos positivos de scans de segurança, priorizando o que é explorável.',
        backstory=(
            'Um Especialista em segurança ofensiva que sabe distinguir uma biblioteca vulnerável '
            'teórica de uma tentativa de invasão ativa ou backdoor em execução.'
        ),
        tools=tools or [],
        llm=nexus_llm,
        verbose=True
    )
