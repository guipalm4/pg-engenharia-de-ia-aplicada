"""
Ferramentas e Evidencias.

Resolve skills declarados em skills.md para implementacoes reais via adapters.
O campo tipo_implementacao define como resolver:
  - mock    → LLM gera dados (Unidades 1 e 2)
  - rest    → rest_adapter.py chama API HTTP
  - database → db_adapter.py executa query parametrizada
  - mcp     → mcp_adapter.py conecta a MCP server

Se tipo_implementacao nao esta definido, usa mock (backward compatible).
"""

import json
import os
import random
from pathlib import Path

try:
    from dotenv import load_dotenv
except ImportError:
    def load_dotenv(*a, **kw): pass

load_dotenv(Path(__file__).parent / ".env")

_TOKENS_ZERO = {"prompt": 0, "completion": 0, "total": 0}


def _chamar_llm_ferramenta(prompt_sistema: str, prompt_usuario: str, campos_saida: dict) -> tuple:
    """Chama a LLM para gerar a saida de uma ferramenta.

    Retorna (dados, uso_tokens). dados=None se falhar ou sem API key.
    """
    chave_api = os.environ.get("OPENAI_API_KEY")
    if not chave_api:
        return None, _TOKENS_ZERO.copy()

    from openai import OpenAI

    cliente = OpenAI(api_key=chave_api)
    resposta = cliente.chat.completions.create(
        model="gpt-4o-mini",
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": prompt_sistema},
            {"role": "user", "content": prompt_usuario},
        ],
    )

    uso_tokens = _TOKENS_ZERO.copy()
    if resposta.usage:
        uso_tokens = {
            "prompt": resposta.usage.prompt_tokens or 0,
            "completion": resposta.usage.completion_tokens or 0,
            "total": resposta.usage.total_tokens or 0,
        }

    try:
        return json.loads(resposta.choices[0].message.content), uso_tokens
    except (json.JSONDecodeError, IndexError):
        return None, uso_tokens


def construir_ferramenta(habilidade: dict):
    """Cria uma funcao que usa a LLM para gerar dados reais."""
    nome = habilidade.get("nome", "")
    descricao = habilidade.get("descricao", "")
    campos_saida = habilidade.get("saida", {})
    campos_entrada = habilidade.get("entrada", {})

    texto_saida = "\n".join(f"  - {campo}: {tipo}" for campo, tipo in campos_saida.items())

    prompt_sistema = f"""Voce e uma ferramenta chamada '{nome}'.
Funcao: {descricao}

Voce DEVE retornar APENAS JSON valido com exatamente estes campos:
{texto_saida}

Regras:
- Gere dados realistas e coerentes com os argumentos recebidos
- Para campos do tipo 'list', retorne uma lista de objetos com detalhes reais
- Para campos do tipo 'object', retorne um objeto estruturado com dados reais
- Para campos do tipo 'string', retorne texto descritivo e especifico
- NUNCA use placeholders como 'mock', 'exemplo', 'teste' — gere conteudo real
- Os dados devem ser coerentes entre si e com o contexto fornecido
- Responda em portugues"""

    def funcao(argumentos):
        prompt_usuario = f"Argumentos recebidos:\n{json.dumps(argumentos, indent=2, ensure_ascii=False)}"

        dados_llm, uso_tokens = _chamar_llm_ferramenta(prompt_sistema, prompt_usuario, campos_saida)

        if dados_llm:
            dados_llm["_entrada"] = argumentos
            return {"sucesso": True, "dados": dados_llm, "_tokens": uso_tokens}

        # fallback mock simples
        dados = {}
        for nome_campo, tipo_campo in campos_saida.items():
            dados[nome_campo] = _gerar_valor_fallback(tipo_campo, nome_campo)
        dados["_entrada"] = argumentos
        return {"sucesso": True, "dados": dados, "_tokens": _TOKENS_ZERO.copy()}

    return funcao


