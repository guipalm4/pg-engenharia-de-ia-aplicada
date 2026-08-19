# Skill: nova-aula

Prepara o projeto **$ARGUMENTS** da disciplina 06 a partir do lab correspondente no repositório gabarito: copia a aula anterior, soma os agentes e tools novos, ajusta o `pyproject`, roda o pipeline e mede o custo.

Termina **antes** do README — a documentação é análise, não mecânica, e sai depois com `/finaliza-projeto`.

`$ARGUMENTS` é o nome completo da pasta, no formato `NNN-slug-descritivo` (ex.: `005-observabilidade-preditiva`). O slug é editorial: vem do título da aula, não do nome do lab.

## Contexto: por que este comando existe

Cada arquivo em `unipds-gabarito/modulo06-aiops-engenharia-agentica/labs/moduloN_*.py` vira um projeto `NNN-*` nesta trilha, e **o nome do entrypoint é sempre o sufixo do lab** (`modulo4_troubleshooting.py` → `troubleshooting.py`).

O `core/agents.py` e o `tools/` do gabarito são a **união das 12 aulas**. Cada projeto `NNN` carrega o subconjunto acumulado até N — a duplicação entre pastas é proposital, é o que permite abrir 001 e 004 lado a lado e ver o delta.

| Aula | Agente novo | Tools novas |
|---|---|---|
| 001 | `get_architect` | `policy_rag` |
| 002 | `get_auditor` | `file_writer`, `security_scan` |
| 003 | `get_sre_agent` | `k8s_ops` |
| 004 | `get_oncall_sre` | `k8s_diag`, `obs_tools` |
| 005 | `get_aiops_agent` | `aiops_tools` |
| 006 | `get_chatops_agent` | `chatops_tools` |
| 007 | `get_devsecops_agent` | — |
| 008 | `get_cicd_agent` | — |
| 009 | `get_finops_agent` | — |
| 010 | `get_sre_knowledge_agent` | — |
| 011 | — (usa `llm_config` direto) | — |
| 012 | `get_nexus_manager_agent` | — |

A tabela é referência, não fonte da verdade: o passo 1 lê os imports do lab. Se divergir, **o lab manda**.

> `tools/governance_tools.py` existe no gabarito mas nenhum lab o importa, e as aulas 007–010 não importam tool nenhuma. Ao chegar nelas, conferir se o lab constrói tools inline antes de concluir que não há delta de ferramenta.

## Passos

### 1. Descoberta (script único — leia só o output)

```bash
BASE=disciplinas/06-aiops-engenharia-agentica/projects
GAB=$(find ~/Dev/Projects/Personal -maxdepth 4 -type d -name "unipds-gabarito" 2>/dev/null | head -1)/modulo06-aiops-engenharia-agentica
NUM=$(echo "$ARGUMENTS" | grep -oE '^[0-9]+')
PREV=$(find "$BASE" -maxdepth 1 -type d -name "$(printf '%03d' $((10#$NUM - 1)))-*" | head -1)
LAB=$(ls "$GAB"/labs/modulo$((10#$NUM))_*.py 2>/dev/null | head -1)
PREV_LAB=$(ls "$GAB"/labs/modulo$((10#$NUM - 1))_*.py 2>/dev/null | head -1)

echo "PROJECT=$BASE/$ARGUMENTS"
echo "PREV=$PREV"
echo "LAB=$LAB"
echo "ENTRYPOINT=$(basename "$LAB" .py | sed "s/^modulo$((10#$NUM))_//").py"
echo "ENTRYPOINT_ANTERIOR=$(basename "$PREV_LAB" .py | sed "s/^modulo$((10#$NUM - 1))_//").py"
echo "=== imports do lab (o delta real da aula) ==="
python3 - "$LAB" <<'IMPORTS'
import ast, sys
for n in ast.walk(ast.parse(open(sys.argv[1]).read())):
    if isinstance(n, ast.ImportFrom) and n.module:
        if n.module == "core.agents":
            for a in n.names: print("  agente:", a.name)
        elif n.module.startswith("tools."):
            print("  tool:  ", n.module.split(".", 1)[1])
IMPORTS
echo "=== arquivos que o lab referencia por nome ==="
grep -oE "'[a-zA-Z0-9_.-]+\.(yaml|yml|json|md|tf)'" "$LAB" | tr -d "'" | sort -u
```

Se `PREV` vier vazio, pare: esta skill só serve para aula incremental. Se `LAB` vier vazio, confira o número.

### 2. Cópia da aula anterior + entrypoint

A herança é o mecanismo da trilha: copiar `NNN-1` inteiro é o comportamento correto, não preguiça.

```bash
cp -R "$PREV" "$BASE/$ARGUMENTS"
cd "$BASE/$ARGUMENTS"
rm -rf .venv __pycache__ .pytest_cache */__pycache__ .DS_Store README.md README.original.md
rm -f "$ENTRYPOINT_ANTERIOR"          # cada pasta tem UM entrypoint
cp "$LAB" "$ENTRYPOINT"
```

