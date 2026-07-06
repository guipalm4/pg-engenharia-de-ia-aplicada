"""
REST Adapter — conecta skills declaradas em skills.md a APIs HTTP reais.

O adapter le do contrato:
  - endpoint, metodo, timeout_segundos, retries, autenticacao

O adapter le do ambiente (.env):
  - API_BASE_URL (base da URL, ex: http://localhost:8100)
  - API_KEY (se autenticacao == header_api_key)

O adapter NUNCA decide nada — apenas conecta.
Toda decisao vem do contrato .md.
"""

import json
import os
import time
from pathlib import Path

import requests
from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

_TOKENS_ZERO = {"prompt": 0, "completion": 0, "total": 0}


def _mapear_argumentos_para_params(argumentos: dict, campos_entrada: dict) -> dict:
    """Mapeia argumentos do agente para query params da API.

    Converte nomes em portugues (do contrato) para nomes em ingles (da API).
    """
    mapa = {
        "nome_servico": "service",
        "janela_tempo_minutos": "window_minutes",
        "janela_tempo_horas": "window_hours",
        "nivel_minimo": "min_level",
    }
    params = {}
    for chave, valor in argumentos.items():
        if chave.startswith("_"):
            continue
        chave_api = mapa.get(chave, chave)
        params[chave_api] = valor
    return params


def criar_funcao_rest(habilidade: dict):
    """Cria funcao que chama API REST real com base no contrato da skill.

    Le endpoint, metodo, timeout, retries e autenticacao do bloco 'conexao'.
    Retorna resultado no mesmo formato que o harness espera:
    {"sucesso": bool, "dados": dict, "_tokens": dict}
    """
    nome = habilidade.get("nome", "")
    conexao = habilidade.get("conexao", {})
    campos_entrada = habilidade.get("entrada", {})
    campos_saida = habilidade.get("saida", {})

    endpoint = conexao.get("endpoint", "/")
    metodo = conexao.get("metodo", "GET").upper()
    timeout = conexao.get("timeout_segundos", 10)
    retries = conexao.get("retries", 1)
    tipo_auth = conexao.get("autenticacao", "")

    base_url = os.environ.get("API_BASE_URL", "http://localhost:8100")

    def funcao(argumentos):
        url = f"{base_url}{endpoint}"
        params = _mapear_argumentos_para_params(argumentos or {}, campos_entrada)

        # montar headers de autenticacao
        headers = {"Content-Type": "application/json"}
        if tipo_auth == "header_api_key":
            api_key = os.environ.get("API_KEY", "")
            if api_key:
                headers["X-API-Key"] = api_key

        # executar com retry
        ultimo_erro = None
        for tentativa in range(1, retries + 1):
            try:
                inicio = time.time()

                if metodo == "GET":
                    resp = requests.get(url, params=params, headers=headers, timeout=timeout)
                elif metodo == "POST":
                    resp = requests.post(url, json=params, headers=headers, timeout=timeout)
                else:
                    resp = requests.request(metodo, url, params=params, headers=headers, timeout=timeout)

                latencia_ms = round((time.time() - inicio) * 1000, 1)

                if resp.status_code >= 400:
                    ultimo_erro = f"HTTP {resp.status_code}: {resp.text[:200]}"
                    if tentativa < retries:
                        continue
                    return {
                        "sucesso": False,
                        "erro": ultimo_erro,
                        "_adapter": "rest",
                        "_latencia_ms": latencia_ms,
                        "_tokens": _TOKENS_ZERO.copy(),
                    }

                # parsear resposta
                dados = resp.json()

                # filtrar apenas campos declarados na saida (se existirem no response)
                if campos_saida:
                    dados_filtrados = {}
                    for campo in campos_saida:
                        if campo in dados:
                            dados_filtrados[campo] = dados[campo]
                        else:
                            dados_filtrados[campo] = dados.get(campo)
                    # manter campos extras uteis
                    for chave in ("servico", "coletado_em"):
                        if chave in dados:
                            dados_filtrados[chave] = dados[chave]
                    dados = dados_filtrados

                dados["_entrada"] = argumentos
                return {
                    "sucesso": True,
                    "dados": dados,
                    "_adapter": "rest",
                    "_latencia_ms": latencia_ms,
                    "_tokens": _TOKENS_ZERO.copy(),
                }

            except requests.Timeout:
                ultimo_erro = f"timeout apos {timeout}s (tentativa {tentativa}/{retries})"
                if tentativa < retries:
                    continue
            except requests.ConnectionError:
                ultimo_erro = f"conexao recusada: {url} (tentativa {tentativa}/{retries})"
                if tentativa < retries:
                    continue
            except Exception as e:
                ultimo_erro = f"erro inesperado: {e}"
                break

        return {
            "sucesso": False,
            "erro": ultimo_erro,
            "_adapter": "rest",
            "_tokens": _TOKENS_ZERO.copy(),
        }

    return funcao
