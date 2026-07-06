"""
Ciclo do Agente e Rastreamento.

Orquestra o ciclo principal: perceber -> planejar -> agir -> avaliar.
Salva e exibe o rastreamento da execucao.
Suporta 4 modos: task_based, interactive, goal_oriented, autonomous.

Implementa:
- Circuit breaker entre planejamento e execucao
- Validacao de payload de ferramentas
- Controle de consumo de tokens
- Telemetria estruturada com trace ID e timing por fase
"""

import json
import sys
import time
from pathlib import Path

from contratos import carregar_contratos, criar_estado
from executor import avaliar, executar, executar_gancho, validar_payload
from ferramentas import construir_ferramentas_dos_contratos, montar_argumentos_mock
from planejador import chamar_llm, perceber
from telemetria import Telemetria

def exibir_kpis(estado: dict, tel, inicio: float, contratos: dict):
    """Imprime painel compacto de KPIs ao final de cada etapa do loop."""
    max_etapas = estado["max_etapas"]
    max_chamadas = estado["max_chamadas_ferramenta"]
    max_tokens = estado.get("max_tokens", 50000)
    limite_tempo = estado.get("limite_tempo_segundos", 120)

    etapa = estado["etapa"]
    chamadas = estado["chamadas_ferramenta"]
    tokens_total = estado["tokens_consumidos"]["total"]
    tempo_decorrido = round(time.time() - inicio, 1)

    # barra visual de tokens
    pct_tokens = tokens_total / max_tokens if max_tokens > 0 else 0
    blocos_cheios = int(pct_tokens * 10)
    barra = "\u2593" * blocos_cheios + "\u2591" * (10 - blocos_cheios)
    pct_str = f"{pct_tokens * 100:.1f}%"

    # ferramentas: chamadas vs pendentes
    habilidades = contratos.get("habilidades", {}).get("habilidades", [])
    obrigatorias = set(contratos.get("regras", {}).get("ferramentas_obrigatorias", []))
    nomes_ferramentas = [h["nome"] for h in habilidades]
    partes_ferramentas = []
    for nome in nomes_ferramentas:
        if nome in estado["chamadas_por_ferramenta"]:
            partes_ferramentas.append(f"\u2713{nome}")
        elif nome in obrigatorias:
            partes_ferramentas.append(f"!{nome}")
        else:
            partes_ferramentas.append(f"\u25cb{nome}")
    texto_ferramentas = " ".join(partes_ferramentas)

    # qualidade: contar por tipo no historico
    ok = parcial = falha = 0
    for h in estado["historico"]:
        q = h.get("avaliacao", {}).get("qualidade", "")
        if q == "completa":
            ok += 1
        elif q == "parcial":
            parcial += 1
        elif q == "falha":
            falha += 1

    # alertas
    cb = tel.circuit_breaker_ativacoes
    pv = tel.validacao_payload_falhas

    # latencia da etapa atual
    lat = tel.kpis_etapa(etapa)
    partes_lat = [f"{fase}={int(ms)}ms" for fase, ms in lat.items()]
    texto_lat = "  ".join(partes_lat) if partes_lat else "-"

    # montar painel
    largura = 58
    print(f"\n  \u250c\u2500 KPIs {'_' * (largura - 8)}\u2510")
    print(f"  \│ Progresso:  {etapa}/{max_etapas} etapas    {chamadas}/{max_chamadas} chamadas    {tempo_decorrido}s/{limite_tempo}s")
    print(f"  \│ Tokens:     {tokens_total}/{max_tokens} ({pct_str})  {barra}")
    print(f"  \│ Ferramentas: {texto_ferramentas}")
    print(f"  \│ Qualidade:  {ok}/{ok + parcial + falha} ok   {parcial} parcial   {falha} falha")
    print(f"  \│ Alertas:    {cb} circuit_breaker   {pv} payload_invalido")
    print(f"  \│ Latencia:   {texto_lat}")
    print(f"  \u2514{'_' * largura}\u2518")


def verificar_sem_progresso(estado: dict, nome_ferramenta: str) -> bool:
    """Detecta estagnacao: mesma ferramenta chamada N vezes seguidas."""
    if nome_ferramenta == estado.get("ultima_ferramenta"):
        estado["etapas_sem_progresso"] += 1
    else:
        estado["etapas_sem_progresso"] = 0
    estado["ultima_ferramenta"] = nome_ferramenta

    limite = estado.get("sem_progresso", 3)
    return estado["etapas_sem_progresso"] >= limite


def verificar_tempo(estado: dict, inicio: float) -> bool:
    """Verifica se o limite de tempo foi excedido."""
    limite = estado.get("limite_tempo_segundos", 120)
    return (time.time() - inicio) >= limite


