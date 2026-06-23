"""
Telemetria Estruturada.

Coleta eventos do ciclo de execucao e gera streams de observabilidade:
- TELEMETRY_STREAM: eventos do ciclo em tempo real
- AUDIT_LOGS: decisoes e acoes para auditoria
- HEALTH_METRICS: saude do agente (taxas de sucesso, estagnacao)
- PERFORMANCE_DATA: tempos por fase e consumo de tokens
"""

import time
import uuid
from datetime import datetime


class Telemetria:
    """Coletor de telemetria estruturada para uma execucao do agente."""

    def __init__(self, agente: str, tipo_agente: str):
        self.trace_id = uuid.uuid4().hex[:12]
        self.agente = agente
        self.tipo_agente = tipo_agente
        self.inicio = time.time()
        self.eventos = []
        self.fases = []
        self.tokens = {"prompt": 0, "completion": 0, "total": 0}
        self.chamadas_llm = 0
        self.ferramentas_sucesso = 0
        self.ferramentas_falha = 0
        self.circuit_breaker_ativacoes = 0
        self.validacao_payload_falhas = 0

    # --- registro de eventos ---

    def registrar(self, tipo: str, dados: dict = None):
        """Registra um evento generico na telemetria."""
        self.eventos.append({
            "timestamp": datetime.now().isoformat(),
            "elapsed_ms": round((time.time() - self.inicio) * 1000),
            "trace_id": self.trace_id,
            "tipo": tipo,
            "dados": dados or {},
        })

    def iniciar_fase(self, nome_fase: str, etapa: int) -> dict:
        """Inicia a medicao de tempo de uma fase. Retorna o marcador."""
        marcador = {
            "fase": nome_fase,
            "etapa": etapa,
            "inicio": time.time(),
            "fim": None,
            "duracao_ms": None,
        }
        return marcador

    def finalizar_fase(self, marcador: dict):
        """Finaliza a medicao de uma fase e registra."""
        marcador["fim"] = time.time()
        marcador["duracao_ms"] = round((marcador["fim"] - marcador["inicio"]) * 1000, 1)
        self.fases.append(marcador)
        self.registrar("fase_concluida", {
            "fase": marcador["fase"],
            "etapa": marcador["etapa"],
            "duracao_ms": marcador["duracao_ms"],
        })

    def registrar_tokens(self, uso: dict):
        """Acumula consumo de tokens."""
        self.tokens["prompt"] += uso.get("prompt", 0)
        self.tokens["completion"] += uso.get("completion", 0)
        self.tokens["total"] += uso.get("total", 0)
        self.chamadas_llm += 1

    def registrar_resultado_ferramenta(self, sucesso: bool):
        """Contabiliza sucesso/falha de ferramentas."""
        if sucesso:
            self.ferramentas_sucesso += 1
        else:
            self.ferramentas_falha += 1

    def registrar_circuit_breaker(self, motivo: str):
        """Registra ativacao do circuit breaker."""
        self.circuit_breaker_ativacoes += 1
        self.registrar("circuit_breaker", {"motivo": motivo})

    def registrar_validacao_payload_falha(self, ferramenta: str, erros: list):
        """Registra falha na validacao de payload."""
        self.validacao_payload_falhas += 1
        self.registrar("validacao_payload_falha", {"ferramenta": ferramenta, "erros": erros})

    # --- streams de saida ---

    def telemetry_stream(self) -> list:
        """Retorna todos os eventos ordenados por timestamp."""
        return self.eventos

    def audit_logs(self) -> list:
        """Retorna apenas eventos de decisao e acao para auditoria."""
        tipos_auditoria = {
            "plano_gerado", "ferramenta_executada", "circuit_breaker",
            "validacao_payload_falha", "confirmacao_humana", "finalizado",
        }
        return [e for e in self.eventos if e["tipo"] in tipos_auditoria]

    def health_metrics(self) -> dict:
        """Retorna metricas de saude do agente."""
        total_ferramentas = self.ferramentas_sucesso + self.ferramentas_falha
        taxa_sucesso = (
            round(self.ferramentas_sucesso / total_ferramentas * 100, 1)
            if total_ferramentas > 0 else 0.0
        )
        return {
            "trace_id": self.trace_id,
            "taxa_sucesso_ferramentas": taxa_sucesso,
            "ferramentas_sucesso": self.ferramentas_sucesso,
            "ferramentas_falha": self.ferramentas_falha,
            "circuit_breaker_ativacoes": self.circuit_breaker_ativacoes,
            "validacao_payload_falhas": self.validacao_payload_falhas,
            "chamadas_llm": self.chamadas_llm,
        }

    def performance_data(self) -> dict:
        """Retorna dados de performance: tempos por fase e tokens."""
        tempos_por_fase = {}
        for fase in self.fases:
            nome = fase["fase"]
            if nome not in tempos_por_fase:
                tempos_por_fase[nome] = {"total_ms": 0, "contagem": 0, "max_ms": 0}
            tempos_por_fase[nome]["total_ms"] += fase["duracao_ms"]
            tempos_por_fase[nome]["contagem"] += 1
            if fase["duracao_ms"] > tempos_por_fase[nome]["max_ms"]:
                tempos_por_fase[nome]["max_ms"] = fase["duracao_ms"]

        for nome, dados in tempos_por_fase.items():
            dados["media_ms"] = round(dados["total_ms"] / dados["contagem"], 1)

        return {
            "trace_id": self.trace_id,
            "tempo_total_ms": round((time.time() - self.inicio) * 1000),
            "tokens": self.tokens,
            "chamadas_llm": self.chamadas_llm,
            "fases": tempos_por_fase,
        }

    def kpis_etapa(self, etapa: int) -> dict:
        """Retorna latencias das fases planejar e agir para uma etapa especifica."""
        latencias = {}
        for fase in self.fases:
            if fase["etapa"] == etapa and fase["fase"] in ("planejar", "agir"):
                latencias[fase["fase"]] = fase["duracao_ms"]
        return latencias

    def resumo_completo(self) -> dict:
        """Retorna todos os streams consolidados para o trace.json."""
        return {
            "trace_id": self.trace_id,
            "agente": self.agente,
            "tipo_agente": self.tipo_agente,
            "telemetry_stream": self.telemetry_stream(),
            "audit_logs": self.audit_logs(),
            "health_metrics": self.health_metrics(),
            "performance_data": self.performance_data(),
        }
