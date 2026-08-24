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
echo "=== arquivos que o lab referencia (literais e os.path.join) ==="
python3 - "$LAB" <<'ARQUIVOS'
import ast, re, sys
fonte = open(sys.argv[1]).read()
arvore = ast.parse(fonte)
EXT = r"(?:ya?ml|json|md|tf|txt|csv)"

def texto(n):
    """Literal do no, com {campo} onde ha interpolacao de f-string."""
    if isinstance(n, ast.Constant) and isinstance(n.value, str):
        return n.value
    if isinstance(n, ast.JoinedStr):
        return "".join(texto(x) if isinstance(x, ast.Constant)
                       else "{" + ast.unparse(x.value) + "}" for x in n.values)
    return None

montados = set()
for n in ast.walk(arvore):
    if isinstance(n, ast.Call) and ast.unparse(n.func).endswith("path.join"):
        cs = [t for a in n.args if (t := texto(a)) is not None]
        if cs and re.search(rf"\.{EXT}$", cs[-1]):
            montados.add("/".join(cs))

citados = set(re.findall(rf"\w[\w.-]*\.{EXT}\b", fonte))
citados -= {c.rsplit("/", 1)[-1] for c in montados}

print("  -- caminho montado no codigo (ENTRADA do pipeline, traga o arquivo):")
for a in sorted(montados) or ["(nenhum)"]: print("      ", a)
print("  -- nome citado na prosa dos prompts (costuma ser SAIDA do agente):")
for a in sorted(citados) or ["(nenhum)"]: print("      ", a)
ARQUIVOS
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

# Todo lab traz `PROJECT_ROOT = dirname(__file__)/".."`, que só vale no layout
# `labs/` do gabarito. Aqui o entrypoint fica na raiz da aula, então isso aponta
# para `projects/` -- e vai para a POSIÇÃO 0 do sys.path, à frente do diretório
# certo. Ficou latente até a 007 usar a variável para montar caminho de arquivo.
python3 - "$ENTRYPOINT" <<'RAIZ'
import pathlib, sys
p = pathlib.Path(sys.argv[1]); s = p.read_text()
ANTIGO = """# Ensure project root is in the Python path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))"""
NOVO = """# Raiz do projeto: nesta trilha o entrypoint fica na raiz da aula, não em labs/
PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))"""
if ANTIGO in s:
    p.write_text(s.replace(ANTIGO, NOVO)); print("PROJECT_ROOT corrigido")
elif "os.path.dirname(os.path.abspath(__file__))" in s:
    print("PROJECT_ROOT ja estava certo")
elif "PROJECT_ROOT" in s:
    sys.exit("PARE: o lab define PROJECT_ROOT de um jeito novo -- confira a mao")
else:
    print("este lab nao usa PROJECT_ROOT")
RAIZ
```

Depois limpe os arquivos de dados herdados. O teste **não** é entrada vs. saída — é **alguma coisa nesta pasta lê este arquivo?** O entrypoint da aula anterior acabou de ser apagado, então o fixture que só ele consumia ficou órfão, exatamente como o artefato que só ele gerava. `tools/`, `core/` e `tests/` são o acervo da trilha e ficam por definição; `data/` e os artefatos da raiz, não.

```bash
{ find . -maxdepth 1 -type f \( -name '*.tf' -o -name '*.yaml' -o -name '*.yml' -o -name '*.json' \)
  find data -type f 2>/dev/null; } | while read -r f; do      # find, nao glob: no zsh, `ls *.tf` sem match aborta
  n=$(basename "$f")
  if grep -q "$n" "$ENTRYPOINT"; then
    echo "  USA    $f"
  else
    outros=$(grep -rl --include='*.py' "$n" . | grep -vx "./$ENTRYPOINT" | tr '\n' ' ')
    echo "  ORFAO  $f   <- $ENTRYPOINT nao cita; ${outros:-nenhum outro .py tampouco}"
  fi