def pedir_confirmacao_humana(nome_ferramenta: str) -> bool:
    """Pede confirmacao do operador para acoes sensiveis."""
    print(f"\n  [CONFIRMACAO HUMANA] A ferramenta '{nome_ferramenta}' requer autorizacao.")
    try:
        resposta = input(f"  Autorizar execucao de '{nome_ferramenta}'? (s/n): ").strip().lower()
        return resposta in ("s", "sim", "y", "yes")
    except EOFError:
        print("  [CONFIRMACAO HUMANA] sem input disponivel - negando por seguranca")
        return False


def acumular_tokens(estado: dict, uso_tokens: dict):
    """Acumula tokens consumidos no estado."""
    for chave in ("prompt", "completion", "total"):
        estado["tokens_consumidos"][chave] += uso_tokens.get(chave, 0)


def verificar_limite_tokens(estado: dict) -> bool:
    """Verifica se o limite de tokens foi excedido."""
    return estado["tokens_consumidos"]["total"] >= estado.get("max_tokens", 50000)


# --- Gap 2: Circuit Breaker ---

_ACOES_VALIDAS = {"CHAMAR_FERRAMENTA", "FINALIZAR", "PERGUNTAR_USUARIO"}


def validar_resposta_llm(plano: dict, ferramentas_disponiveis: set) -> list:
    """Circuit breaker: valida a resposta da LLM antes de passar ao executor.

    Retorna lista de problemas. Lista vazia = resposta valida.
    """
    problemas = []

    if not isinstance(plano, dict):
        return ["resposta da LLM nao e um dicionario valido"]

    proxima_acao = plano.get("proxima_acao")
    if not proxima_acao:
        problemas.append("campo 'proxima_acao' ausente na resposta da LLM")
    elif proxima_acao not in _ACOES_VALIDAS:
        problemas.append(f"proxima_acao '{proxima_acao}' invalida (validas: {', '.join(_ACOES_VALIDAS)})")

    if proxima_acao == "CHAMAR_FERRAMENTA":
        nome = plano.get("nome_ferramenta")
        if not nome:
            problemas.append("CHAMAR_FERRAMENTA sem 'nome_ferramenta'")
        elif nome not in ferramentas_disponiveis:
            problemas.append(f"ferramenta '{nome}' nao existe (disponiveis: {', '.join(ferramentas_disponiveis)})")

        args = plano.get("argumentos_ferramenta")
        if args is not None and not isinstance(args, dict):
            problemas.append(f"argumentos_ferramenta deve ser dict, recebido {type(args).__name__}")

    if proxima_acao == "PERGUNTAR_USUARIO":
        if not plano.get("pergunta"):
            problemas.append("PERGUNTAR_USUARIO sem campo 'pergunta'")

    return problemas


def gerar_resumo_final(estado: dict, contratos: dict) -> str:
    """Gera resumo final da execucao conforme memory.md."""
    config_memoria = contratos.get("memoria", {})
    config_resumo = config_memoria.get("resumo_final", {})
    max_linhas = config_resumo.get("max_linhas", 5)

    ferramentas_chamadas = list(estado["chamadas_por_ferramenta"].keys())
    linhas = [
        f"Objetivo: {estado['objetivo']}",
        f"Etapas executadas: {estado['etapa']}",
        f"Ferramentas chamadas: {', '.join(ferramentas_chamadas) if ferramentas_chamadas else 'nenhuma'}",
        f"Resultado: {estado['resultado'] or 'max_etapas_excedido'}",
        f"Tipo: {estado.get('tipo_agente', 'task_based')}",
    ]
    return "\n".join(linhas[:max_linhas])


