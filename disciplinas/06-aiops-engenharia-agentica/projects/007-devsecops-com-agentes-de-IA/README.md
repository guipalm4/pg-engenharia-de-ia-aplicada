# Exemplo 007 — DevSecOps com Agentes de IA

> Um agente de segurança lê um relatório de scan de container, filtra o ruído e escreve o parecer executivo sobre o backdoor da `xz` — sem receber nenhum dos dados que uma triagem de vulnerabilidade exige.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Um agente com o papel de *Analista de DevSecOps* recebe um relatório de scan de vulnerabilidades de uma imagem de container e produz um parecer executivo: o que exige ação hoje, o que é ruído, e qual o plano imediato. O relatório contém três CVEs de severidades diferentes, e a mais grave é a **CVE-2024-3094** — o backdoor plantado no *upstream* da biblioteca `xz`, um ataque de cadeia de suprimentos que não se trata como as falhas de código ao lado dele.

O trabalho que o exercício automatiza é a **triagem**: a distância entre "o scanner achou 3 CVEs" e "uma delas exige ação hoje". É o gargalo real de qualquer esteira de segurança — scanners produzem volume, e quase todo o custo humano está em separar o explorável do teórico. O `goal` do agente diz exatamente isso: *"triar vulnerabilidades reais e eliminar falsos positivos, priorizando o que é explorável"*.

O pipeline é o mais simples da disciplina: um agente, uma task, uma ferramenta — sem delegação, ciclo ReAct ou segunda passagem de revisão. O que torna o exercício interessante não é a orquestração, e sim o tipo de produto: um **julgamento**. Um `main.tf` pode ser validado pelo Checkov; um manifesto Kubernetes, pelo API server; um parecer em prosa não tem validador.

O Trivy em si não entra: `data/trivy.json` é um fixture (que nem segue o schema real do scanner), `analyze_trivy_report` é um `json.load`, e nenhuma ação corretiva é aplicada — o parecer é texto e o pipeline termina sem erro em 100% das execuções porque nada de perigoso é feito.

**O que esta aula acrescenta à trilha:** `get_devsecops_agent` (7º papel), `devsecops.py` com a tool `analyze_trivy_report` declarada inline, e `data/trivy.json` — a primeira **entrada** de arquivo da trilha.

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

Funcionando, o terminal mostra o painel `🤖 Agent Started`, a linha `Tool analyze_trivy_report executed with result: {'ArtifactName': 'python:3.11-slim', ...}` e o painel `✅ Agent Final Answer` com o parecer em Markdown. Roda em ~10s, não escreve nada em disco, e `uv run pytest -v` reporta **41 passed**.

Entre execuções, o que se repete é a CVE-2024-3094 como ameaça crítica com plano de ação prioritário; o texto do parecer e a **classificação das outras duas CVEs** mudam — a mesma CVE-2023-45853 já foi chamada de "baixa/média" e de "HIGH com risco baixo em ambiente containerizado". O que se reproduz é o comportamento, não o texto.

> ⚠️ O painel do CrewAI **trunca** o parecer no terminal e o entrypoint descarta o retorno de `kickoff()`: o relatório completo não é visível em nenhuma execução.

## Estrutura do Projeto

```
007-devsecops-com-agentes-de-IA/
├── devsecops.py                  # entrypoint — e também onde vive a tool desta aula
│                                 #   @tool("analyze_trivy_report") declarada inline
├── data/
│   └── trivy.json                # entrada do pipeline (fixture, não é o formato real do Trivy)
├── core/
│   ├── agents.py                 # + get_devsecops_agent()  ← novo papel (o 7º da trilha)
│   └── llm_config.py             # Groq + RateLimitAwareLLM — herdado, intocado
├── tools/                        # 8 tools herdadas das aulas 001–006
│                                 #   NENHUMA é usada neste pipeline
├── tests/                        # 41 testes herdados das aulas 003–005
└── pyproject.toml                # − streamlit (a 006 era a única a precisar dele)
```

> `tools/security_scan.py`, herdado da 002, merece um olhar: aquela aula também tinha uma camada de segurança, mas rodava o **Checkov de verdade** por `subprocess`. A 007 tem "DevSecOps" no nome do agente e nenhum scanner no processo.

## Como funciona

```
uv run devsecops.py
   │
   ├─ PROJECT_ROOT = dirname(abspath(__file__))        ← a aula onde isso passou a importar
   ├─ trivy_report_path = PROJECT_ROOT/data/trivy.json ← caminho calculado em PYTHON
   │
   ├─ @tool("analyze_trivy_report")
   │      def analyze_trivy_report(file_path: str) -> dict:
   │          return json.load(open(file_path))        ← é literalmente isso
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
            ├─ o LLM classifica: o que é backdoor ativo, o que é ruído
            │        └─ sem CVSS, sem vetor de ataque, sem VendorSeverity no input
            │                 → a lacuna é preenchida com o conhecimento prévio do modelo
            │
            └─ retorno de kickoff() ── DESCARTADO ──✗
                     └─ o painel do CrewAI imprime uma versão TRUNCADA
```

O caminho do arquivo faz um desvio curioso: é calculado deterministicamente em Python, convertido em texto no prompt, e precisa voltar para o código pela transcrição do modelo. Entre os dois pontos determinísticos há uma etapa probabilística que não precisava existir.

## Conceitos trabalhados

- [x] **Triagem de vulnerabilidades** — a diferença entre "o scanner achou 3 CVEs" e "uma delas exige ação hoje"
- [x] **Supply chain attack** — a CVE-2024-3094 não é uma falha de código, é código malicioso plantado no upstream, e por isso não se trata como as outras
- [x] **Falso positivo vs. explorabilidade** — severidade nominal não é risco; separar os dois é o `goal` do agente
- [x] **Agente como consumidor de artefato** — o pipeline recebe a saída de outra ferramenta em vez de gerar a sua
- [x] **Tool declarada inline** — `@tool` no entrypoint em vez de módulo em `tools/`, e o que isso muda para quem lê o projeto
- [x] **Argumentos de tool decididos pelo LLM** — a assinatura `(file_path: str)` transfere ao modelo uma decisão que o código já tinha tomado
- [x] **Contexto vs. parâmetros do modelo** — o parecer mistura o que estava no JSON com o que o modelo sabe da internet, sem distinguir os dois
- [x] **Validação de entrada em pipelines de dados** — o que acontece quando nada checa se o arquivo recebido é o que se espera

## Aprendizados

- [x] Código de caminho copiado entre layouts diferentes sobrevive sem fazer nada até o dia em que faz: o `PROJECT_ROOT` com `".."` herdado do material só quebrou quando passou a montar caminho de arquivo
- [x] Quando a tool recebe o caminho como argumento, **qual arquivo será aberto é decisão do modelo** — fechar sobre a constante do módulo devolve essa escolha ao código
- [x] O primeiro trabalho de um auditor é desconfiar da evidência: o agente processou sem ressalva um fixture que não bate com o schema do Trivy e uma CVE de ID impossível (`CVE-2022-123`, 3 dígitos)
- [x] Triagem de explorabilidade exige vetor de ataque, privilégio e CVSS; com um JSON que só traz `Severity` o modelo preenche a lacuna, e como o `goal` manda eliminar falsos positivos, o viés vai para dispensar
- [x] Sem citação da evidência, o parecer mistura o que veio do scan com o que veio dos pesos do modelo no mesmo tom e na mesma tabela
- [x] Quando a única saída é o console, o painel do CrewAI trunca o entregável — vale capturar o retorno de `crew.kickoff()` ou gravar em disco

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
