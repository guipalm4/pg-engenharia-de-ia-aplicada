import os

import crewai.llms.cache as _crewai_cache
from crewai import LLM
from dotenv import load_dotenv

load_dotenv()

# Workaround for https://github.com/crewAIInc/crewAI/issues/5886: crewai marks
# every message with a `cache_breakpoint` flag meant for Anthropic prompt
# caching, but only the Anthropic adapter strips it before the API call.
# Groq (via LiteLLM) rejects the unknown field, so we no-op the marker.
_crewai_cache.mark_cache_breakpoint = lambda msg: msg

# Centraliza a inteligência do projeto.
# O material original usava groq/llama-3.1-8b-instant, retirado do catálogo da
# Groq (a API responde model_not_found). O gpt-oss-20b é o substituto free-tier
# mais próximo: o menor modelo de uso geral da casa, com suporte a tool calling —
# do que todo o pipeline depende.
nexus_llm = LLM(
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