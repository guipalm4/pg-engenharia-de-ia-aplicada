import os
import sys

from core.agents import (
    get_devsecops_agent,
    get_finops_agent,
    get_nexus_manager_agent,
    get_oncall_sre,
)
from crewai import Crew, Process, Task

# Raiz do projeto: nesta trilha o entrypoint fica na raiz da aula, não em labs/
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)


# 1. Instanciar os Agentes Especialistas
sre = get_oncall_sre()
seguranca = get_devsecops_agent()
finops = get_finops_agent()

# Delegação é atributo da COMPOSIÇÃO, não do agente: `get_oncall_sre` nasce com
# allow_delegation=True (útil no processo sequencial das aulas anteriores), mas
# no hierárquico isso lhe dá a tool `delegate_work_to_coworker` e ele delega
# para si mesmo -> "Executor is already running. Cannot invoke the same executor
# instance concurrently." Num hierárquico quem delega é só o manager.
for especialista in (sre, seguranca, finops):
    especialista.allow_delegation = False

# 2. Instanciar o Manager (O Cérebro)
# Ele coordenará os outros agentes sem precisar de uma Task manual para cada um
nexus_manager = get_nexus_manager_agent()

# 3. Definir a Missão Integradora
missao_complexa = Task(
    description="""
    ANALISAR E REMEDIAR INCIDENTE MULTIDOMÍNIO:
    1. O checkout-api está fora do ar (Erro 500 no K8s).
    2. Foi detectado um backdoor crítico no pacote XZ (vulnerability scan).
    3. O custo da infraestrutura subiu 40% na última hora.

    COORDENAÇÃO:
    - Peça ao SRE para analisar os logs do Kubernetes.
    - Peça ao Analista de Segurança para validar o risco do backdoor XZ.
    - Peça ao FinOps para identificar o que causou o pico de custo.

    ENTREGA: Um relatório executivo consolidado com as ações tomadas e o ROI da operação.
    """,
    expected_output="Relatório Executivo de Resposta a Incidentes e Otimização de Custos.",
    # Sem `agent=`: no processo hierárquico quem executa é sempre o manager
    # (Crew._get_agent_to_use). Fixar `agent=nexus_manager` aqui é pior que
    # redundante -- Crew._update_manager_tools monta a lista de coworkers a
    # partir de `task.agent` quando ele existe, então o manager só enxergaria
    # a si mesmo e a delegação falharia ("coworker mentioned not found" e
    # "Executor is already running"). Deixando vazio, a lista vira `agents`.
)

# 4. Configurar a Crew com Processo Hierárquico
# É aqui que a mágica acontece: o manager assume o comando
nexus_crew = Crew(
    agents=[sre, seguranca, finops],  # Os especialistas disponíveis
    tasks=[missao_complexa],
    process=Process.hierarchical,  # <--- O segredo do "Cérebro" está aqui
    manager_agent=nexus_manager,  # Define QUEM manda
    verbose=True,
    memory=False,  # Desativado para evitar erros de biblioteca no Mac
)

if __name__ == "__main__":
    print("\n🚀 [NEXUS-BOT] INICIANDO OPERAÇÃO HIERÁRQUICA...")
    resultado = nexus_crew.kickoff()

    print("\n🏆 RELATÓRIO FINAL DO PROJETO INTEGRADO:")
    print(resultado)
