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
#
# O modelo vem de env var porque a Groq já retirou dois modelos usados por este
# material (`llama-3.1-8b-instant`, do enunciado original, e `qwen/qwen3-32b`).
# Com `GROQ_MODEL` no .env, uma remoção futura é uma linha trocada, não cinco
# arquivos editados. Escolhas medidas nas cinco aulas (free tier, 2026-08-22):
#
#   qwen/qwen3.6-27b   PADRÃO. Único que mantém TODAS as aulas abaixo do teto de
#                      8.000 tokens/minuto (pico medido: 4.924, na aula 004).
#                      ~2x mais econômico e ~4x mais rápido que o gpt-oss-20b.
#                      Ressalva: catálogo "Preview" — pode sair sem aviso longo.
#   openai/gpt-oss-120b  Alternativa "Production" (estável), sem falhas de parse,
#                      mas estoura o teto nas aulas 002 (10.025) e 004 (11.007),
#                      então essas duas pausam no rate limit.
#   openai/gpt-oss-20b   O antigo padrão. Production e barato, mas com
#                      `reasoning_effort="low"` a Groq recusa o 3º tool call
#                      encadeado da aula 005 em ~80% das tentativas
#                      (`output_parse_failed`). Se voltar a ele, use
#                      GROQ_REASONING_EFFORT=medium.
_MODELO_PADRAO = "groq/qwen/qwen3.6-27b"

# `reasoning_effort` só existe nos modelos de raciocínio (família gpt-oss); o qwen
# ignora. Vazio = não envia o parâmetro.
_esforco = os.getenv("GROQ_REASONING_EFFORT", "").strip()
_opcoes_de_raciocinio = {"reasoning_effort": _esforco} if _esforco else {}

nexus_llm = RateLimitAwareLLM(
    model=os.getenv("GROQ_MODEL", _MODELO_PADRAO),
    api_key=os.getenv("GROQ_API_KEY"),
    temperature=0.2,
    # ATENÇÃO: a Groq RESERVA `max_tokens` do orçamento no momento da chamada — não
    # cobra o consumo real. A própria mensagem de erro entrega isso: para um prompt
    # de 11 tokens com max_tokens=2048, ela responde `Requested 2059`. Vale para os
    # dois limites do free tier: 8.000 tokens/minuto e 200.000 tokens/dia.
    # Consequência: com o antigo max_tokens=4096, o orçamento DIÁRIO comportava só
    # ~48 chamadas de LLM, e o de minuto, uma. Era a causa real dos rate limits que
    # apareciam em todas as aulas — não o modelo escolhido.
    # 2560 dá ~44% de folga sobre a maior resposta já observada (1.782 tokens, do
    # gpt-oss-120b) e reserva 37% menos que antes. Os artefatos em si são pequenos:
    # main.tf ~343 tokens, manifesto YAML ~218, JSON do dashboard ~145.
    max_tokens=int(os.getenv("GROQ_MAX_TOKENS", "2560")),
    **_opcoes_de_raciocinio,
)
