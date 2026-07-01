"""
Engine de Benchmark — roda um dataset contra uma arquitetura e coleta metricas.

Uso (via main.py):
  python main.py benchmark --agente ../monitor-agent --suite ../evals/suites/monitor-agent.yaml
  python main.py benchmark --agente ../monitor-agent --suite ../evals/suites/monitor-agent.yaml --arquitetura react
  python main.py benchmark --agente ../monitor-agent --suite ../evals/suites/monitor-agent.yaml --arquitetura plan_execute
  python main.py benchmark --agente ../monitor-agent --suite ../evals/suites/monitor-agent.yaml --arquitetura reflect
"""

import json
import time
from pathlib import Path

import yaml

from ciclo import rodar


def _carregar_suite(caminho_suite: Path) -> dict:
    """Carrega a eval suite (YAML)."""
    texto = caminho_suite.read_text(encoding="utf-8")
    return yaml.safe_load(texto)


def _carregar_dataset(caminho_suite: Path, suite: dict) -> list:
    """Carrega o dataset referenciado pela suite."""
    caminho_dataset = caminho_suite.parent / suite["dataset"]
    return json.loads(caminho_dataset.read_text(encoding="utf-8"))


def _extrair_metricas_trace(trace: dict, caso: dict) -> dict:
    """Extrai metricas de um trace individual."""
    etapas = trace.get("historico", [])
    tokens = trace.get("tokens_consumidos", {})
    concluido = trace.get("concluido", False)
    resultado = trace.get("resultado", "")

    # determinar se concluiu com sucesso (nao por limite/erro)
    sucesso = concluido and "encerrado" not in resultado

    # contar ferramentas chamadas
    ferramentas_chamadas = set()
    qualidades = {"completa": 0, "parcial": 0, "falha": 0}
    for etapa in etapas:
        plano = etapa.get("plano", {})
        nome = plano.get("nome_ferramenta")
        if nome:
            ferramentas_chamadas.add(nome)
        qual = etapa.get("avaliacao", {}).get("qualidade", "")
        if qual in qualidades:
            qualidades[qual] += 1

    # cobertura de ferramentas esperadas
    esperadas = set(caso.get("ferramentas_esperadas", []))
    cobertura = len(ferramentas_chamadas & esperadas) / len(esperadas) * 100 if esperadas else 100

    return {
        "caso_id": caso["id"],
        "concluido": sucesso,
        "etapas": len(etapas),
        "tokens_total": tokens.get("total", 0),
        "tokens_prompt": tokens.get("prompt", 0),
        "ferramentas_chamadas": sorted(ferramentas_chamadas),
        "cobertura_ferramentas": round(cobertura, 1),
        "qualidades": qualidades,
        "reflexoes": trace.get("reflexoes_feitas", 0),
    }


def rodar_benchmark(caminho_agente: str, caminho_suite: str, arquitetura: str = None) -> dict:
    """Roda todos os cenarios do dataset e coleta metricas agregadas."""
    caminho_agente = Path(caminho_agente).resolve()
    caminho_suite = Path(caminho_suite).resolve()

    suite = _carregar_suite(caminho_suite)
    dataset = _carregar_dataset(caminho_suite, suite)
    nome_arquitetura = arquitetura or "padrao"

    print(f"\n{'='*60}")
    print(f"  BENCHMARK")
    print(f"  Agente: {caminho_agente.name}")
    print(f"  Arquitetura: {nome_arquitetura}")
    print(f"  Dataset: {len(dataset)} cenarios")
    print(f"  Suite: {caminho_suite.name}")
    print(f"{'='*60}\n")

    resultados = []
    inicio_total = time.time()

    for i, caso in enumerate(dataset, 1):
        print(f"\n{'─'*40}")
        print(f"  Cenario {i}/{len(dataset)}: {caso['id']}")
        print(f"  Entrada: {caso['entrada'][:60]}...")
        print(f"{'─'*40}")

        try:
            # rodar o agente — trace salvo em arquivo temporario
            saida_temp = str(Path(__file__).parent / f"_bench_{caso['id']}.json")
            estado = rodar(
                caminho_agente=str(caminho_agente),
                texto_entrada=caso["entrada"],
                arquitetura=arquitetura,
                saida=saida_temp,
            )
            metricas = _extrair_metricas_trace(estado, caso)
        except Exception as e:
            print(f"  [benchmark] erro no cenario {caso['id']}: {e}")
            metricas = {
                "caso_id": caso["id"],
                "concluido": False,
                "etapas": 0,
                "tokens_total": 0,
                "tokens_prompt": 0,
                "ferramentas_chamadas": [],
                "cobertura_ferramentas": 0,
                "qualidades": {"completa": 0, "parcial": 0, "falha": 0},
                "reflexoes": 0,
            }

        resultados.append(metricas)

        # limpar trace temporario
        Path(saida_temp).unlink(missing_ok=True)

    tempo_total = round(time.time() - inicio_total, 2)

    # --- agregar metricas ---
    total = len(resultados)
    concluidos = sum(1 for r in resultados if r["concluido"])
    agregado = {
        "arquitetura": nome_arquitetura,
        "agente": caminho_agente.name,
        "cenarios_total": total,
        "taxa_conclusao": round(concluidos / total * 100, 1) if total else 0,
        "media_etapas": round(sum(r["etapas"] for r in resultados) / total, 1) if total else 0,
        "media_tokens": round(sum(r["tokens_total"] for r in resultados) / total, 0) if total else 0,
        "tokens_planejamento": round(sum(r["tokens_prompt"] for r in resultados) / total, 0) if total else 0,
        "media_tempo_segundos": round(tempo_total / total, 1) if total else 0,
        "cobertura_ferramentas": round(sum(r["cobertura_ferramentas"] for r in resultados) / total, 1) if total else 0,
        "taxa_sucesso_ferramentas": round(
            sum(r["qualidades"]["completa"] + r["qualidades"]["parcial"] for r in resultados)
            / max(sum(r["qualidades"]["completa"] + r["qualidades"]["parcial"] + r["qualidades"]["falha"] for r in resultados), 1)
            * 100, 1),
        "reflexoes_total": sum(r["reflexoes"] for r in resultados),
        "tempo_total_segundos": tempo_total,
        "resultados_por_cenario": resultados,
    }

    # verificar limiares
    limiares = suite.get("limiares", {})
    violacoes = []
    for metrica, limiar in limiares.items():
        valor = agregado.get(metrica, 0)
        if valor < limiar:
            violacoes.append(f"{metrica}: {valor} < {limiar}")
    agregado["limiares"] = limiares
    agregado["violacoes"] = violacoes

    # exibir resumo
    print(f"\n{'='*60}")
    print(f"  RESULTADO — {nome_arquitetura}")
    print(f"{'='*60}")
    print(f"  Taxa de conclusao:       {agregado['taxa_conclusao']}%")
    print(f"  Media de etapas:         {agregado['media_etapas']}")
    print(f"  Media de tokens:         {agregado['media_tokens']:.0f}")
    print(f"  Tokens planejamento:     {agregado['tokens_planejamento']:.0f}")
    print(f"  Cobertura ferramentas:   {agregado['cobertura_ferramentas']}%")
    print(f"  Reflexoes:               {agregado['reflexoes_total']}")
    print(f"  Tempo total:             {agregado['tempo_total_segundos']}s")
    if violacoes:
        print(f"  VIOLACOES:")
        for v in violacoes:
            print(f"    ✗ {v}")
    else:
        print(f"  Limiares:                todos aprovados ✓")
    print(f"{'='*60}\n")

    return agregado


