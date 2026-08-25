# Exemplo 007 — DevSecOps com Agentes de IA

> Um agente de segurança lê um relatório de scan de container, separa o explorável do ruído e escreve o parecer executivo sobre o backdoor da `xz`.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Um agente com o papel de *Analista de DevSecOps* recebe um relatório de scan de vulnerabilidades de uma imagem de container e produz um parecer executivo: o que exige ação hoje, o que é ruído, e qual o plano imediato. O relatório contém três CVEs de severidades diferentes, e a mais grave é a **CVE-2024-3094** — o backdoor plantado no *upstream* da biblioteca `xz`, um ataque de cadeia de suprimentos que não se trata como as falhas de código ao lado dele.

O trabalho que o exercício automatiza é a **triagem**: a distância entre "o scanner achou 3 CVEs" e "uma delas exige ação hoje". É o gargalo real de qualquer esteira de segurança — scanners produzem volume, e quase todo o custo humano está em separar o explorável do teórico. O `goal` do agente diz exatamente isso: *"triar vulnerabilidades reais e eliminar falsos positivos, priorizando o que é explorável"*.

O pipeline é o mais simples da disciplina: um agente, uma task, uma ferramenta — sem delegação, ciclo ReAct ou segunda passagem de revisão. O que torna o exercício interessante não é a orquestração, e sim o tipo de produto: um **julgamento**. Um `main.tf` pode ser validado pelo Checkov; um manifesto Kubernetes, pelo API server; um parecer em prosa não tem validador.

O Trivy entra apenas como formato: `data/trivy.json` é um fixture, `analyze_trivy_report` é um `json.load` e nenhuma ação corretiva é aplicada — o entregável é o parecer em prosa.

Esta aula acrescenta o `get_devsecops_agent` (7º papel), o `devsecops.py` com a tool `analyze_trivy_report` declarada inline e o `data/trivy.json` — a primeira **entrada** de arquivo da trilha.

## Tecnologias e Ferramentas

- [x] **Python 3.12** — runtime dos agentes
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — orquestração `Agent`/`Task`/`Crew`
- [x] **`@tool` decorator do CrewAI** — a tool desta aula é declarada no entrypoint, não em `tools/`
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** — motor de inferência (free tier); modelo em `GROQ_MODEL`, default `qwen/qwen3.6-27b`
- [x] **Trivy** — **apenas o formato do relatório**; o binário não é instalado nem executado
- [x] **pytest** — testes dos helpers herdados
- [x] **uv (workspace)** — ambiente único compartilhado por todas as aulas da disciplina

## Pré-requisitos

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python e as dependências
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`)

> ⚠️ **O `cd` faz parte do comando.** Parar em `projects/` em vez da pasta da aula dá `ModuleNotFoundError: core`, porque os imports `core.*`/`tools.*` resolvem pelo diretório do script.

## Como executar

```bash
cd disciplinas/06-aiops-engenharia-agentica/projects

# setup (uma vez para todas as aulas)
cp .env.example .env && $EDITOR .env   # cole a GROQ_API_KEY
uv sync --all-packages

cd 007-devsecops-com-agentes-de-IA

# auditoria do relatório de scan
uv run devsecops.py

# testes (não precisam de API key)
uv run pytest -v
```

Funcionando, o terminal mostra o painel `🤖 Agent Started`, a linha `Tool analyze_trivy_report executed with result: {'ArtifactName': 'python:3.11-slim', ...}` confirmando a leitura do relatório, e o painel `✅ Agent Final Answer` com o parecer em Markdown. Nada é escrito em disco.

## Estrutura do Projeto

```
007-devsecops-com-agentes-de-IA/
├── devsecops.py                  # entrypoint — e também onde vive a tool desta aula
│                                 #   @tool("analyze_trivy_report") declarada inline
├── data/
│   └── trivy.json                # entrada do pipeline (fixture)
├── core/
│   ├── agents.py                 # + get_devsecops_agent()  ← novo papel (o 7º da trilha)
│   └── llm_config.py             # Groq + RateLimitAwareLLM — herdado, intocado
├── tools/                        # 8 tools herdadas das aulas 001–006
│                                 #   nenhuma é usada neste pipeline
├── tests/                        # testes herdados das aulas 003–005
└── pyproject.toml                # − streamlit (a 006 era a única a precisar dele)
```

> `tools/security_scan.py`, herdado da 002, é o contraponto útil: lá a camada de segurança invocava o **Checkov de verdade** por `subprocess`, sobre um artefato que o próprio pipeline tinha gerado. Aqui o scanner é anterior ao pipeline, e o agente trabalha sobre a saída dele.

## Como funciona

```
uv run devsecops.py
   │
   ├─ PROJECT_ROOT = dirname(abspath(__file__))        ← raiz da aula
   ├─ trivy_report_path = PROJECT_ROOT/data/trivy.json ← caminho calculado em PYTHON
   │
   ├─ @tool("analyze_trivy_report")
   │      def analyze_trivy_report(file_path: str) -> dict:
   │          return json.load(open(file_path))        ← lê e devolve o relatório
   │
   ├─ agent = get_devsecops_agent(tools=[analyze_trivy_report])
   │
   ├─ task = Task(description=f"Analise o relatório em '{trivy_report_path}'. ...")
   │                                                        │
   │                    o caminho absoluto entra aqui como TEXTO ────┘
   │
   └─ Crew(agents=[agent], tasks=[task]).kickoff()
            │
            ├─ o LLM lê o caminho no enunciado e o TRANSCREVE para o argumento da tool
            │        │
            │        └─ analyze_trivy_report(file_path="/Users/.../data/trivy.json")
            │                 └─ devolve o JSON INTEIRO para o contexto
            │
            └─ o LLM classifica: o que é backdoor ativo, o que é ruído
                     └─ o relatório traz `Severity`, mas não CVSS nem vetor de ataque:
                        o que falta é preenchido pelo conhecimento prévio do modelo
