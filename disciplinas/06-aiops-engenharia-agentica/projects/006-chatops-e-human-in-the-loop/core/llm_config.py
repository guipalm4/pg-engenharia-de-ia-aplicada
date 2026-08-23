import os
import re
import time

import crewai.llms.cache as _crewai_cache
from crewai import LLM
from dotenv import load_dotenv
from litellm.exceptions import RateLimitError

load_dotenv()

# O CrewAI marca toda mensagem com `cache_breakpoint`, um campo de prompt caching
# da Anthropic que só o adaptador da Anthropic remove antes de chamar a API. A
# Groq rejeita o campo desconhecido, então neutralizamos o marcador.
# https://github.com/crewAIInc/crewAI/issues/5886
_crewai_cache.mark_cache_breakpoint = lambda msg: msg

# Trocável por GROQ_MODEL no .env. Vale conhecer essa saída: a cota diária da Groq
# é contada por modelo, e o catálogo muda (o llama-3.1-8b-instant do material
# original foi removido).
MODELO_PADRAO = "groq/qwen/qwen3.6-27b"

# Só a família gpt-oss usa `reasoning_effort`; o qwen ignora. Vazio = não envia.
_esforco = os.getenv("GROQ_REASONING_EFFORT", "").strip()

MAX_TENTATIVAS = 6
ESPERA_PADRAO_S = 35.0
ESPERA_MAXIMA_S = 180.0  # acima disso é a cota diária, e esperar não resolve

_TEMPO_PEDIDO = re.compile(r"try again in\s+([0-9hms.]+)", re.IGNORECASE)
_UNIDADES = re.compile(r"([\d.]+)(ms|h|m|s)")  # "ms" antes de "m": a ordem importa
_EM_SEGUNDOS = {"h": 3600.0, "m": 60.0, "s": 1.0, "ms": 0.001}


def segundos_ate_liberar(erro: Exception) -> float:
    """Lê o tempo que a Groq pede e devolve em segundos.

    A Groq responde em formato composto — '38.25s', '3m9.648s', '547ms' — e um
    parser que só entendesse segundos esperaria de menos e mataria o pipeline.
    """
    tempo = _TEMPO_PEDIDO.search(str(erro))
    partes = _UNIDADES.findall(tempo.group(1)) if tempo else []
    if not partes:
        return ESPERA_PADRAO_S
    return sum(float(valor) * _EM_SEGUNDOS[unidade] for valor, unidade in partes) + 1


class RateLimitAwareLLM(LLM):
    """LLM que espera e repete quando a Groq recusa por limite de tokens.

    O free tier recusa com frequência e o `num_retries` do litellm não cobre
    RateLimitError em `completion()`, daí o retry explícito.
    """

    def call(self, *args, **kwargs):
        for tentativa in range(1, MAX_TENTATIVAS + 1):
            try:
                return super().call(*args, **kwargs)
            except RateLimitError as erro:
                espera = segundos_ate_liberar(erro)
                if espera > ESPERA_MAXIMA_S:
                    print(f"\n🛑 A Groq pediu {espera / 60:.0f} min de espera: acabou a "
                          f"cota diária deste modelo. Troque GROQ_MODEL no .env — a "
                          f"cota é contada por modelo — ou volte mais tarde.\n")
                    raise
                if tentativa == MAX_TENTATIVAS:
                    raise
                print(f"⏳ Limite de tokens da Groq atingido. Aguardando {espera:.0f}s "
                      f"(tentativa {tentativa}/{MAX_TENTATIVAS - 1})...")
                time.sleep(espera)


# Centraliza a inteligência do projeto.
nexus_llm = RateLimitAwareLLM(
    model=os.getenv("GROQ_MODEL", MODELO_PADRAO),
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.2,
    **({"reasoning_effort": _esforco} if _esforco else {}),
)
