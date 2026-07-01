"""
Carregador de Contratos e Estado.

Le contratos (.md com YAML) e cria o estado inicial do agente.
"""

import re
from pathlib import Path

import yaml


def carregar_yaml_do_md(caminho_arquivo: Path) -> dict:
    """Extrai o primeiro bloco YAML de um arquivo .md."""
    if not caminho_arquivo.exists():
        return {}
    texto = caminho_arquivo.read_text(encoding="utf-8")
    correspondencia = re.search(r"```yaml\n(.*?)```", texto, re.DOTALL)
    if not correspondencia:
        return {}
    return yaml.safe_load(correspondencia.group(1)) or {}


def carregar_contratos(caminho_agente: Path, arquitetura: str = None) -> dict:
    """Carrega todos os contratos de um agente.

    Se ``arquitetura`` for informada, sobrescreve planner.md e executor.md
    com os da pasta ``architectures/<arquitetura>/``.
    """
    pasta_contratos = caminho_agente / "contracts"

    contratos = {
        "agente": carregar_yaml_do_md(caminho_agente / "agent.md"),
        "ciclo": carregar_yaml_do_md(pasta_contratos / "loop.md"),
        "planejador": carregar_yaml_do_md(pasta_contratos / "planner.md"),
        "caixa_ferramentas": carregar_yaml_do_md(pasta_contratos / "toolbox.md"),
        "executor": carregar_yaml_do_md(pasta_contratos / "executor.md"),
        "regras": carregar_yaml_do_md(caminho_agente / "rules.md"),
        "ganchos": carregar_yaml_do_md(caminho_agente / "hooks.md"),
        "habilidades": carregar_yaml_do_md(caminho_agente / "skills.md"),
        "memoria": carregar_yaml_do_md(caminho_agente / "memory.md"),
    }

    if arquitetura:
        raiz = Path(caminho_agente).resolve().parent
        pasta_arq = raiz / "architectures" / arquitetura
        if not pasta_arq.exists():
            print(f"  [aviso] pasta de arquitetura nao encontrada: {pasta_arq}")
        else:
            planner_arq = carregar_yaml_do_md(pasta_arq / "planner.md")
            executor_arq = carregar_yaml_do_md(pasta_arq / "executor.md")
            if planner_arq:
                contratos["planejador"] = planner_arq
                print(f"  [arquitetura] planner.md carregado de {arquitetura}/")
            if executor_arq:
                contratos["executor"] = executor_arq
                print(f"  [arquitetura] executor.md carregado de {arquitetura}/")
            critic_arq = carregar_yaml_do_md(pasta_arq / "critic.md")
            if critic_arq:
                contratos["critico"] = critic_arq
                print(f"  [arquitetura] critic.md carregado de {arquitetura}/")

    return contratos


def criar_estado(contratos: dict, texto_entrada: str, modo: str = None, evento: str = None, arquitetura: str = None) -> dict:
    """Cria o estado inicial do agente a partir dos contratos."""
    regras = contratos.get("regras", {})
    ciclo = contratos.get("ciclo", {})
    agente = contratos.get("agente", {})
    config_chamadas = regras.get("limites", {}).get("chamadas_ferramenta", {})

    if isinstance(config_chamadas, dict):
        max_chamadas_ferramenta = config_chamadas.get("total", 10)
        limites_por_ferramenta = {
            nome_ferramenta: limite
            for nome_ferramenta, limite in config_chamadas.items()
            if nome_ferramenta != "total"
        }
    else:
        max_chamadas_ferramenta = config_chamadas
        limites_por_ferramenta = {}

    # tipo do agente: parametro CLI sobrescreve contrato
    tipo_agente = modo or agente.get("tipo", "task_based")

    return {
        "objetivo": ciclo.get("objetivo", "desconhecido"),
        "entrada": texto_entrada,
        "tipo_agente": tipo_agente,
        "arquitetura": arquitetura or "padrao",
        "evento": evento,
        "etapa": 0,
        "chamadas_ferramenta": 0,
        "chamadas_por_ferramenta": {},
        "max_etapas": regras.get("limites", {}).get("max_etapas", 10),
        "max_chamadas_ferramenta": max_chamadas_ferramenta,
        "limites_por_ferramenta": limites_por_ferramenta,
        "sem_progresso": regras.get("limites", {}).get("sem_progresso", 3),
        "limite_tempo_segundos": regras.get("limites", {}).get("limite_tempo_segundos", 120),
        "max_tokens": regras.get("limites", {}).get("max_tokens", 50000),
        "tokens_consumidos": {"prompt": 0, "completion": 0, "total": 0},
        "acoes_sensiveis": regras.get("acoes_sensiveis", []),
        "historico": [],
        "concluido": False,
        "resultado": "",
        "etapas_sem_progresso": 0,
        "ultima_ferramenta": None,
    }
