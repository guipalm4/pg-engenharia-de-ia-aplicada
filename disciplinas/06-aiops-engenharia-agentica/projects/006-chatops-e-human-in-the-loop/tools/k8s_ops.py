import fnmatch
import os
import re
import subprocess

from crewai.tools import tool

# --- Política de rollout: os limiares vivem aqui, não no prompt. -------------
# A decisão de seguir ou reverter é determinística e auditável; ao LLM cabe
# apenas decidir QUANDO consultar a ferramenta e como narrar o resultado.
ERROR_RATE_THRESHOLD_PCT = 5.0
LATENCY_THRESHOLD_MS = 300.0

# --- Grade de proteção do kubectl -------------------------------------------
# `kubectl apply` obedece ao contexto ativo, que pode ser produção. Só aplicamos
# em contextos que casem com estes padrões (glob). Sobrescrevível por ambiente:
#   K8S_ALLOWED_CONTEXTS="kind-*,meu-cluster-de-lab"
# Sem timeout explícito o kubectl tenta reconectar com backoff e trava para
# sempre quando o cluster está inalcançável — inaceitável dentro de um pipeline
# de agente, que ficaria pendurado sem produzir resposta.
KUBECTL_TIMEOUT_SECONDS = 20

DEFAULT_ALLOWED_CONTEXTS = (
    "kind-*",
    "k3d-*",
    "minikube",
    "docker-desktop",
    "rancher-desktop",
    "orbstack",
    "colima",
)

# Marcadores que identificam "não consegui falar com o cluster" no stderr do
# kubectl — o que é diferente de "o cluster recusou o manifesto".
_CONNECTION_MARKERS = (
    "connection to the server",
    "unable to connect to the server",
    "couldn't get current server api group list",
    "no configuration has been provided",
    "timed out waiting for the kubernetes api server",
    "context deadline exceeded",
    "i/o timeout",
)


def _run_kubectl(args: list[str]) -> tuple[int, str, str]:
    """Roda kubectl com timeout duplo. Retorna (returncode, stdout, stderr).

    O `--request-timeout` limita cada requisição ao API server; o `timeout` do
    subprocess é a rede de segurança para o backoff do próprio kubectl.
    returncode 127 = binário ausente; 124 = estouro de tempo (convenção do shell).
    """
    try:
        result = subprocess.run(
            ["kubectl", *args, f"--request-timeout={KUBECTL_TIMEOUT_SECONDS}s"],
            capture_output=True,
            text=True,
            check=False,
            timeout=KUBECTL_TIMEOUT_SECONDS + 10,
        )
    except FileNotFoundError:
        return 127, "", "kubectl executable not found"
    except subprocess.TimeoutExpired:
        return 124, "", "timed out waiting for the kubernetes api server"
    return result.returncode, result.stdout, result.stderr


def _allowed_context_patterns() -> tuple[str, ...]:
    """Padrões de contexto liberados para apply, do ambiente ou o default seguro."""
    raw = os.getenv("K8S_ALLOWED_CONTEXTS", "").strip()
    if raw:
        return tuple(pattern.strip() for pattern in raw.split(",") if pattern.strip())
    return DEFAULT_ALLOWED_CONTEXTS


def _context_allowed(context: str, patterns: tuple[str, ...]) -> bool:
    """Casa o nome do contexto contra os padrões glob (para 'kind-*' funcionar)."""
    return any(fnmatch.fnmatch(context, pattern) for pattern in patterns)


def _current_context() -> tuple[str | None, str]:
    """Retorna (nome_do_contexto, status).

    status: 'ok' | 'no_kubectl' (binário ausente) | 'no_context' (kubeconfig vazio).
    Separar os dois últimos permite mensagens honestas em vez de um "sem cluster"
    genérico que esconde a causa.
    """
    returncode, stdout, _ = _run_kubectl(["config", "current-context"])
    if returncode == 127:
        return None, "no_kubectl"

    context = stdout.strip()
    if returncode != 0 or not context:
        return None, "no_context"
    return context, "ok"


def _cluster_reachable(context: str) -> bool:
    """Sinal POSITIVO de que o API server do contexto responde.

    Inferir "sem cluster" classificando o stderr é frágil: o conjunto de falhas
    de rede é aberto (EOF, no such host, TLS handshake timeout...) e o que não
    for reconhecido vira acusação indevida de manifesto inválido. Perguntar ao
    cluster se ele está lá é determinístico. `api-versions` só devolve 0 quando
    o server de fato respondeu.
    """
    returncode, _, _ = _run_kubectl(["api-versions", "--context", context])
    return returncode == 0


def _classify_kubectl_failure(stderr: str) -> str:
    """Distingue 'cluster inalcançável' de 'cluster recusou o manifesto'.

    Sem essa distinção, um YAML genuinamente quebrado seria reportado como
    simples ausência de cluster.
    """
    haystack = stderr.lower()
    if any(marker in haystack for marker in _CONNECTION_MARKERS):
        return "no_cluster"
    return "rejected"