```

O caminho do arquivo faz um trajeto que vale reparar: é calculado deterministicamente em Python, vira texto dentro do prompt e volta ao código pela transcrição do modelo. Entre dois pontos determinísticos há uma etapa probabilística — é o preço de deixar o argumento da tool na mão do agente.

## Conceitos trabalhados

- [x] **Triagem de vulnerabilidades** — a diferença entre "o scanner achou 3 CVEs" e "uma delas exige ação hoje"
- [x] **Supply chain attack** — a CVE-2024-3094 não é uma falha de código, é código malicioso plantado no upstream, e por isso não se trata como as outras
- [x] **Falso positivo vs. explorabilidade** — severidade nominal não é risco; separar os dois é o `goal` do agente
- [x] **Agente como consumidor de artefato** — o pipeline recebe a saída de outra ferramenta em vez de gerar a sua
- [x] **Tool declarada inline** — `@tool` no entrypoint em vez de módulo em `tools/`, e o que isso muda para quem lê o projeto
- [x] **Argumentos de tool decididos pelo LLM** — a assinatura `(file_path: str)` transfere ao modelo uma decisão que o código já tinha tomado
- [x] **Contexto vs. parâmetros do modelo** — o parecer mistura o que estava no JSON com o que o modelo sabe da internet, sem distinguir os dois

## Aprendizados

- [x] Triagem é o gargalo real de uma esteira de segurança: scanners produzem volume, e quase todo o custo humano está em separar o explorável do teórico — é esse trabalho, e não o scan, que o agente automatiza
- [x] A CVE-2024-3094 (`xz`) é ataque de cadeia de suprimentos e não se trata como as falhas de código ao lado dela: a pergunta não é "qual versão corrige", é "o artefato que eu construí contém o backdoor"
- [x] Avaliar explorabilidade exige vetor de ataque, privilégio necessário e CVSS; com um relatório que só traz `Severity`, o modelo preenche a lacuna com o que sabe de fora — e um `goal` que pede para eliminar falsos positivos inclina essa lacuna para dispensar em vez de escalar
- [x] Um identificador de CVE é verificável por regex antes de qualquer consulta a base: `CVE-2022-123` tem 3 dígitos na sequência e é sintaticamente impossível desde a mudança de 2014
- [x] O primeiro trabalho de um auditor é desconfiar da procedência da evidência: sem validar o schema na entrada e sem exigir citação na saída, o parecer mistura o que veio do scan com o que veio dos pesos do modelo, no mesmo tom e na mesma tabela

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [CrewAI — Tools e o decorator `@tool`](https://docs.crewai.com/concepts/tools)
- [Trivy — JSON reporting e o schema do relatório](https://github.com/aquasecurity/trivy/blob/main/docs/guide/configuration/reporting.md)
- [Trivy — Vulnerability scanning de pacotes de SO](https://github.com/aquasecurity/trivy/blob/main/docs/guide/scanner/vulnerability.md)
- [CVE — mudança de sintaxe do identificador (mínimo de 4 dígitos)](https://cve.mitre.org/cve/identifiers/syntaxchange.html)
- [NVD — CVE-2024-3094 (backdoor na `xz`/`liblzma`)](https://nvd.nist.gov/vuln/detail/CVE-2024-3094)
- [CISA — Reported supply chain compromise affecting XZ Utils](https://www.cisa.gov/news-events/alerts/2024/03/29/reported-supply-chain-compromise-affecting-xz-utils-data-compression-library-cve-2024-3094)
- [OWASP Top 10 for LLM Applications — LLM09: Misinformation](https://genai.owasp.org/llmrisk/llm092025-misinformation/)
- [OWASP Top 10 for LLM Applications — LLM06: Excessive Agency](https://genai.owasp.org/llmrisk/llm062025-excessive-agency/)
- [FIRST — CVSS v3.1 Specification (vetor de ataque e explorabilidade)](https://www.first.org/cvss/v3-1/specification-document)
