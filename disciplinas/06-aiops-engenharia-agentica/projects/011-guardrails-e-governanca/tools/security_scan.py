import os
import subprocess

from crewai.tools import tool


def _read_target(target: str) -> str:
    """Resolves an audit target into infrastructure code.

    The caller is an LLM, so it may send either a file path or the code itself.
    """
    if "\n" not in target and os.path.exists(target):
        with open(target, encoding="utf-8") as file:
            return file.read()
    return target


@tool("run_checkov_scan")
def run_checkov_scan(target: str = "main.tf") -> str:
    """Runs the Checkov static analysis security scanner on an infrastructure file.

    Args:
        target: Path of the infrastructure file to scan, e.g. 'main.tf'.
    """
    if not os.path.exists(target):
        return f"❌ Error: File '{target}' not found for scanning."

    try:
        # Executes Checkov CLI to scan the target file
        result = subprocess.run(
            ["checkov", "-f", target, "--quiet", "--compact"],
            capture_output=True,
            text=True,
            check=False
        )

        # Checkov exits with non-zero code or prints FAILED if it finds violations
        if result.returncode != 0 or "FAILED" in result.stdout:
            return f"❌ Security Failures Detected by Checkov:\n{result.stdout.strip()}"
        
        return "✅ Checkov: No vulnerabilities detected. Infrastructure code is secure."
     

    except FileNotFoundError:
        return "⚠️ Error: 'checkov' command-line tool not found. Run 'pip install checkov' in the terminal."
    except Exception as error:
        return f"⚠️ Unexpected error running scanner: {str(error)}"


@tool("validate_opa_policies")
def validate_opa_policies(target: str = "main.tf") -> str:
    """
    Simulates the Open Policy Agent (OPA) policy decision engine.
    Validates custom corporate governance rules not checked by generic scanners.

    Args:
        target: Path of the infrastructure file to validate, e.g. 'main.tf'.
    """
    content = _read_target(target)
    content_lower = content.lower()

    # 1. Geographic compliance policy
    if "us-east-1" not in content_lower:
        return "❌ OPA REJECTED: Violation of rule 'SOBERANIA_DADOS'. Nexus resources must reside in us-east-1."

    # 2. Cost control policy
    if "t3.large" in content_lower:
        return "❌ OPA REJECTED: Violation of rule 'COST_CONTROL'. Large instance sizes require manual finance approval."

    # 3. Network boundary policy
    if "0.0.0.0/0" in content:
        return "❌ OPA REJECTED: Violation of rule 'NO_PUBLIC_INGRESS'. Open ingress CIDR ranges are strictly forbidden."

    return "✅ OPA PASSED: Infrastructure code complies with Nexus governance policies."