def _gerar_valor_fallback(tipo_campo: str, nome_campo: str):
    """Fallback quando nao ha API key — gera valores minimos."""
    tipo_normalizado = tipo_campo.lower() if isinstance(tipo_campo, str) else "string"
    if tipo_normalizado == "float":
        return round(random.uniform(0.01, 100.0), 2)
    if tipo_normalizado == "int":
        return random.randint(1, 500)
    if tipo_normalizado == "bool":
        return random.choice([True, False])
    if tipo_normalizado == "list":
        return [{"item": f"{nome_campo}_1"}, {"item": f"{nome_campo}_2"}]
    if tipo_normalizado == "object":
        return {"campo": nome_campo, "valor": "sem_api_key"}
    return f"{nome_campo}_sem_api_key"


def _resolver_adapter(habilidade: dict):
    """Resolve o adapter correto com base no tipo_implementacao da skill.

    Retorna uma funcao(argumentos) -> dict com o mesmo formato de sempre:
    {"sucesso": bool, "dados": dict, "_tokens": dict}
    """
    tipo = habilidade.get("tipo_implementacao", "mock")

    if tipo == "rest":
        try:
            from adapters.rest_adapter import criar_funcao_rest
            return criar_funcao_rest(habilidade)
        except ImportError:
            print(f"  [adapters] rest_adapter nao encontrado, usando mock para {habilidade.get('nome')}")
            return construir_ferramenta(habilidade)

    if tipo == "database":
        try:
            from adapters.db_adapter import criar_funcao_database
            return criar_funcao_database(habilidade)
        except ImportError:
            print(f"  [adapters] db_adapter nao encontrado, usando mock para {habilidade.get('nome')}")
            return construir_ferramenta(habilidade)

    if tipo == "mcp":
        try:
            from adapters.mcp_adapter import criar_funcao_mcp
            return criar_funcao_mcp(habilidade)
        except ImportError:
            print(f"  [adapters] mcp_adapter nao encontrado, usando mock para {habilidade.get('nome')}")
            return construir_ferramenta(habilidade)

    # mock (padrao) — comportamento das Unidades 1 e 2
    return construir_ferramenta(habilidade)


def construir_ferramentas_dos_contratos(contratos: dict) -> dict:
    """Constroi o registro de ferramentas a partir dos contratos (habilidades).

    Despacha cada skill para o adapter correto via tipo_implementacao.
    Se o adapter nao existe, faz fallback para mock (backward compatible).
    """
    habilidades = contratos.get("habilidades", {}).get("habilidades", [])
    ferramentas = {}
    for habilidade in habilidades:
        nome = habilidade.get("nome")
        if nome:
            tipo = habilidade.get("tipo_implementacao", "mock")
            ferramentas[nome] = _resolver_adapter(habilidade)
            if tipo != "mock":
                print(f"  [ferramentas] {nome} → {tipo}")
    return ferramentas


def extrair_evidencias_do_historico(historico: list) -> dict:
    """Extrai evidencias coletadas do historico de forma generica."""
    evidencias = {}
    for registro in historico:
        plano = registro.get("plano", {})
        resultado = registro.get("resultado_acao")
        nome_ferramenta = plano.get("nome_ferramenta")
        if resultado and resultado.get("sucesso") and nome_ferramenta:
            evidencias[nome_ferramenta] = resultado.get("dados", {})
    return evidencias


def montar_argumentos_mock(habilidade: dict, historico: list) -> dict:
    """Monta argumentos para uma ferramenta usando evidencias do historico."""
    argumentos = {}
    evidencias = extrair_evidencias_do_historico(historico)

    for nome_campo, tipo_campo in habilidade.get("entrada", {}).items():
        tipo_normalizado = tipo_campo.lower() if isinstance(tipo_campo, str) else "string"

        if tipo_normalizado == "object" and evidencias:
            argumentos[nome_campo] = evidencias
        else:
            argumentos[nome_campo] = _gerar_valor_fallback(tipo_campo, nome_campo)

    return argumentos
