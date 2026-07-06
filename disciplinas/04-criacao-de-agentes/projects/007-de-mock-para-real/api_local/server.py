"""
API local para testes — simula endpoints de monitoramento.

Uso:
  pip install fastapi uvicorn
  python server.py

Endpoints:
  GET  /api/v1/metrics?service=checkout&window_minutes=60
  GET  /api/v1/logs?service=checkout&window_minutes=60&min_level=WARN
  GET  /api/v1/deploys?service=checkout&window_hours=24

Esta API retorna dados realistas (nao mock) com valores fixos
para que o aluno possa comparar trace mock vs trace real.
"""

import random
import time
from datetime import datetime, timedelta

import uvicorn
from fastapi import FastAPI, Query

app = FastAPI(title="Monitor API Local", version="1.0")


@app.get("/api/v1/metrics")
def get_metrics(
    service: str = Query(..., description="Nome do servico"),
    window_minutes: int = Query(60, description="Janela de tempo em minutos"),
):
    """Retorna metricas reais do servico."""
    return {
        "latencia_p99_ms": 342.7,
        "vazao_rps": 1847,
        "taxa_erro": 4.2,
        "status": "degradado",
        "servico": service,
        "janela_minutos": window_minutes,
        "coletado_em": datetime.now().isoformat(),
    }


@app.get("/api/v1/logs")
def get_logs(
    service: str = Query(..., description="Nome do servico"),
    window_minutes: int = Query(60, description="Janela de tempo"),
    min_level: str = Query("WARN", description="Nivel minimo"),
):
    """Retorna logs estruturados do servico."""
    agora = datetime.now()
    return {
        "eventos": [
            {
                "timestamp": (agora - timedelta(minutes=12)).isoformat(),
                "nivel": "ERROR",
                "mensagem": f"timeout conectando a upstream-payments: 30s exceeded",
                "servico": service,
            },
            {
                "timestamp": (agora - timedelta(minutes=8)).isoformat(),
                "nivel": "ERROR",
                "mensagem": f"circuit breaker aberto para upstream-payments",
                "servico": service,
            },
            {
                "timestamp": (agora - timedelta(minutes=5)).isoformat(),
                "nivel": "WARN",
                "mensagem": f"latencia p99 acima do SLO: 342ms > 200ms",
                "servico": service,
            },
        ],
        "contagem_total": 3,
    }


@app.get("/api/v1/deploys")
def get_deploys(
    service: str = Query(..., description="Nome do servico"),
    window_hours: int = Query(24, description="Janela em horas"),
):
    """Retorna historico de deploys do servico."""
    agora = datetime.now()
    return {
        "deploys": [
            {
                "versao": "v2.4.1",
                "data_hora": (agora - timedelta(minutes=45)).isoformat(),
                "autor": "ci/cd-pipeline",
                "status": "sucesso",
                "mudancas": "refactor connection pool settings",
            },
        ],
        "contagem_total": 1,
    }


if __name__ == "__main__":
    print("Iniciando API local em http://localhost:8100")
    print("Endpoints:")
    print("  GET /api/v1/metrics?service=checkout&window_minutes=60")
    print("  GET /api/v1/logs?service=checkout&window_minutes=60&min_level=WARN")
    print("  GET /api/v1/deploys?service=checkout&window_hours=24")
    uvicorn.run(app, host="0.0.0.0", port=8100)