def _executar_critica(estado: dict, contratos: dict, contrato_critico: dict) -> dict:
    """Executa a fase de critica (Reflection).

    Avalia as evidencias coletadas contra os criterios do critico.
    Retorna {nota, aprovado, problemas, sugestoes}.
    """
    import os
    criterios = contrato_critico.get("criterios", [])
    limiar = contrato_critico.get("limiar_aprovacao", 70)

    # tentar usar LLM se disponivel
    chave_api = os.environ.get("OPENAI_API_KEY")
    if chave_api:
        try:
            from openai import OpenAI
            cliente = OpenAI(api_key=chave_api)

            # montar contexto de critica
            historico_resumo = []
            for reg in estado.get("historico", []):
                ferr = reg.get("plano", {}).get("nome_ferramenta", "?")
                res = reg.get("resultado_acao", {})
                aval = reg.get("avaliacao", {})
                historico_resumo.append(
                    f"- {ferr}: sucesso={res.get('sucesso')} qualidade={aval.get('qualidade', '?')}"
                )

            criterios_texto = "\n".join(
                f"- {c}" if isinstance(c, str)
                else "\n".join(f"- {k}: {v}" for k, v in c.items())
                for c in criterios
            )

            prompt_critica = f"""Voce e o critico de um agente autonomo.
Avalie a execucao abaixo contra os criterios.

Objetivo: {estado.get('objetivo')}
Etapas executadas:
{chr(10).join(historico_resumo)}

Criterios de avaliacao:
{criterios_texto}

Limiar de aprovacao: {limiar}/100

Responda APENAS em JSON:
{{
  "nota": <int 0-100>,
  "aprovado": <bool>,
  "problemas": ["problema 1", "problema 2"],
  "sugestoes": ["sugestao 1", "sugestao 2"]
}}"""

            resposta = cliente.chat.completions.create(
                model="gpt-4o-mini",
                response_format={"type": "json_object"},
                messages=[{"role": "user", "content": prompt_critica}],
            )
            return json.loads(resposta.choices[0].message.content)
        except Exception:
            pass  # fallback para mock

    # --- mock: primeira reflexao rejeita, segunda aprova ---
    reflexoes_feitas = estado.get("reflexoes_feitas", 0)
    if reflexoes_feitas == 0:
        return {
            "nota": 55,
            "aprovado": False,
            "problemas": [
                "evidencias de metricas coletadas mas nao cruzadas com logs",
                "diagnostico baseado em dados parciais",
            ],
            "sugestoes": [
                "chamar buscar_logs com janela mais ampla para cruzar com metricas",
                "incluir correlacao temporal entre metricas e deploys no diagnostico",
            ],
        }
    return {
        "nota": 85,
        "aprovado": True,
        "problemas": [],
        "sugestoes": [],
    }


