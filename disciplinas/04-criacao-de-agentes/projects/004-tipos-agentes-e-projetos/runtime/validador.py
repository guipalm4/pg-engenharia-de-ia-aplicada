"""
Validador de Agente.

Verifica se os contratos do agente estao completos e consistentes.
"""

from pathlib import Path

from contratos import carregar_yaml_do_md


def validar(caminho_agente: str) -> bool:
    """Valida se os contratos do agente estao completos e consistentes."""
    caminho = Path(caminho_agente).resolve()
    pasta_contratos = caminho / "contracts"
    erros = []
    avisos = []

    print(f"\n{'='*60}")
    print(f"  Validando agente: {caminho.name}")
    print(f"{'='*60}\n")

    # 1. verificar existencia dos arquivos obrigatorios
    arquivos_obrigatorios = {
        "agent.md": caminho / "agent.md",
        "rules.md": caminho / "rules.md",
        "skills.md": caminho / "skills.md",
        "hooks.md": caminho / "hooks.md",
        "memory.md": caminho / "memory.md",
        "contracts/loop.md": pasta_contratos / "loop.md",
        "contracts/planner.md": pasta_contratos / "planner.md",
        "contracts/executor.md": pasta_contratos / "executor.md",
        "contracts/toolbox.md": pasta_contratos / "toolbox.md",
    }

    for nome, caminho_arquivo in arquivos_obrigatorios.items():
        if caminho_arquivo.exists():
            yaml_data = carregar_yaml_do_md(caminho_arquivo)
            if not yaml_data:
                erros.append(f"  [ERRO] {nome} existe mas nao contem YAML valido")
            else:
                print(f"  [OK] {nome}")
        else:
            erros.append(f"  [ERRO] {nome} nao encontrado")

    # 2. verificar consistencia entre contratos
    habilidades = carregar_yaml_do_md(caminho / "skills.md")
    toolbox = carregar_yaml_do_md(pasta_contratos / "toolbox.md")
    regras = carregar_yaml_do_md(caminho / "rules.md")
    agente = carregar_yaml_do_md(caminho / "agent.md")

    nomes_habilidades = {h["nome"] for h in habilidades.get("habilidades", []) if "nome" in h}
    nomes_toolbox = {f["nome"] for f in toolbox.get("ferramentas", []) if "nome" in f}

    # ferramentas no toolbox devem existir em skills
    for nome in nomes_toolbox - nomes_habilidades:
        erros.append(f"  [ERRO] ferramenta '{nome}' esta no toolbox.md mas nao em skills.md")

    for nome in nomes_habilidades - nomes_toolbox:
        avisos.append(f"  [AVISO] ferramenta '{nome}' esta em skills.md mas nao no toolbox.md")

    # ferramentas obrigatorias devem existir em skills
    for nome in regras.get("ferramentas_obrigatorias", []):
        if nome not in nomes_habilidades:
            erros.append(f"  [ERRO] ferramenta obrigatoria '{nome}' nao existe em skills.md")

    # limites por ferramenta devem referir ferramentas existentes
    chamadas = regras.get("limites", {}).get("chamadas_ferramenta", {})
    if isinstance(chamadas, dict):
        for nome in chamadas:
            if nome != "total" and nome not in nomes_habilidades:
                avisos.append(f"  [AVISO] limite definido para '{nome}' que nao existe em skills.md")

    # tipo do agente deve ser valido
    tipo = agente.get("tipo", "")
    tipos_validos = {"task_based", "interactive", "goal_oriented", "autonomous"}
    if tipo and tipo not in tipos_validos:
        erros.append(f"  [ERRO] tipo '{tipo}' invalido. Valores: {', '.join(tipos_validos)}")

    # contrato de saida deve ter campos obrigatorios
    contrato_saida = agente.get("contrato_saida", {})
    if not contrato_saida:
        avisos.append("  [AVISO] agent.md nao define contrato_saida")
    elif not contrato_saida.get("campos_obrigatorios"):
        avisos.append("  [AVISO] contrato_saida nao define campos_obrigatorios")

    # 3. exibir resultado
    print()
    for aviso in avisos:
        print(aviso)
    for erro in erros:
        print(erro)

    total_erros = len(erros)
    total_avisos = len(avisos)
    print(f"\n{'='*60}")
    if total_erros == 0:
        print(f"  Resultado: VALIDO ({total_avisos} avisos)")
    else:
        print(f"  Resultado: INVALIDO ({total_erros} erros, {total_avisos} avisos)")
    print(f"{'='*60}\n")

    return total_erros == 0