done
```

Apague os `ORFAO`. Duas armadilhas que essa checagem já pegou:

- o `ls` da raiz sozinho não enxergava `data/` — foi assim que o `data/trivy.json` da 007 sobreviveu à preparação da 008;
- procurar o nome em **todos** os `.py` dá falso negativo: `tools/file_writer.py` e `tools/security_scan.py` trazem `main.tf` como **valor default de argumento**, então o acervo herdado sempre cita os artefatos das aulas velhas. Por isso a busca é no entrypoint, e os outros `.py` que citam o arquivo saem na linha só como informação.

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

> ⛔ **Nunca copie `core/llm_config.py` do gabarito, e nunca copie `core/` inteiro.**
> O do gabarito é `LLM(model="groq/llama-3.1-8b-instant")` puro: o modelo foi retirado
> do catálogo da Groq (a API responde `model_not_found`), e não há `RateLimitAwareLLM`,
> nem leitura de `GROQ_MODEL`. Trazê-lo quebra a
> aula e reintroduz problemas já resolvidos. O `llm_config.py` correto vem do `cp -R`
> da aula anterior, no passo 2 — só `core/agents.py` (fábricas avulsas) e `tools/*.py`
> saem do gabarito. Mesma regra para qualquer lab que faça `from core.llm_config import
> nexus_llm` (é o caso do `modulo11_guardrails.py`): ele **importa**, não redefine.

Confirme que o runtime herdado sobreviveu antes de seguir:

```bash
grep -q 'GROQ_MODEL' core/llm_config.py && grep -q 'RateLimitAwareLLM' core/llm_config.py \
  && echo "OK: llm_config e o da trilha" \
  || echo "ERRO: llm_config foi sobrescrito pelo gabarito -- restaure do projeto anterior"
```

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

Depois, meça o custo. O free tier da Groq impõe **dois** limites, e o segundo não aparece nos headers da API — só no corpo do erro 429:

| Limite | Valor | Observação |
|---|---|---|
| TPM — tokens por minuto | 8.000 | exposto em `x-ratelimit-limit-tokens` |
| **TPD — tokens por dia** | **200.000** | **invisível nos headers**, por modelo |
| RPM — requisições por minuto | 1.000 | raramente é o gargalo |

E um detalhe contraintuitivo: **não cape `max_tokens`.** O que consome orçamento é o consumo real, não o teto pedido — medido na API: `max_tokens=60000` passa num modelo com teto de 8.000 tokens/minuto (debitando os 113 tokens gerados), e 12 chamadas com `max_tokens=20000` passam contra o teto de 200.000/dia. O `Requested = prompt + max_tokens` que aparece no erro 429 é só a **checagem de admissão** contra o saldo restante, não o valor debitado. Capar, portanto, não economiza nada: só faz a chamada ser recusada mais cedo quando o saldo diário está no fim, e arrisca truncar a resposta. Por isso `core/llm_config.py` não passa `max_tokens`.

O modelo padrão é `groq/qwen/qwen3.6-27b`, que mantém todas as aulas abaixo do teto. Se ele sair do catálogo (é "Preview"), troque via `GROQ_MODEL` no `.env` — não edite os cinco `llm_config.py`. O `RateLimitAwareLLM` segura o pipeline pausando quando o limite bate, mas o número medido precisa entrar no README.

> ⚠️ **Medir custo queima a cota diária — planeje isso.** Cada execução do pipeline gasta milhares de tokens, e o teto é de 200.000 por dia. Meia dúzia de execuções repetidas para estabilizar um número esgota o orçamento do modelo e **trava a validação da aula pelo resto do dia**. Duas defesas, nesta ordem:
>
> 1. **Meça no modelo padrão, itere em outro.** A cota é contada **por modelo**: `GROQ_MODEL=groq/openai/gpt-oss-120b` dá um orçamento zerado e independente. Guarde a cota do padrão para o run final, que é o que vai para o README.
> 2. **Cheque o saldo antes de uma bateria de runs.** Um 429 revela o quanto já foi usado:
>
> ```bash
> curl -s https://api.groq.com/openai/v1/chat/completions \
>   -H "Authorization: Bearer $GROQ_API_KEY" -H "Content-Type: application/json" \
>   -d '{"model":"qwen/qwen3.6-27b","messages":[{"role":"user","content":"oi"}]}' \
>   | grep -o '"message":"[^"]*"' | head -1     # sem saída = cota disponível
> ```
>
> Se o pipeline parar dizendo que a Groq pediu **minutos** de espera, é cota diária: esperar não resolve, troque o modelo.

> ⚠️ **Ao comparar duas configurações, nunca rode os blocos em sequência.** TPM e TPD são recursos que se esgotam, então quem roda depois sempre parece pior — e a conclusão sai invertida. Foi assim que a aula 005 quase adotou um `max_tokens` capado com base num teste que não media nada. Rode cada bloco com o orçamento no mesmo estado (cooldown antes de cada um) e **repita com a ordem invertida**: se o resultado acompanhar a ordem em vez da configuração, o teste está medindo depleção, não a variável.

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
    print(f"\nchamadas={len(C)} total_real={sum(t for _, t in C)} pior_janela_60s={pior} (teto TPM 8000)")
    # O TPD (200.000/dia, por modelo) e debitado pelo consumo REAL:
    total = sum(t for _, t in C)
    print(f"execucoes que cabem no teto diario de 200000: ~{200000 // max(total, 1)}")
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
- **consumo de tokens medido** (real e reservado), se estourou o teto de 8.000/min e quantas execuções cabem nos 200.000/dia
- se o artefato gerado validou
- **qualquer defeito que apareceu ao rodar** — é o material mais valioso do README, e some se não for anotado agora

Não escreva o README aqui. Ele sai de `/finaliza-projeto $ARGUMENTS`, que faz README + índice raiz + commits.

## O que esta skill deliberadamente NÃO faz

**Não gera os Aprendizados.** Essa seção é o que distingue os READMEs desta trilha, e ela nasce de rodar o código e reparar em coisas: uma tool que afirma ter validado o que não validou, um guardrail de prompt que o código já tornou impossível violar, um diagnóstico roteirizado que contradiz o cenário aplicado no cluster. Script nenhum produz isso — e um que fingisse produzir entregaria texto genérico no lugar do que tem valor.

**Não prepara várias aulas de uma vez.** `NNN` herda o estado *final* de `NNN-1`, correções inclusive. Preparar 005–012 hoje congelaria todas no estado atual: uma correção feita durante a aula 005 não chegaria às sete seguintes. Rode este comando ao começar cada aula, não antes.