def rodar(caminho_agente: str, texto_entrada: str, modo: str = None, evento: str = None, saida: str = None, arquitetura: str = None) -> dict:
    """Roda o ciclo completo do agente."""
    caminho_agente = Path(caminho_agente).resolve()
    contratos = carregar_contratos(caminho_agente, arquitetura=arquitetura)
    estado = criar_estado(contratos, texto_entrada, modo=modo, evento=evento, arquitetura=arquitetura)
    ferramentas = construir_ferramentas_dos_contratos(contratos)
    contrato_ganchos = contratos.get("ganchos", {})
    inicio = time.time()

    tipo_agente = estado.get("tipo_agente", "task_based")

    # inicializar telemetria
    tel = Telemetria(agente=caminho_agente.name, tipo_agente=tipo_agente)
    tel.registrar("inicio", {
        "entrada": estado["entrada"],
        "objetivo": estado["objetivo"],
        "max_etapas": estado["max_etapas"],
        "max_tokens": estado.get("max_tokens", 50000),
    })

    print(f"\n{'='*60}")
    print(f"  Agente: {caminho_agente.name}")
    print(f"  Trace ID: {tel.trace_id}")
    print(f"  Tipo: {tipo_agente}")
    print(f"  Objetivo: {estado['objetivo']}")
    print(f"  Entrada: {estado['entrada']}")
    if estado.get("evento"):
        print(f"  Evento: {estado['evento']}")
    if estado.get("arquitetura") and estado["arquitetura"] != "padrao":
        print(f"  Arquitetura: {estado['arquitetura']}")
    print(f"  Max etapas: {estado['max_etapas']}")
    print(f"  Limite tempo: {estado['limite_tempo_segundos']}s")
    print(f"  Limite tokens: {estado.get('max_tokens', 50000)}")
    print(f"  Ferramentas: {', '.join(ferramentas.keys())}")
    print(f"{'='*60}\n")

    nomes_ferramentas_disponiveis = set(ferramentas.keys())

    while not estado["concluido"] and estado["etapa"] < estado["max_etapas"]:
        estado["etapa"] += 1

        # gancho antes da etapa
        executar_gancho("antes_da_etapa", contrato_ganchos, etapa=estado["etapa"])
        print(f"--- Etapa {estado['etapa']} ---")

        # verificar limite de tempo
        if verificar_tempo(estado, inicio):
            print(f"  [regras] limite de tempo excedido ({estado['limite_tempo_segundos']}s)")
            tel.registrar("limite_tempo_excedido", {"segundos": estado["limite_tempo_segundos"]})
            estado["concluido"] = True
            estado["resultado"] = "encerrado por limite de tempo"
            break

        # verificar limite de tokens
        if verificar_limite_tokens(estado):
            print(f"  [regras] limite de tokens excedido ({estado['tokens_consumidos']['total']}/{estado['max_tokens']})")
            tel.registrar("limite_tokens_excedido", estado["tokens_consumidos"])
            estado["concluido"] = True
            estado["resultado"] = f"encerrado por limite de tokens ({estado['tokens_consumidos']['total']})"
            break

        # --- FASE: PERCEBER ---
        marcador_perceber = tel.iniciar_fase("perceber", estado["etapa"])
        percepcao = perceber(estado)
        tel.finalizar_fase(marcador_perceber)
        print(f"  [perceber] contexto montado ({marcador_perceber['duracao_ms']}ms)")

        # --- FASE: PLANEJAR ---
        # Plan-and-Execute: se existe plano armazenado, segue o proximo passo sem chamar LLM
        modo_execucao = contratos.get("planejador", {}).get("modo_execucao")
        plano_armazenado = estado.get("plano_completo")

        if modo_execucao == "plan_execute" and plano_armazenado:
            marcador_planejar = tel.iniciar_fase("planejar", estado["etapa"])
            passo_atual = plano_armazenado.pop(0)
            plano = {
                "proxima_acao": "CHAMAR_FERRAMENTA",
                "nome_ferramenta": passo_atual.get("ferramenta"),
                "argumentos_ferramenta": passo_atual.get("argumentos_ferramenta", {}),
                "criterio_sucesso": passo_atual.get("criterio_sucesso", passo_atual.get("objetivo", "")),
            }
            uso_tokens_plano = _TOKENS_ZERO.copy()
            tel.finalizar_fase(marcador_planejar)
            passo_idx = estado.get("plan_execute_passo", 1) + 1
            estado["plan_execute_passo"] = passo_idx
            total_passos = estado.get("plan_execute_total", passo_idx + len(plano_armazenado))
            print(f"  [plan_execute] seguindo plano: passo {passo_idx}/{total_passos} — {plano['nome_ferramenta']} ({marcador_planejar['duracao_ms']}ms, tokens=0)")
        else:
            marcador_planejar = tel.iniciar_fase("planejar", estado["etapa"])
            plano, uso_tokens_plano = chamar_llm(percepcao, contratos, estado["historico"])
            tel.finalizar_fase(marcador_planejar)

            # Plan-and-Execute: armazenar plano completo no estado (exceto o primeiro passo)
            if modo_execucao == "plan_execute" and plano.get("plano_completo"):
                passos = plano["plano_completo"]
                if len(passos) > 1:
                    estado["plano_completo"] = passos[1:]
                estado["plan_execute_passo"] = 1
                estado["plan_execute_total"] = len(passos)
                print(f"  [plan_execute] plano gerado com {len(passos)} passos")

            print(f"  [planejar] proxima_acao={plano.get('proxima_acao')} ferramenta={plano.get('nome_ferramenta')} ({marcador_planejar['duracao_ms']}ms, tokens={uso_tokens_plano['total']})")

        # acumular tokens do planejador
        acumular_tokens(estado, uso_tokens_plano)
        tel.registrar_tokens(uso_tokens_plano)

        # --- REASONING TRACE: exibir raciocinio se a arquitetura produzir ---
        raciocinio = plano.get("raciocinio")
        if raciocinio:
            print(f"  [raciocinio] {raciocinio}")

        # --- CIRCUIT BREAKER: validar resposta da LLM antes de prosseguir ---
        problemas_llm = validar_resposta_llm(plano, nomes_ferramentas_disponiveis)
        if problemas_llm:
            tel.registrar_circuit_breaker("; ".join(problemas_llm))
            print(f"  [circuit_breaker] resposta da LLM rejeitada: {'; '.join(problemas_llm)}")

            # auto-correcao: acao invalida mas nome_ferramenta e valido
            nome_no_plano = plano.get("nome_ferramenta") or plano.get("proxima_acao")
            if (
                any("invalida" in p for p in problemas_llm)
                and nome_no_plano in nomes_ferramentas_disponiveis
            ):
                plano["proxima_acao"] = "CHAMAR_FERRAMENTA"
                plano["nome_ferramenta"] = nome_no_plano
                print(f"  [circuit_breaker] auto-correcao: proxima_acao -> CHAMAR_FERRAMENTA, ferramenta={nome_no_plano}")

            # fallback: ferramenta nao existe, redirecionar para proxima nao usada
            elif any("nao existe" in p for p in problemas_llm):
                habilidades = contratos.get("habilidades", {}).get("habilidades", [])
                ferramenta_fallback = next(
                    (h["nome"] for h in habilidades
                     if h.get("nome") in nomes_ferramentas_disponiveis
                     and h["nome"] not in estado["chamadas_por_ferramenta"]),
                    None,
                )
                if ferramenta_fallback:
                    habilidade_fb = next(h for h in habilidades if h["nome"] == ferramenta_fallback)
                    plano = {
                        "proxima_acao": "CHAMAR_FERRAMENTA",
                        "nome_ferramenta": ferramenta_fallback,
                        "argumentos_ferramenta": montar_argumentos_mock(habilidade_fb, estado["historico"]),
                        "criterio_sucesso": f"fallback apos circuit breaker: {ferramenta_fallback}",
                    }
                    print(f"  [circuit_breaker] redirecionando para fallback: {ferramenta_fallback}")
                else:
                    estado["concluido"] = True
                    estado["resultado"] = f"encerrado por circuit breaker: {'; '.join(problemas_llm)}"
                    break
            else:
                estado["concluido"] = True
                estado["resultado"] = f"encerrado por circuit breaker: {'; '.join(problemas_llm)}"
                break

        tel.registrar("plano_gerado", {
            "proxima_acao": plano.get("proxima_acao"),
            "nome_ferramenta": plano.get("nome_ferramenta"),
            "criterio_sucesso": plano.get("criterio_sucesso"),
        })

        # modo interactive: tratar PERGUNTAR_USUARIO
        if plano.get("proxima_acao") == "PERGUNTAR_USUARIO":
            pergunta = plano.get("pergunta", "Preciso de mais informacoes.")
            print(f"\n  [interactive] {pergunta}")

            if tipo_agente == "interactive":
                try:
                    resposta_usuario = input("  > Sua resposta: ").strip()
                except EOFError:
                    resposta_usuario = "(sem input disponivel)"
                    print(f"  [interactive] {resposta_usuario}")
            else:
                resposta_usuario = "(modo nao-interativo: sem resposta do usuario)"
                print(f"  [interactive] {resposta_usuario}")

            estado["historico"].append({
                "etapa": estado["etapa"],
                "percepcao": percepcao,
                "plano": plano,
                "resultado_acao": {"sucesso": True, "dados": {"resposta_usuario": resposta_usuario}},
                "avaliacao": {"objetivo_alcancado": False, "motivo": "aguardando resposta do usuario"},
            })

            # gancho apos etapa
            executar_gancho("apos_etapa", contrato_ganchos, etapa=estado["etapa"], acao="pergunta_usuario")
            continue

        # verificar ferramentas obrigatorias antes de permitir FINALIZAR
        if plano.get("proxima_acao") == "FINALIZAR":
            obrigatorias = contratos.get("regras", {}).get("ferramentas_obrigatorias", [])
            faltantes = [
                nome_obrigatoria for nome_obrigatoria in obrigatorias
                if nome_obrigatoria not in estado["chamadas_por_ferramenta"]
            ]
            if faltantes:
                print(f"  [regras] ferramentas obrigatorias pendentes: {', '.join(faltantes)}")
                habilidades = contratos.get("habilidades", {}).get("habilidades", [])
                habilidade_faltante = next(
                    (hab for hab in habilidades if hab.get("nome") == faltantes[0]),
                    {},
                )
                plano = {
                    "proxima_acao": "CHAMAR_FERRAMENTA",
                    "nome_ferramenta": faltantes[0],
                    "argumentos_ferramenta": montar_argumentos_mock(habilidade_faltante, estado["historico"]),
                    "criterio_sucesso": f"{faltantes[0]} obrigatorio antes de finalizar",
                }
                print(f"  [regras] redirecionando para: {faltantes[0]}")

        # --- FASE: REFLEXAO (Reflection) ---
        # Se o planner decidiu FINALIZAR e existe contrato critico, rodar autocritica
        contrato_critico = contratos.get("critico")
        if plano.get("proxima_acao") == "FINALIZAR" and contrato_critico:
            reflexoes_feitas = estado.get("reflexoes_feitas", 0)
            max_reflexoes = contrato_critico.get("max_reflexoes", 2)
            limiar = contrato_critico.get("limiar_aprovacao", 70)

            if reflexoes_feitas < max_reflexoes:
                marcador_reflexao = tel.iniciar_fase("refletir", estado["etapa"])
                critica = _executar_critica(estado, contratos, contrato_critico)
                tel.finalizar_fase(marcador_reflexao)

                nota = critica.get("nota", 100)
                aprovado = critica.get("aprovado", True)
                problemas_critica = critica.get("problemas", [])
                sugestoes = critica.get("sugestoes", [])

                tel.registrar("reflexao", {
                    "nota": nota,
                    "aprovado": aprovado,
                    "reflexao_numero": reflexoes_feitas + 1,
                    "problemas": problemas_critica,
                })

                if aprovado or nota >= limiar:
                    print(f"  [reflexao] aprovado! nota={nota}/100 ({marcador_reflexao['duracao_ms']}ms)")
                else:
                    estado["reflexoes_feitas"] = reflexoes_feitas + 1
                    print(f"  [reflexao] rejeitado. nota={nota}/100, limiar={limiar} ({marcador_reflexao['duracao_ms']}ms)")
                    for p in problemas_critica:
                        print(f"    problema: {p}")
                    for s in sugestoes:
                        print(f"    sugestao: {s}")

                    # redirecionar para a ferramenta sugerida (ou a primeira nao-obrigatoria)
                    ferramenta_correcao = None
                    if sugestoes:
                        habilidades_nomes = {h["nome"] for h in contratos.get("habilidades", {}).get("habilidades", [])}
                        for sug in sugestoes:
                            for hn in habilidades_nomes:
                                if hn in str(sug):
                                    ferramenta_correcao = hn
                                    break
                            if ferramenta_correcao:
                                break
                    if not ferramenta_correcao:
                        # fallback: repetir a primeira ferramenta de coleta
                        habilidades_lista = contratos.get("habilidades", {}).get("habilidades", [])
                        ferramenta_correcao = habilidades_lista[0]["nome"] if habilidades_lista else None

                    if ferramenta_correcao:
                        hab_correcao = next(
                            (h for h in contratos.get("habilidades", {}).get("habilidades", [])
                             if h["nome"] == ferramenta_correcao), {}
                        )
                        plano = {
                            "proxima_acao": "CHAMAR_FERRAMENTA",
                            "nome_ferramenta": ferramenta_correcao,
                            "argumentos_ferramenta": montar_argumentos_mock(hab_correcao, estado["historico"]),
                            "criterio_sucesso": f"correcao apos reflexao: {'; '.join(problemas_critica[:2])}",
                        }
                        print(f"  [reflexao] redirecionando para: {ferramenta_correcao}")
            else:
                print(f"  [reflexao] max reflexoes atingido ({max_reflexoes}). finalizando.")

        # --- FASE: AGIR ---
        resultado_acao = None
        if plano.get("proxima_acao") == "CHAMAR_FERRAMENTA" and plano.get("nome_ferramenta"):
            nome_ferramenta = plano["nome_ferramenta"]

            if estado["chamadas_ferramenta"] >= estado["max_chamadas_ferramenta"]:
                print(f"  [regras] limite total de chamadas de ferramenta atingido ({estado['max_chamadas_ferramenta']})")
                estado["concluido"] = True
                estado["resultado"] = "encerrado por limite total de chamadas de ferramenta"
                break

            chamadas_desta_ferramenta = estado["chamadas_por_ferramenta"].get(nome_ferramenta, 0)
            limite_desta_ferramenta = estado["limites_por_ferramenta"].get(nome_ferramenta)
            if limite_desta_ferramenta and chamadas_desta_ferramenta >= limite_desta_ferramenta:
                print(f"  [regras] limite de {nome_ferramenta} atingido ({limite_desta_ferramenta})")
                estado["concluido"] = True
                estado["resultado"] = f"encerrado por limite de {nome_ferramenta}"
                break

            # verificar sem progresso (estagnacao)
            if verificar_sem_progresso(estado, nome_ferramenta):
                print(f"  [regras] sem progresso detectado - {estado['sem_progresso']} chamadas consecutivas a '{nome_ferramenta}'")
                estado["concluido"] = True
                estado["resultado"] = f"encerrado por estagnacao (ferramenta repetida: {nome_ferramenta})"
                break

            # verificar acao sensivel (human_required)
            if nome_ferramenta in estado.get("acoes_sensiveis", []):
                tel.registrar("confirmacao_humana", {"ferramenta": nome_ferramenta})
                if not pedir_confirmacao_humana(nome_ferramenta):
                    print(f"  [regras] operador negou execucao de '{nome_ferramenta}'")
                    estado["concluido"] = True
                    estado["resultado"] = f"encerrado por negacao humana ({nome_ferramenta})"
                    break

            # --- VALIDACAO DE PAYLOAD (Gap 1) ---
            marcador_validacao = tel.iniciar_fase("validar_payload", estado["etapa"])
            erros_payload = validar_payload(nome_ferramenta, plano.get("argumentos_ferramenta"), contratos)
            tel.finalizar_fase(marcador_validacao)

            if erros_payload:
                tel.registrar_validacao_payload_falha(nome_ferramenta, erros_payload)
                print(f"  [validacao_payload] {'; '.join(erros_payload)}")
                # nao bloqueia — registra e prossegue (graceful degradation)

            # --- EXECUCAO ---
            marcador_agir = tel.iniciar_fase("agir", estado["etapa"])
            executar_gancho("antes_da_acao", contrato_ganchos, ferramenta=nome_ferramenta)
            resultado_acao = executar(nome_ferramenta, plano.get("argumentos_ferramenta"), ferramentas, contratos)
            tel.finalizar_fase(marcador_agir)

            estado["chamadas_ferramenta"] += 1
            estado["chamadas_por_ferramenta"][nome_ferramenta] = chamadas_desta_ferramenta + 1

            # acumular tokens da ferramenta (se usou LLM)
            tokens_ferramenta = resultado_acao.pop("_tokens", {})
            if tokens_ferramenta:
                acumular_tokens(estado, tokens_ferramenta)
                tel.registrar_tokens(tokens_ferramenta)

            sucesso = resultado_acao.get("sucesso", False)
            tel.registrar_resultado_ferramenta(sucesso)
            tel.registrar("ferramenta_executada", {
                "ferramenta": nome_ferramenta,
                "sucesso": sucesso,
                "duracao_ms": marcador_agir["duracao_ms"],
                "tokens": tokens_ferramenta.get("total", 0),
            })

            executar_gancho("apos_acao", contrato_ganchos, sucesso=sucesso)

            if not sucesso:
                executar_gancho("em_erro", contrato_ganchos, erro=resultado_acao.get("erro", ""))

            print(f"  [agir] resultado={json.dumps(resultado_acao, ensure_ascii=False)[:100]} ({marcador_agir['duracao_ms']}ms)")

        # --- FASE: AVALIAR (Gap 4: avaliacao semantica) ---
        marcador_avaliar = tel.iniciar_fase("avaliar", estado["etapa"])
        avaliacao = avaliar(plano, resultado_acao, contratos)
        tel.finalizar_fase(marcador_avaliar)

        qualidade = avaliacao.get("qualidade", "")
        problemas_saida = avaliacao.get("problemas_saida", [])
        if problemas_saida:
            print(f"  [avaliar] qualidade={qualidade} problemas={problemas_saida}")

        print(f"  [avaliar] objetivo_alcancado={avaliacao['objetivo_alcancado']} - {avaliacao['motivo']} ({marcador_avaliar['duracao_ms']}ms)")

        # atualizar historico
        estado["historico"].append({
            "etapa": estado["etapa"],
            "percepcao": percepcao,
            "plano": plano,
            "resultado_acao": resultado_acao,
            "avaliacao": avaliacao,
        })

        if avaliacao["objetivo_alcancado"]:
            estado["concluido"] = True
            estado["resultado"] = avaliacao["motivo"]

        # gancho apos etapa
        executar_gancho("apos_etapa", contrato_ganchos, etapa=estado["etapa"], concluido=estado["concluido"])

        # painel de KPIs em tempo real
        exibir_kpis(estado, tel, inicio, contratos)

    # registrar finalizacao na telemetria
    tel.registrar("finalizado", {
        "etapas": estado["etapa"],
        "resultado": estado["resultado"] or "max_etapas_excedido",
        "tokens_total": estado["tokens_consumidos"]["total"],
    })

    # resumo final
    tempo_total = round(time.time() - inicio, 2)
    resumo = gerar_resumo_final(estado, contratos)

    print(f"\n{'='*60}")
    print(f"  Trace ID: {tel.trace_id}")
    print(f"  Finalizado em {estado['etapa']} etapas ({tempo_total}s)")
    print(f"  Chamadas de ferramenta: {estado['chamadas_ferramenta']}")
    print(f"  Tokens consumidos: {estado['tokens_consumidos']['total']} (prompt={estado['tokens_consumidos']['prompt']}, completion={estado['tokens_consumidos']['completion']})")
    print(f"  Resultado: {estado['resultado'] or 'max_etapas_excedido'}")

    # health metrics
    metricas = tel.health_metrics()
    print(f"\n  --- Health Metrics ---")
    print(f"  Taxa sucesso ferramentas: {metricas['taxa_sucesso_ferramentas']}%")
    print(f"  Circuit breaker ativacoes: {metricas['circuit_breaker_ativacoes']}")
    print(f"  Validacao payload falhas: {metricas['validacao_payload_falhas']}")
    print(f"  Chamadas LLM: {metricas['chamadas_llm']}")

    # performance data
    perf = tel.performance_data()
    print(f"\n  --- Performance por Fase ---")
    for nome_fase, dados_fase in perf["fases"].items():
        print(f"  {nome_fase}: media={dados_fase['media_ms']}ms max={dados_fase['max_ms']}ms total={dados_fase['total_ms']}ms ({dados_fase['contagem']}x)")

    print(f"\n  --- Resumo ---")
    for linha in resumo.split("\n"):
        print(f"  {linha}")
    print(f"{'='*60}\n")

    # salvar rastreamento com telemetria completa
    dados_rastreamento = {
        "trace_id": tel.trace_id,
        "agente": caminho_agente.name,
        "tipo_agente": estado.get("tipo_agente", "task_based"),
        "arquitetura": estado.get("arquitetura", "padrao"),
        "entrada": estado["entrada"],
        "evento": estado.get("evento"),
        "tempo_total_segundos": tempo_total,
        "tokens_consumidos": estado["tokens_consumidos"],
        "etapas": estado["historico"],
        "resumo": resumo,
        **tel.resumo_completo(),
    }

    caminho_rastreamento = Path(saida) if saida else Path(__file__).parent / "trace.json"
    caminho_rastreamento.write_text(
        json.dumps(dados_rastreamento, indent=2, ensure_ascii=False),
        encoding="utf-8",
    )
    print(f"  Rastreamento salvo: {caminho_rastreamento}")

    return estado


