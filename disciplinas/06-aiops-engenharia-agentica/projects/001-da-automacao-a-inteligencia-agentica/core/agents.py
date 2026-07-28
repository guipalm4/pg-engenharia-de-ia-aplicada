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