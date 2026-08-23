"""Regressão do parser de espera do RateLimitAwareLLM.

O material antigo só lia segundos puros ('38.25s'). A Groq também responde
'3m9.648s' (cota diária), '1h46m33.599s' e '547ms' — e nesses casos o parser
caía num fallback de 35s, curto demais, e o pipeline morria após 4 tentativas.
"""
import pytest

from core.llm_config import _ESPERA_MAXIMA_S, _segundos_ate_liberar


@pytest.mark.parametrize(
    "mensagem, esperado",
    [
        ("Please try again in 38.25s.", 39.25),          # TPM, formato simples
        ("Please try again in 547ms.", 1.547),           # sub-segundo
        ("Please try again in 3m9.648s.", 190.648),      # TPD curto
        ("Please try again in 7m5.52s.", 426.52),        # o que matou o pipeline
        ("Please try again in 1h46m33.599s.", 6394.599), # cota diária cheia
        ("Please try again in 2m.", 121.0),              # só minutos
    ],
)
def test_le_todos_os_formatos_da_groq(mensagem, esperado):
    assert _segundos_ate_liberar(Exception(mensagem)) == pytest.approx(esperado, abs=0.01)


def test_sem_tempo_na_mensagem_usa_o_padrao():
    assert _segundos_ate_liberar(Exception("Rate limit reached")) == 35.0


def test_espera_de_cota_diaria_passa_do_teto_que_dispara_a_desistencia():
    # É o que faz o pipeline avisar e desistir em vez de esperar em vão.
    assert _segundos_ate_liberar(Exception("try again in 7m5.52s")) > _ESPERA_MAXIMA_S
    # Já um limite por minuto tem de caber dentro do teto, para ser retentado.
    assert _segundos_ate_liberar(Exception("try again in 38.25s")) < _ESPERA_MAXIMA_S