def replay(caminho_agente: str) -> dict:
    """Reexecuta o agente com a mesma entrada da ultima execucao."""
    caminho_rastreamento = Path(__file__).parent / "trace.json"

    if not caminho_rastreamento.exists():
        print("Nenhum rastreamento encontrado. Rode o agente primeiro.")
        return {}

    dados = json.loads(caminho_rastreamento.read_text(encoding="utf-8"))

    entrada = dados.get("entrada")
    tipo = dados.get("tipo_agente")
    evento = dados.get("evento")

    if not entrada:
        print("Rastreamento nao contem entrada. Nao e possivel fazer replay.")
        return {}

    print(f"  [replay] reexecutando com entrada: {entrada}")
    if tipo:
        print(f"  [replay] tipo: {tipo}")
    if evento:
        print(f"  [replay] evento: {evento}")

    return rodar(caminho_agente, entrada, modo=tipo, evento=evento)


def exibir_rastreamento():
    """Exibe o rastreamento da ultima execucao."""
    caminho_rastreamento = Path(__file__).parent / "trace.json"

    if not caminho_rastreamento.exists():
        print("Nenhum rastreamento encontrado. Rode o agente primeiro.")
        return

    dados = json.loads(caminho_rastreamento.read_text(encoding="utf-8"))

    # suporta formato antigo (lista) e novo (dict com metadados)
    if isinstance(dados, list):
        historico = dados
        metadados = {}
    else:
        historico = dados.get("etapas", [])
        metadados = dados

    print(f"\n{'='*60}")
    print("  RASTREAMENTO - ultima execucao")
    if metadados.get("trace_id"):
        print(f"  Trace ID: {metadados['trace_id']}")
    if metadados.get("tipo_agente"):
        print(f"  Tipo: {metadados['tipo_agente']}")
    if metadados.get("entrada"):
        print(f"  Entrada: {metadados['entrada']}")
    if metadados.get("tempo_total_segundos"):
        print(f"  Tempo: {metadados['tempo_total_segundos']}s")
    if metadados.get("tokens_consumidos"):
        tokens = metadados["tokens_consumidos"]
        print(f"  Tokens: {tokens.get('total', 0)} (prompt={tokens.get('prompt', 0)}, completion={tokens.get('completion', 0)})")
    print(f"{'='*60}\n")

    for registro in historico:
        etapa = registro["etapa"]
        plano = registro.get("plano", {})
        resultado = registro.get("resultado_acao")
        avaliacao = registro.get("avaliacao", {})

        print(f"Etapa {etapa}")
        print(f"  plano     : {plano.get('proxima_acao')} -> {plano.get('nome_ferramenta', '-')}")
        print(f"  criterio  : {plano.get('criterio_sucesso', '-')}")
        if resultado:
            situacao = "ok" if resultado.get("sucesso") else "falha"
            print(f"  acao      : {situacao} - {json.dumps(resultado.get('dados', resultado.get('erro', '')), ensure_ascii=False)[:80]}")
        qualidade = avaliacao.get("qualidade", "")
        print(f"  avaliacao : objetivo_alcancado={avaliacao.get('objetivo_alcancado')}{f' qualidade={qualidade}' if qualidade else ''}")
        print()

    # exibir telemetria se disponivel
    if metadados.get("health_metrics"):
        metricas = metadados["health_metrics"]
        print("--- Health Metrics ---")
        print(f"  Taxa sucesso: {metricas.get('taxa_sucesso_ferramentas', 0)}%")
        print(f"  Circuit breaker: {metricas.get('circuit_breaker_ativacoes', 0)}")
        print(f"  Payload falhas: {metricas.get('validacao_payload_falhas', 0)}")
        print()

    if metadados.get("performance_data"):
        perf = metadados["performance_data"]
        print("--- Performance ---")
        print(f"  Tokens: {perf.get('tokens', {})}")
        print(f"  Chamadas LLM: {perf.get('chamadas_llm', 0)}")
        for nome_fase, dados_fase in perf.get("fases", {}).items():
            print(f"  {nome_fase}: media={dados_fase['media_ms']}ms max={dados_fase['max_ms']}ms")
        print()

    if metadados.get("resumo"):
        print("--- Resumo ---")
        print(metadados["resumo"])
        print()