Depois liste os artefatos de saída herdados e **remova só os que são output da aula anterior** (`main.tf`, `*-k8s.yaml`, `*-fix.yaml`…). Tools herdadas ficam; artefato gerado por um pipeline que não existe mais nesta pasta, não.

```bash
ls *.tf *.yaml *.yml *.json 2>/dev/null
```

### 3. Somar os agentes e tools que o lab importa

Para cada `from core.agents import X` do passo 1 que ainda não exista em `core/agents.py`, copie a fábrica correspondente de `$GAB/core/agents.py` — íntegra, sem reescrever. Para cada `from tools.Y import ...` cujo `tools/Y.py` não exista, `cp "$GAB/tools/Y.py" tools/`.

O `modulo12` importa os agentes em bloco entre parenteses, entao `grep` de uma linha so nao serve. O parsing abaixo e por AST justamente por isso:

```bash
python3 - "$LAB" <<'FALTAM'
import ast, os, sys
faltam = False
for n in ast.walk(ast.parse(open(sys.argv[1]).read())):
    if not (isinstance(n, ast.ImportFrom) and n.module):
        continue
    if n.module == "core.agents":
        atual = open("core/agents.py").read()
        for a in n.names:
            if f"def {a.name}" not in atual:
                print("  FALTA agente:", a.name); faltam = True
    elif n.module.startswith("tools."):
        mod = n.module.split(".", 1)[1]
        if not os.path.exists(f"tools/{mod}.py"):
            print("  FALTA tool:  ", f"tools/{mod}.py"); faltam = True
if not faltam:
    print("  nada a somar -- confira se o lab constroi as tools inline")
FALTAM
```

Traga também os arquivos de cenário/dados listados no passo 1 (ex.: `checkout-broken.yaml`), procurando na raiz do gabarito e em `$GAB/data/`.

### 4. Renomear o pacote

O `name` vem copiado da aula anterior. Dois membros com o mesmo nome **quebram o workspace uv** — este passo não é cosmético.

```bash
sed -i '' "s/^name = .*/name = \"aula-$ARGUMENTS\"/" pyproject.toml
cd "$BASE" && grep -h '^name' 0*/pyproject.toml   # todos devem ser únicos
uv sync --all-packages
```

### 5. Verificação (não pule — é onde os defeitos aparecem)

```bash
cd "$BASE/$ARGUMENTS"
uv run pytest -q          # os testes herdados devem continuar passando
uv run "$ENTRYPOINT"      # pipeline end-to-end
```

Depois, meça o custo. O free tier da Groq dá **8.000 tokens/minuto** e algumas aulas chegam perto do teto sozinhas (a 004 gasta ~8.900 por execução por causa do `allow_delegation=True`). O `RateLimitAwareLLM` em `core/llm_config.py` segura o pipeline pausando, mas o número precisa entrar no README.

```bash
cat > /tmp/medir.py <<'PY'
import time, os, sys, litellm
C = []
litellm.success_callback = [lambda kw, resp, s, e: C.append((time.time(), resp.usage.total_tokens)) if getattr(resp, "usage", None) else None]
ep = sys.argv[1]
try:
    exec(open(ep).read(), {"__name__": "__main__", "__file__": os.path.abspath(ep)})
except Exception as err:
    print(f"!! abortou: {type(err).__name__}: {str(err)[:160]}")
if C:
    pior = max(sum(t for ts, t in C if i <= ts < i + 60) for i, _ in C)
    print(f"\nchamadas={len(C)} total={sum(t for _, t in C)} pior_janela_60s={pior} (limite 8000)")
PY
uv run python /tmp/medir.py "$ENTRYPOINT"
```

Se a aula gerar YAML de Kubernetes, valide o artefato **contra o API server**. `--dry-run=client` não checa schema — ele aceita `replicas: "dois"` e campos inventados:

```bash
kubectl apply --dry-run=server --validate=strict -f <artefato-gerado>.yaml
```

### 6. Relatório e entrega

Reporte, sem embelezar:

- o que foi somado (agentes, tools, arquivos de cenário)
- resultado dos testes e do pipeline
- **consumo de tokens medido** e se estourou o teto de 8.000/min
- se o artefato gerado validou
- **qualquer defeito que apareceu ao rodar** — é o material mais valioso do README, e some se não for anotado agora

Não escreva o README aqui. Ele sai de `/finaliza-projeto $ARGUMENTS`, que faz README + índice raiz + commits.

## O que esta skill deliberadamente NÃO faz

**Não gera os Aprendizados.** Essa seção é o que distingue os READMEs desta trilha, e ela nasce de rodar o código e reparar em coisas: uma tool que afirma ter validado o que não validou, um guardrail de prompt que o código já tornou impossível violar, um diagnóstico roteirizado que contradiz o cenário aplicado no cluster. Script nenhum produz isso — e um que fingisse produzir entregaria texto genérico no lugar do que tem valor.

**Não prepara várias aulas de uma vez.** `NNN` herda o estado *final* de `NNN-1`, correções inclusive. Preparar 005–012 hoje congelaria todas no estado atual: uma correção feita durante a aula 005 não chegaria às sete seguintes. Rode este comando ao começar cada aula, não antes.
