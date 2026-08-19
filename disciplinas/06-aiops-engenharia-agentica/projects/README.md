# 🤖 AI-Ops e Engenharia Agêntica

Projetos da disciplina **AI-Ops e Engenharia Agêntica** — Pós-Graduação em Engenharia de IA Aplicada, UniPDS.

Cada pasta `00X-*` é um **snapshot do mesmo projeto** em um ponto da trilha: o pipeline de agentes da Nexus vai ganhando agentes, tools e camadas de governança a cada aula. Por isso `core/` e `tools/` se repetem entre as pastas — a duplicação é proposital, permite abrir a aula 001 e a 003 lado a lado e ver o delta.

O que **não** é duplicado é o ambiente Python: todos os projetos compartilham um único `.venv`, gerenciado por [uv](https://docs.astral.sh/uv/) em modo *workspace*.

---

## 📂 Estrutura

```bash
projects/
├── pyproject.toml      # raiz do workspace uv (não é pacote, só agrupa os membros)
├── .python-version     # 3.12.11 — o uv baixa e usa automaticamente
├── uv.lock             # lockfile compartilhado (versionado)
├── .venv/              # ambiente ÚNICO para todos os projetos (gerado, ignorado)
├── .env                # GROQ_API_KEY — único para todos os projetos (ignorado)
├── .env.example        # template do .env
│
├── 001-da-automacao-a-inteligencia-agentica/   # 1 agente + tool de compliance (RAG stub)
│   ├── pyproject.toml  # dependências desta aula
│   └── foundation.py   # entrypoint
├── 002-geracao-auditoria-e-self-healing-com-IA/  # + auditor, Checkov, OPA, self-healing
│   ├── pyproject.toml
│   └── iac_copilot.py  # entrypoint
└── 003-orquestracao-sre-assistida-por-ia/     # + agente SRE, manifestos K8s, GitOps
    ├── pyproject.toml
    ├── tests/          # helpers de decisão (uv run pytest)
    └── k8s_ops.py      # entrypoint
```

---

## ⚙️ Setup (uma vez)

**Pré-requisito único:** [uv](https://docs.astral.sh/uv/getting-started/installation/). Ele cuida do Python — não é preciso asdf, pyenv ou Homebrew para isso.

```bash
# instalar o uv, se ainda não tiver
curl -LsSf https://astral.sh/uv/install.sh | sh

cd disciplinas/06-aiops-engenharia-agentica/projects

# 1. chave da Groq (https://console.groq.com/keys)
cp .env.example .env && $EDITOR .env

# 2. criar o ambiente com TODAS as dependências de TODAS as aulas
uv sync --all-packages
```

O `uv sync` baixa o Python 3.12.11 se necessário, cria o `.venv` na raiz de `projects/` e instala tudo. Leva ~10s numa máquina com o cache quente.

---

## ▶️ Como executar

Entre na pasta da aula e use `uv run`. **Não** existe `activate`, `source` nem `pip install`:

```bash
cd 001-da-automacao-a-inteligencia-agentica && uv run foundation.py
cd 002-geracao-auditoria-e-self-healing-com-IA && uv run iac_copilot.py
cd 003-orquestracao-sre-assistida-por-ia      && uv run k8s_ops.py
```

A aula 003 tem testes dos helpers de decisão (não precisam de cluster nem de API key):

```bash
cd 003-orquestracao-sre-assistida-por-ia && uv run pytest
```

O `uv run` descobre o workspace, garante que o `.venv` está sincronizado com o lock e executa. O CWD fica na pasta da aula — é assim que `import core.agents` e `import tools.policy_rag` resolvem para a versão *daquela* aula.

Para rodar um CLI instalado como dependência (ex.: o Checkov da aula 002):

```bash
uv run checkov -f main.tf --quiet --compact
```

### ⚠️ Modelo e limites do free tier

O material original usava `groq/llama-3.1-8b-instant`, que **foi retirado do catálogo da Groq** — a API responde `model_not_found` e nenhuma das três aulas roda. As aulas usam agora `groq/openai/gpt-oss-20b`, o menor modelo de uso geral disponível com tool calling.

Duas armadilhas do free tier, ambas já resolvidas em `core/llm_config.py`:

| Sintoma | Causa | O que o código faz |
|---|---|---|
| `tool_use_failed: Failed to parse tool call arguments as JSON` | O `gpt-oss` é modelo de raciocínio: no esforço padrão gasta o orçamento de saída pensando e trunca o JSON do tool call no meio | `reasoning_effort="low"` — derruba o raciocínio para ~10 tokens |
| `rate_limit_exceeded` | O free tier permite **8.000 tokens/minuto**; pedir `max_tokens` acima disso é recusado de saída | `max_tokens=4096`, folgado para os artefatos das aulas (~900 tokens) |

Rodar as três aulas em sequência pode esbarrar no limite por minuto — se acontecer, espere um minuto e repita.

### Pré-requisitos externos por aula

| Aula | Precisa além do `uv sync` |
|---|---|
| 001 | `GROQ_API_KEY` |
| 002 | `GROQ_API_KEY` — o Checkov vem como dependência Python, não precisa instalar à parte |
| 003 | `GROQ_API_KEY` + `kubectl` apontando para um cluster descartável (opcional: `K8S_ALLOWED_CONTEXTS`) |

> ⚠️ **Aula 003:** a tool `apply_k8s_manifest` executa `kubectl apply` de verdade, então ela só aceita contextos que casem com uma **allowlist** de clusters descartáveis — `kind-*`, `k3d-*`, `minikube`, `docker-desktop`, `rancher-desktop`, `orbstack`, `colima`. Um kind local funciona sem configurar nada; qualquer outro contexto é bloqueado antes de qualquer chamada ao cluster. Para autorizar outro, passe `K8S_ALLOWED_CONTEXTS="kind-*,meu-cluster"`. Sem `kubectl` no PATH, ou com o cluster fora do ar, ela cai em simulação e não toca em nada.

---

## ➕ Adicionando uma aula nova

```bash
cp -r 003-orquestracao-sre-assistida-por-ia 004-nome-da-aula
# ajuste o campo `name` no 004-nome-da-aula/pyproject.toml
uv sync --all-packages     # o membro é descoberto pelo glob "0*-*" da raiz
```

Precisou de uma biblioteca nova? Rode dentro da pasta da aula — ela entra só no `pyproject.toml` daquele membro e no lock compartilhado:

```bash
cd 004-nome-da-aula && uv add kubernetes
```

---

## 🧰 Por que workspace com `.venv` único

Cada aula é o mesmo projeto crescendo, e as dependências são cumulativas — `crewai`, `litellm` e `checkov` são as mesmas em 002 e 003. Um venv por pasta significava ~1 GB e vários minutos de instalação por aula, mais um interpretador diferente para selecionar no VSCode a cada troca de pasta.

Os membros são **virtuais** (sem `[build-system]` no `pyproject.toml`): o uv instala as dependências deles no ambiente compartilhado, mas não tenta buildar as pastas como pacotes — não é preciso `__init__.py`, `src/` nem nada de empacotamento.

**Se um dia duas aulas conflitarem** (uma lib nova incompatível com a versão que uma aula antiga fixa), a saída é tirar aquela aula do workspace: adicione `exclude = ["00X-*"]` em `[tool.uv.workspace]` e rode `uv venv && uv sync` dentro da pasta dela. Com o cache do uv isso custa segundos e quase nada de disco.

### ⚠️ Cuidado com `uv sync` dentro da pasta de uma aula

O alvo do `uv sync` depende de onde você o executa:

| Onde | Efeito |
|---|---|
| na **raiz** de `projects/` | sincroniza todas as aulas ✅ |
| **dentro** de uma aula | sincroniza só aquela — e **desinstala** do `.venv` as libs que as outras precisam ⚠️ |

Rodar `uv sync` dentro de `001-*` remove o `checkov` do ambiente (a aula 001 não o declara) e quebra a 002 e a 003 até o próximo `uv sync --all-packages`.

**Regra:** dentro da pasta de uma aula, use apenas `uv run` e `uv add` — nenhum dos dois poda o ambiente. Para sincronizar, volte para a raiz.

O lado útil desse comportamento: `uv sync --package aula-001-da-automacao-a-inteligencia-agentica` na raiz poda o `.venv` para exatamente as dependências declaradas por aquela aula, o que serve para conferir se ela roda sem carona das outras. Depois, `uv sync --all-packages` restaura em segundos.

### Onde ficam as dependências

Não há `requirements.txt`. A fonte da verdade é o `pyproject.toml` de cada aula (o que foi declarado) e o `uv.lock` compartilhado (as versões exatas resolvidas). Ambos são atualizados pelo `uv add` — não edite o lock à mão.

### Comandos úteis

```bash
uv sync --all-packages          # sincroniza o ambiente com o lock (rode na raiz)
uv lock --upgrade               # atualiza as versões dentro das restrições
uv tree                         # árvore de dependências
uv run python -c "import sys; print(sys.prefix)"   # confirma qual venv está em uso

# gerar um requirements.txt (ex.: para comparar com o material da professora)
uv export --no-hashes --format requirements-txt --package aula-002-geracao-auditoria-e-self-healing-com-ia
```

---

## 💻 VSCode

Abra **`06-aiops-engenharia-agentica`** (a da disciplina) ou **`projects/`** — há um `.vscode/settings.json` para cada caso, e ambos apontam o interpretador para o `.venv` compartilhado. Nada a selecionar manualmente ao trocar de aula.

Não abra a pasta de uma aula isolada: o `.venv` fica um nível acima e o VSCode não o encontraria sozinho.

> Se a extensão Python sugerir habilitar `python.terminal.useEnvFile`, **recuse**. O `.env` é lido pelo próprio código (`load_dotenv()` em `core/llm_config.py`), o que funciona em `uv run`, no debugger e em qualquer terminal. Habilitar a injeção só colocaria a `GROQ_API_KEY` no ambiente de todo terminal integrado, sem ganho nenhum.

---

## 📜 Licença

Projeto para fins educacionais, parte da pós-graduação na UniPDS.
