"""Testes dos helpers puros de tools/k8s_ops.py.

Cobrem só decisão pura: sem rede, sem cluster, sem GROQ_API_KEY.
"""
import pytest

import tools.k8s_ops as k8s_ops
from tools.k8s_ops import (
    DEFAULT_ALLOWED_CONTEXTS,
    _classify_kubectl_failure,
    _cluster_reachable,
    _context_allowed,
    _evaluate_metrics,
)


class TestEvaluateMetrics:
    """A decisão do canário falha FECHADO: não medir é motivo de rollback."""

    def test_metricas_saudaveis_seguem(self):
        decision, reason = _evaluate_metrics("error_rate: 1%, latency: 80ms")
        assert decision == "PROCEED"
        assert "1.0%" in reason

    def test_error_rate_acima_do_limiar_reverte(self):
        decision, reason = _evaluate_metrics("error_rate: 8%, latency: 80ms")
        assert decision == "ROLLBACK"
        assert "error_rate" in reason

    def test_latencia_acima_do_limiar_reverte(self):
        """A latência era simplesmente ignorada antes desta correção."""
        decision, reason = _evaluate_metrics("error_rate: 1%, latency: 900ms")
        assert decision == "ROLLBACK"
        assert "latency" in reason

    @pytest.mark.parametrize("metrics", [
        "latency: 80ms",                      # sem error_rate
        "error_rate: 1%",                     # sem latency
        "taxa de erro baixa, tudo estável",   # parafraseado pelo LLM
        "",                                   # vazio
    ])
    def test_metrica_ausente_ou_ilegivel_reverte(self, metrics):
        """Antes da correção, todos estes casos caíam em PROCEED por omissão."""
        decision, _ = _evaluate_metrics(metrics)
        assert decision == "ROLLBACK"

    def test_limiar_e_exclusivo(self):
        """Exatamente no limiar não é violação."""
        assert _evaluate_metrics("error_rate: 5%, latency: 300ms")[0] == "PROCEED"


class TestContextAllowed:
    """Grade de proteção: apply só em cluster descartável."""

    def test_kind_local_e_liberado_pelo_default(self):
        assert _context_allowed("kind-unipds-aiops-labs", DEFAULT_ALLOWED_CONTEXTS)

    def test_minikube_e_liberado_pelo_default(self):
        assert _context_allowed("minikube", DEFAULT_ALLOWED_CONTEXTS)

    def test_contexto_de_producao_e_bloqueado(self):
        assert not _context_allowed("prod-eks-nexus", DEFAULT_ALLOWED_CONTEXTS)

    def test_nome_parecido_nao_passa(self):
        """'kind' sem hífen não casa com o glob 'kind-*'."""
        assert not _context_allowed("kindergarten-prod", DEFAULT_ALLOWED_CONTEXTS)

    def test_padrao_customizado_substitui_o_default(self):
        patterns = ("meu-lab", "sandbox-*")
        assert _context_allowed("sandbox-01", patterns)
        assert not _context_allowed("kind-unipds-aiops-labs", patterns)


class TestClassifyKubectlFailure:
    """Cluster inalcançável não é a mesma coisa que manifesto recusado."""

    def test_connection_refused_e_falta_de_cluster(self):
        stderr = "The connection to the server 127.0.0.1:9 was refused - did you specify the right host or port?"
        assert _classify_kubectl_failure(stderr) == "no_cluster"

    def test_api_group_list_e_falta_de_cluster(self):
        stderr = 'couldn\'t get current server API group list: Get "https://127.0.0.1:9/api": dial tcp: connect: connection refused'
        assert _classify_kubectl_failure(stderr) == "no_cluster"

    def test_manifesto_invalido_e_rejeicao(self):
        stderr = (
            'Error from server (BadRequest): error when creating "bad.yaml": '
            "Deployment in version \"v1\" cannot be handled as a Deployment: json: "
            "cannot unmarshal string into Go struct field DeploymentSpec.spec.replicas of type int32"
        )
        assert _classify_kubectl_failure(stderr) == "rejected"

    def test_campo_desconhecido_e_rejeicao(self):
        stderr = 'error: strict decoding error: unknown field "spec.template.spec.containers[0].readinessProbe.initialDelay"'
        assert _classify_kubectl_failure(stderr) == "rejected"


class TestClusterReachable:
    """Alcançabilidade é sinal POSITIVO, não ausência de erro conhecido."""

    def test_api_versions_ok_significa_alcancavel(self, monkeypatch):
        monkeypatch.setattr(k8s_ops, "_run_kubectl", lambda args: (0, "v1\napps/v1", ""))
        assert _cluster_reachable("kind-lab")

    def test_api_versions_falha_significa_inalcancavel(self, monkeypatch):
        monkeypatch.setattr(k8s_ops, "_run_kubectl", lambda args: (1, "", "error: EOF"))
        assert not _cluster_reachable("kind-lab")

    def test_timeout_significa_inalcancavel(self, monkeypatch):
        monkeypatch.setattr(k8s_ops, "_run_kubectl", lambda args: (124, "", "timed out"))
        assert not _cluster_reachable("kind-lab")

    def test_sonda_usa_o_contexto_pedido(self, monkeypatch):
        capturado = {}
        monkeypatch.setattr(k8s_ops, "_run_kubectl", lambda args: (capturado.update(args=args), (0, "", ""))[1])
        _cluster_reachable("kind-unipds-aiops-labs")
        assert "--context" in capturado["args"]
        assert "kind-unipds-aiops-labs" in capturado["args"]


class TestClassifyIsSecondarySignal:
    """Por que a sonda existe: a classificação por stderr não cobre tudo."""

    def test_eof_nao_e_reconhecido_como_falta_de_cluster(self):
        """Caso real observado: cluster morto devolve 'error: EOF'.

        A classificação erra aqui — e é exatamente por isso que _cluster_reachable
        roda ANTES, tornando este ramo apenas rede de segurança para o cluster
        cair no meio da operação.
        """
        assert _classify_kubectl_failure("error: EOF") == "rejected"
