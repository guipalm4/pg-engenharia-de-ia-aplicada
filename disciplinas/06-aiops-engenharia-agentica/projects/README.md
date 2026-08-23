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
├── 003-orquestracao-sre-assistida-por-ia/     # + agente SRE, manifestos K8s, GitOps
│   ├── pyproject.toml
│   ├── tests/          # helpers de decisão (uv run pytest)
│   └── k8s_ops.py      # entrypoint
├── 004-reduzindo-mttr-com-inteligencia-agentica/  # + SRE on-call, ReAct, observabilidade
│   ├── pyproject.toml
│   ├── tests/
│   └── troubleshooting.py  # entrypoint
├── 005-observabilidade-preditiva/             # + AIOps: NL→PromQL, predição, dashboard
│   ├── pyproject.toml
│   ├── tests/
│   ├── aiops.py                    # entrypoint
│   └── incident_dashboard.json     # artefato GERADO pelo agente
└── 006-chatops-e-human-in-the-loop/           # + ChatOps, aprovação humana, UI Streamlit
    ├── pyproject.toml
    ├── tests/
    └── chatops.py         # entrypoint STREAMLIT — não roda com `uv run chatops.py`
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
cd 004-reduzindo-mttr-com-inteligencia-agentica && uv run troubleshooting.py
cd 005-observabilidade-preditiva                && uv run aiops.py
```

**A aula 006 é a exceção:** o entrypoint é um app [Streamlit](https://streamlit.io/), não um script.

```bash
cd 006-chatops-e-human-in-the-loop && uv run streamlit run chatops.py   # http://localhost:8501
```

`uv run chatops.py` não levanta nada útil — fora do runtime do Streamlit, `st.chat_input()` devolve
`None` e o script termina em silêncio. E rodar de fora do workspace dá `error: Failed to spawn:
streamlit`, que parece dependência faltando mas é diretório errado (sem `pyproject.toml` para
resolver, o uv usa um ambiente efêmero). Na primeira execução o Streamlit pede um e-mail: **Enter**
com o campo vazio segue adiante.

As aulas 003 a 006 têm testes (não precisam de cluster nem de API key):

```bash
cd 003-orquestracao-sre-assistida-por-ia        && uv run pytest
cd 004-reduzindo-mttr-com-inteligencia-agentica && uv run pytest
cd 005-observabilidade-preditiva                && uv run pytest
cd 006-chatops-e-human-in-the-loop              && uv run pytest
```

Consumo medido por execução:

| Aula | Tokens | Modelo da medição | Observação |
|---|---|---|---|
| 004 | ~8.900 | `gpt-oss-20b` (padrão à época) | a mais cara da trilha — bate no teto de 8.000/minuto por causa do `allow_delegation=True` do SRE de plantão; o `RateLimitAwareLLM` pausa e o run leva ~70s em vez de ~3s |
| 005 | 1.900 – 3.500 | `qwen/qwen3.6-27b` (padrão atual) | 4 chamadas ao LLM, ~7s |
| 006 | ~1.150 **por mensagem** | `qwen/qwen3.6-27b` (padrão atual) | cada mensagem no chat é uma execução independente; ~170 mensagens cabem no teto diário |

As aulas 001 a 003 não têm medição registrada. A 004 não foi remedida depois da troca de modelo — o
número serve para situá-la como a mais pesada, não para comparar com as duas seguintes.

O `uv run` descobre o workspace, garante que o `.venv` está sincronizado com o lock e executa. O CWD fica na pasta da aula — é assim que `import core.agents` e `import tools.policy_rag` resolvem para a versão *daquela* aula.

Para rodar um CLI instalado como dependência (ex.: o Checkov da aula 002):

```bash
uv run checkov -f main.tf --quiet --compact
```

### ⚠️ Modelo e limites do free tier

**O modelo não está fixo no código.** O material original usava `groq/llama-3.1-8b-instant`, que a Groq
**retirou do catálogo** — a API responde `model_not_found` e nenhuma aula roda. A Groq também
descontinuou `qwen/qwen3-32b` e `qwen-qwq-32b` desde então. Por isso o modelo vem de `GROQ_MODEL` no
`.env`, com default `groq/qwen/qwen3.6-27b`: quando o próximo sair do catálogo, é **uma linha trocada**
em vez de seis `llm_config.py` editados.

O default é catálogo *Preview* (pode ser descontinuado sem aviso) e a escolha foi consciente: é o único
que mantém **todas** as aulas abaixo do teto por minuto — o `gpt-oss-120b` estoura na 002 e na 004.

**São dois limites, e o segundo não aparece nos headers da API:**

| Limite | Valor | Onde aparece |
|---|---|---|
| TPM — tokens por minuto | 8.000 | `x-ratelimit-limit-tokens` |
| **TPD — tokens por dia** | **200.000** | **invisível nos headers** — só no corpo do erro 429, e contado **por modelo** |

As três armadilhas, todas resolvidas em `core/llm_config.py`:

| Sintoma | Causa | O que o código faz |
|---|---|---|
| `model_not_found` | a Groq retirou o modelo do catálogo | modelo lido de `GROQ_MODEL`; troque no `.env` |
| `RateLimitError` pedindo **segundos** | teto de 8.000 tokens/minuto | `RateLimitAwareLLM` lê o tempo pedido e repete, até 6 tentativas |
| `RateLimitError` pedindo **minutos** | teto diário esgotado **naquele modelo** | acima de 180s ele desiste na hora e instrui a trocar `GROQ_MODEL` — esperar não resolve |

**Por que existe uma subclasse de `LLM`.** O limite é por *uso real acumulado* (`Limit 8000, Used 6801,
Requested 6299`), então rodar a mesma aula duas vezes dentro de um minuto derruba o pipeline no meio de
uma task. O caminho óbvio — `num_retries` do litellm — **não funciona**: ele não faz retry de
`RateLimitError` em `completion()`, desiste em 0,4s sem esperar. `RateLimitAwareLLM` lê o tempo da
própria mensagem da Groq e espera. O parser entende duração composta (`38.25s`, `3m9.648s`, `547ms`) —
uma versão anterior só entendia segundos puros e caía num chute de 35s quando a Groq pedia 7 minutos,
matando o pipeline depois de esperar em vão.

Se você vir `⏳ Limite de tokens da Groq atingido`, é a proteção funcionando — não é erro.

> **`max_tokens` fica aberto de propósito.** Uma versão anterior capava em 4.096 para "economizar
> orçamento". Medido na API, o que é debitado é o **consumo real**, não o teto pedido: `max_tokens=60000`
> passa num modelo com teto de 8.000/minuto, debitando os 113 tokens gerados. O `Requested = prompt +
> max_tokens` do erro 429 é a checagem de **admissão** contra o saldo, não o valor cobrado. Capar não
> economizava nada e só arriscava truncar a resposta.

> **A cota diária é por modelo — e essa é a saída de emergência.** Com o padrão esgotado,
> `GROQ_MODEL=groq/openai/gpt-oss-120b` no `.env` destrava o laboratório na hora, com orçamento zerado.

### Pré-requisitos externos por aula

| Aula | Precisa além do `uv sync` |
|---|---|
| 001 | `GROQ_API_KEY` |
| 002 | `GROQ_API_KEY` — o Checkov vem como dependência Python, não precisa instalar à parte |
| 003 | `GROQ_API_KEY` + `kubectl` apontando para um cluster descartável (opcional: `K8S_ALLOWED_CONTEXTS`) |
| 004 | `GROQ_API_KEY`; `kubectl` só para reproduzir o incidente (`checkout-broken.yaml`) — o pipeline roda sem cluster |
| 005 | `GROQ_API_KEY` |
| 006 | `GROQ_API_KEY` — a UI é local (`streamlit`), sem Slack nem serviço externo |

> ⚠️ **Aula 003:** a tool `apply_k8s_manifest` executa `kubectl apply` de verdade, então ela só aceita contextos que casem com uma **allowlist** de clusters descartáveis — `kind-*`, `k3d-*`, `minikube`, `docker-desktop`, `rancher-desktop`, `orbstack`, `colima`. Um kind local funciona sem configurar nada; qualquer outro contexto é bloqueado antes de qualquer chamada ao cluster. Para autorizar outro, passe `K8S_ALLOWED_CONTEXTS="kind-*,meu-cluster"`. Sem `kubectl` no PATH, ou com o cluster fora do ar, ela cai em simulação e não toca em nada.

---

## ➕ Adicionando uma aula nova

Cada aula `NNN` sai do lab `moduloN_*.py` do repositório gabarito e herda o estado **final** da aula `NNN-1`. Use a skill, que faz todo o mecânico e mede o custo:

```
/nova-aula 007-slug-descritivo
```

Ela copia a aula anterior, traz o lab como entrypoint (o nome é sempre o sufixo do lab), soma só os agentes e tools que o lab importa, ajusta o `name` do `pyproject`, roda o pipeline e mede o consumo de tokens. Depois, `/finaliza-projeto` escreve o README e commita.

> **Rode uma aula por vez, ao começar cada uma.** Preparar várias de antemão congela todas no estado atual: uma correção feita durante a aula 005 não chegaria às seguintes — e correções nascidas no meio da aula já são rotina nesta trilha (o `write_file` que corrompia YAML, o `RateLimitAwareLLM`, a troca do modelo retirado da Groq, o parser de duração composta, o `max_tokens` destravado).

No braço, se precisar:

```bash
cp -r 006-chatops-e-human-in-the-loop 007-nome-da-aula
# ajuste o campo `name` no 007-nome-da-aula/pyproject.toml — nome duplicado quebra o workspace
uv sync --all-packages     # o membro é descoberto pelo glob "0*-*" da raiz
```

Precisou de uma biblioteca nova? Rode dentro da pasta da aula — ela entra só no `pyproject.toml` daquele membro e no lock compartilhado:

```bash
cd 007-nome-da-aula && uv add kubernetes
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