def _evaluate_metrics(metrics_data: str) -> tuple[str, str]:
    """Decide o destino do canário a partir da string de métricas. FALHA FECHADO.

    Métrica ausente ou ilegível é motivo de ROLLBACK, não de aprovação por
    omissão: não conseguir medir o canário é indistinguível, do ponto de vista
    de risco, de medi-lo e achar problema.

    Retorna (decisão, motivo) com decisão em {'ROLLBACK', 'PROCEED'}.
    """
    error_rate = re.search(r"error_rate:\s*([\d.]+)\s*%", metrics_data, re.IGNORECASE)
    latency = re.search(r"latency:\s*([\d.]+)\s*ms", metrics_data, re.IGNORECASE)

    if error_rate is None:
        return "ROLLBACK", f"métrica 'error_rate' ausente ou ilegível em {metrics_data!r}"
    if latency is None:
        return "ROLLBACK", f"métrica 'latency' ausente ou ilegível em {metrics_data!r}"

    error_rate_pct = float(error_rate.group(1))
    latency_ms = float(latency.group(1))

    if error_rate_pct > ERROR_RATE_THRESHOLD_PCT:
        return "ROLLBACK", f"error_rate {error_rate_pct}% acima do limiar de {ERROR_RATE_THRESHOLD_PCT}%"
    if latency_ms > LATENCY_THRESHOLD_MS:
        return "ROLLBACK", f"latency {latency_ms}ms acima do limiar de {LATENCY_THRESHOLD_MS}ms"

    return "PROCEED", (
        f"error_rate {error_rate_pct}% (limiar {ERROR_RATE_THRESHOLD_PCT}%) e "
        f"latency {latency_ms}ms (limiar {LATENCY_THRESHOLD_MS}ms) dentro do aceitável"
    )


@tool("generate_k8s_manifest")
def generate_k8s_manifest(app_name: str, replicas: int, port: int) -> str:
    """Generates Kubernetes Deployment and Service YAML manifests on disk."""
    # O template abaixo é onde a imagem e a forma do probe são de fato garantidas.
    # Restrição codificada não precisa ser pedida ao LLM no prompt: ele fornece
    # apenas os valores (app_name, replicas, port), nunca a estrutura.
    manifest = f"""apiVersion: apps/v1
kind: Deployment
metadata:
  name: {app_name}
spec:
  replicas: {replicas}
  selector:
    matchLabels:
      app: {app_name}
  template:
    metadata:
      labels:
        app: {app_name}
    spec:
      containers:
      - name: {app_name}
        image: nginx:latest
        ports:
        - containerPort: {port}
        readinessProbe:
          httpGet:
            path: /
            port: {port}
---
apiVersion: v1
kind: Service
metadata:
  name: {app_name}-svc
spec:
  selector:
    app: {app_name}
  ports:
  - protocol: TCP
    port: 80
    targetPort: {port}
"""
    filename = f"{app_name}-k8s.yaml"
    with open(filename, "w", encoding="utf-8") as file:
        file.write(manifest)
    return f"✅ Kubernetes manifests for '{app_name}' successfully generated in '{filename}'."


@tool("apply_k8s_manifest")
def apply_k8s_manifest(filename: str) -> str:
    """Applies a Kubernetes manifest via kubectl, only on an allowlisted context."""
    if not os.path.exists(filename):
        return f"❌ Error: The file '{filename}' was not found to apply."

    context, status = _current_context()

    if status == "no_kubectl":
        return (
            "ℹ️ Simulation Mode: 'kubectl' is not installed, so nothing was applied. "
            "In production, ArgoCD or Flux would reconcile this manifest. "
            "NOTE: the manifest was NOT validated — validation requires a live API server."
        )
    if status == "no_context":
        return (
            "ℹ️ Simulation Mode: no active kubectl context is configured, so nothing was applied. "
            "NOTE: the manifest was NOT validated — validation requires a live API server."
        )

    patterns = _allowed_context_patterns()
    if not _context_allowed(context, patterns):
        return (
            f"⛔ BLOCKED: the active kubectl context '{context}' is not in the allowlist "
            f"({', '.join(patterns)}), so nothing was applied. Switch to a disposable cluster "
            f"(kind/minikube) or set K8S_ALLOWED_CONTEXTS to authorize this context explicitly."
        )

    if not _cluster_reachable(context):
        return (
            f"⚠️ GitOps Simulation: context '{context}' is allowlisted but its cluster is "
            f"unreachable, so nothing was applied. NOTE: the manifest was NOT validated — "
            f"validation requires a live API server."
        )

    # Valida contra o API server ANTES de mutar. É a única validação real
    # disponível: --dry-run=client não checa schema (aceita replicas como string).
    dry_run_rc, _, dry_run_stderr = _run_kubectl(
        ["apply", "--dry-run=server", "--validate=strict", "--context", context, "-f", filename]
    )
    if dry_run_rc != 0:
        # Rede de segurança: o cluster respondeu à sonda mas caiu no meio do caminho.
        if _classify_kubectl_failure(dry_run_stderr) == "no_cluster":
            return (
                f"⚠️ GitOps Simulation: context '{context}' became unreachable during validation, "
                f"so nothing was applied. NOTE: the manifest was NOT validated."
            )
        return f"❌ REJECTED by the API server on context '{context}':\n{dry_run_stderr.strip()}"

    apply_rc, apply_stdout, apply_stderr = _run_kubectl(["apply", "--context", context, "-f", filename])
    if apply_rc == 0:
        return f"✅ GitOps Sync Success on context '{context}': {apply_stdout.strip()}"

    return f"❌ Apply failed on context '{context}':\n{apply_stderr.strip()}"


@tool("analyze_canary_metrics")
def analyze_canary_metrics(metrics_data: str) -> str:
    """Analyzes application metrics to decide if a Canary Rollout should proceed or rollback.

    Args:
        metrics_data: Metrics string, e.g. 'error_rate: 1%, latency: 80ms'.
                      Both metrics are required; anything missing triggers a rollback.
    """
    decision, reason = _evaluate_metrics(metrics_data)
    if decision == "ROLLBACK":
        return f"❌ ROLLBACK: {reason}. Reverting deployment."
    return f"✅ PROCEED: {reason}. Canary rollout approved for production."