def gerar_relatorio_comparativo(resultados: list, caminho_saida: str):
    """Gera relatorio markdown comparando varias arquiteturas."""
    md = []
    md.append("# Benchmark Comparativo de Arquiteturas")
    md.append("")

    if not resultados:
        md.append("Nenhum resultado disponivel.")
        Path(caminho_saida).write_text("\n".join(md), encoding="utf-8")
        return

    agente = resultados[0].get("agente", "?")
    md.append(f"**Agente:** {agente}")
    md.append(f"**Cenarios:** {resultados[0].get('cenarios_total', '?')}")
    md.append("")

    # tabela comparativa
    md.append("## Comparativo")
    md.append("")
    md.append("| Metrica | " + " | ".join(r["arquitetura"] for r in resultados) + " |")
    md.append("|" + "---|" * (len(resultados) + 1))

    metricas_exibir = [
        ("Taxa conclusao", "taxa_conclusao", "%"),
        ("Media etapas", "media_etapas", ""),
        ("Media tokens", "media_tokens", ""),
        ("Tokens planejamento", "tokens_planejamento", ""),
        ("Cobertura ferramentas", "cobertura_ferramentas", "%"),
        ("Reflexoes", "reflexoes_total", ""),
        ("Tempo total", "tempo_total_segundos", "s"),
    ]

    for nome, chave, sufixo in metricas_exibir:
        valores = []
        nums = [r.get(chave, 0) for r in resultados]
        melhor = None
        if chave in ("media_etapas", "media_tokens", "tokens_planejamento", "tempo_total_segundos", "reflexoes_total"):
            melhor = min(nums) if any(n > 0 for n in nums) else None
        else:
            melhor = max(nums)

        for r in resultados:
            val = r.get(chave, 0)
            txt = f"{val}{sufixo}"
            if val == melhor and len(resultados) > 1:
                txt = f"**{txt}**"
            valores.append(txt)
        md.append(f"| {nome} | " + " | ".join(valores) + " |")

    md.append("")

    # violacoes
    md.append("## Violacoes de Limiares")
    md.append("")
    alguma_violacao = False
    for r in resultados:
        violacoes = r.get("violacoes", [])
        if violacoes:
            alguma_violacao = True
            md.append(f"**{r['arquitetura']}:**")
            for v in violacoes:
                md.append(f"- ✗ {v}")
            md.append("")
    if not alguma_violacao:
        md.append("Nenhuma violacao detectada em nenhuma arquitetura.")
        md.append("")

    # veredito
    md.append("## Veredito")
    md.append("")

    # determinar melhor por metrica
    if len(resultados) > 1:
        mais_eficiente = min(resultados, key=lambda r: r.get("media_tokens", float("inf")))
        mais_completo = max(resultados, key=lambda r: r.get("cobertura_ferramentas", 0))
        mais_rapido = min(resultados, key=lambda r: r.get("tempo_total_segundos", float("inf")))

        md.append(f"- **Mais eficiente (tokens):** {mais_eficiente['arquitetura']}")
        md.append(f"- **Maior cobertura:** {mais_completo['arquitetura']}")
        md.append(f"- **Mais rapido:** {mais_rapido['arquitetura']}")
    md.append("")

    Path(caminho_saida).write_text("\n".join(md), encoding="utf-8")
    print(f"  Relatorio salvo: {caminho_saida}")
