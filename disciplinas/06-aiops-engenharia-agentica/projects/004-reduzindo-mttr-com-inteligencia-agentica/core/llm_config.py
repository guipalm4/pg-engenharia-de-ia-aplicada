import os
import re
import time

import crewai.llms.cache as _crewai_cache
from crewai import LLM
from dotenv import load_dotenv
from litellm.exceptions import RateLimitError

load_dotenv()

# Workaround for https://github.com/crewAIInc/crewAI/issues/5886: crewai marks
# every message with a `cache_breakpoint` flag meant for Anthropic prompt
# caching, but only the Anthropic adapter strips it before the API call.
# Groq (via LiteLLM) rejects the unknown field, so we no-op the marker.
_crewai_cache.mark_cache_breakpoint = lambda msg: msg

# O free tier da Groq dá 8.000 tokens por minuto, e um run do pipeline queima
# alguns milhares em poucos segundos — rodar duas vezes seguidas estoura o limite
# e mata o pipeline no meio de uma task. O `num_retries` do litellm NÃO resolve:
# ele não faz retry de RateLimitError em `completion()` (verificado — desiste em
# 0,4s, sem esperar). Daí o retry explícito abaixo.
_MAX_TENTATIVAS = 4
_ESPERA_PADRAO_S = 35.0


def _segundos_ate_liberar(erro: Exception) -> float:
    """Lê o tempo de espera da mensagem da Groq ('Please try again in 38.25s')."""
    encontrado = re.search(r"try again in ([\d.]+)s", str(erro), re.IGNORECASE)
    if encontrado:
        return float(encontrado.group(1)) + 1  # margem para o balde reencher
    return _ESPERA_PADRAO_S


class RateLimitAwareLLM(LLM):
    """LLM que espera e repete quando a Groq recusa por tokens/minuto."""

    def call(self, *args, **kwargs):
        for tentativa in range(_MAX_TENTATIVAS):
            try:
                return super().call(*args, **kwargs)
            except RateLimitError as erro:
                if tentativa == _MAX_TENTATIVAS - 1:
                    raise
                espera = _segundos_ate_liberar(erro)
                print(f"⏳ Limite de tokens/minuto da Groq atingido. "
                      f"Aguardando {espera:.0f}s (tentativa {tentativa + 1}/{_MAX_TENTATIVAS - 1})...")
                time.sleep(espera)


# Centraliza a inteligência do projeto.
# O material original usava groq/llama-3.1-8b-instant, retirado do catálogo da
# Groq (a API responde model_not_found). O gpt-oss-20b é o substituto free-tier
# mais próximo: o menor modelo de uso geral da casa, com suporte a tool calling —
# do que todo o pipeline depende.
nexus_llm = RateLimitAwareLLM(
    model="groq/openai/gpt-oss-20b",
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.2,
    # O gpt-oss é um modelo de raciocínio: no esforço padrão ele gasta o orçamento
    # de saída pensando e trunca o JSON do tool call no meio, o que a Groq rejeita
    # com `tool_use_failed`. Com esforço baixo o raciocínio cai para ~10 tokens e
    # sobra orçamento para os argumentos da ferramenta.
    reasoning_effort="low",
    # Teto de saída folgado para os artefatos das aulas (~900 tokens), mas dentro
    # do limite de 8.000 tokens/minuto do free tier da Groq.
    max_tokens=4096
)