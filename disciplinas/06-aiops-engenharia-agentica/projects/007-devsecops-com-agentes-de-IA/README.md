# Exemplo 007 — DevSecOps com Agentes de IA

> Um agente de segurança lê um relatório de scan de container, filtra o ruído e escreve o parecer executivo sobre o backdoor da `xz` — sem receber nenhum dos dados que uma triagem de vulnerabilidade exige.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

A [006](../006-chatops-e-human-in-the-loop) tirou o agente do modo script e o colocou atrás de uma interface de chat. A 007 volta ao script — `uv run devsecops.py`, começo, meio e fim —, mas inverte outra coisa: **é a primeira aula em que o agente consome um artefato produzido por outra ferramenta**. Da 002 à 005 o pipeline *gerava* (`main.tf`, manifestos Kubernetes, `incident_dashboard.json`); aqui ele recebe a saída de um scanner de segurança e devolve um julgamento.

O delta de código é o menor da trilha: um agente novo (`get_devsecops_agent`, o 7º papel) e **nenhum arquivo de tool novo**. Esta é a primeira aula em que a ferramenta é declarada com `@tool` dentro do próprio entrypoint, em vez de morar em `tools/` — um detalhe de organização que vale notar porque muda onde se procura o comportamento. Também é a primeira com um diretório `data/`: o pipeline tem uma **entrada** que não é o prompt.

O que muda de verdade é a natureza do produto. Um `main.tf` pode ser validado pelo Checkov; um manifesto Kubernetes, pelo API server (`--dry-run=server`, como na 003); um dashboard, pelo schema do Grafana. O produto desta aula é um **parecer** — prosa opinativa sobre o que é urgente e o que pode esperar. Não existe validador para isso, e é justamente onde a trilha vinha apoiando a confiança até agora. A aula pede ao agente que "elimine falsos positivos" e "priorize o que é explorável", e o exercício fica interessante quando se pergunta **com que dados** ele faria isso.

A resposta, medida, é: com dados insuficientes. O `data/trivy.json` não traz CVSS, vetor de ataque nem `VendorSeverity` — só uma string de severidade. O agente preenche a lacuna com o que sabe de fora do arquivo, e o resultado é um relatório bem escrito onde evidência e memória do modelo se misturam sem etiqueta. Os detalhes, com o que foi medido em cada caso, estão em *Aprendizados*.

## Tecnologias e Ferramentas

- [x] **Python 3.12** — runtime dos agentes
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — orquestração `Agent`/`Task`/`Crew`; um agente, uma task, uma tool
- [x] **`@tool` decorator do CrewAI** — primeira tool da trilha declarada no entrypoint, não em `tools/`
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** (`qwen/qwen3.6-27b`, trocável por `GROQ_MODEL` no `.env`) — motor de inferência (free tier)
- [x] **Trivy** — **apenas o formato do relatório**; o binário não é instalado nem executado, o `data/trivy.json` é um fixture estático
- [x] **pytest** — testes dos helpers herdados das aulas anteriores
- [x] **uv (workspace)** — ambiente único compartilhado por todas as aulas da disciplina

> A dependência `streamlit`, introduzida na 006 para o simulador de Slack, foi **removida** do `pyproject.toml`: nenhuma tool ou teste herdado a importa e não há mais entrypoint Streamlit. A trilha acumula agentes e tools de propósito; dependências, não.

## Pré-requisitos

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python e as dependências
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`)

> ⚠️ Consumo medido com o modelo padrão (`qwen/qwen3.6-27b`): **3.158 tokens em 2 chamadas ao LLM** por execução completa — a aula **mais barata da trilha**, e por um motivo estrutural: um agente, uma task, uma única chamada de tool e um fixture de 38 linhas. O free tier da Groq limita a **8.000 tokens/minuto** (a pior janela de 60s ficou em 3.158, com folga de 60%) e **200.000 tokens/dia**, este invisível nos headers — o que dá **~63 execuções por dia**. O `RateLimitAwareLLM` (`core/llm_config.py`) não chegou a ser acionado em nenhum dos runs.

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

O pipeline não escreve nada em disco: o parecer sai no terminal e o `data/trivy.json` é só leitura.

## Estrutura do Projeto

```
007-devsecops-com-agentes-de-IA/
├── devsecops.py                  # entrypoint — e também onde vive a tool desta aula
│                                 #   @tool("analyze_trivy_report") declarada inline
├── data/
│   └── trivy.json                # ← NOVO: entrada do pipeline (fixture, não é scan real)
├── core/
│   ├── agents.py                 # + get_devsecops_agent()  ← novo papel (o 7º da trilha)
│   └── llm_config.py             # Groq + RateLimitAwareLLM — herdado da 005, intocado
├── tools/                        # NENHUMA tool nova nesta aula
│   ├── chatops_tools.py          # herdado da 006 — não usado neste pipeline
│   ├── aiops_tools.py            # herdado da 005 — não usado neste pipeline
│   ├── k8s_diag.py               # herdado da 004 — não usado neste pipeline
│   ├── obs_tools.py              # herdado da 004 — não usado neste pipeline
│   ├── file_writer.py            # herdado da 002/004 — não usado neste pipeline
│   ├── k8s_ops.py                # herdado da 003 — não usado neste pipeline
│   ├── security_scan.py          # herdado da 002 — não usado neste pipeline
│   └── policy_rag.py             # herdado da 001 — não usado neste pipeline
├── tests/
│   ├── test_file_writer.py       # herdado da 004
│   ├── test_k8s_ops.py           # herdado da 003
│   └── test_rate_limit_espera.py # herdado da 005
└── pyproject.toml                # − streamlit (a 006 era a única a precisar dele)
```

> Note `tools/security_scan.py`, herdado da 002: aquela aula já tinha uma camada de segurança, mas rodava o **Checkov de verdade** por `subprocess` sobre um `main.tf` gerado. A 007 tem o nome "DevSecOps" no agente e nenhum scanner no processo — o scan já veio pronto, e estático.

## Como funciona

```
uv run devsecops.py
   │
   ├─ PROJECT_ROOT = dirname(abspath(__file__))        ← corrigido nesta aula (ver Aprendizados)
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

- [x] **Triagem de vulnerabilidades** — a diferença entre "o scanner achou 3 CVEs" e "uma delas exige ação hoje"; é o trabalho que a aula automatiza
- [x] **Supply chain attack** — a CVE-2024-3094 (backdoor inserido no *upstream* da `xz`) não é uma falha de código, é código malicioso plantado, e por isso não se trata como as outras
- [x] **Falso positivo vs. explorabilidade** — severidade nominal não é risco; o `goal` do agente é justamente separar os dois
- [x] **Agente como consumidor de artefato** — o pipeline recebe a saída de outra ferramenta em vez de gerar a sua; primeira vez na trilha
- [x] **Tool declarada inline** — `@tool` no entrypoint em vez de módulo em `tools/`, e o que isso muda para quem lê o projeto
- [x] **Argumentos de tool decididos pelo LLM** — a assinatura `(file_path: str)` transfere ao modelo uma decisão que o código já tinha tomado
- [x] **Contexto vs. parâmetros do modelo** — o relatório mistura o que estava no JSON com o que o modelo sabe da internet, sem distinguir os dois
- [x] **Validação de entrada em pipelines de dados** — o que acontece quando nada checa se o arquivo recebido é mesmo o que se espera

## Aprendizados

- [x] **O hack de `sys.path` que a 006 anotou como linha morta é, nesta aula, o que quebra o pipeline — e precisou ser corrigido.** O material original calcula `PROJECT_ROOT = dirname(__file__)/".."` porque os labs do professor vivem em `labs/`. Nas aulas 004–006 isso apontava para `projects/` e não fazia diferença, porque ninguém usava a variável para montar caminho. Na 007 ela é **load-bearing**: `trivy_report_path = os.path.join(PROJECT_ROOT, "data", "trivy.json")`. Copiada como estava, a linha apontaria para `projects/data/trivy.json` — que não existe — e o pipeline morreria no primeiro `open()`. Corrigido para `os.path.dirname(os.path.abspath(__file__))`. O README da 006 encerrou esse ponto com "código de caminho copiado entre layouts diferentes costuma sobreviver sem fazer nada **até o dia em que faz**"; o dia foi a aula seguinte.
- [x] **O caminho do arquivo é calculado em Python, vira texto no prompt e volta ao código pela transcrição do modelo.** Instrumentando `builtins.open` para registrar todo JSON aberto no processo, a leitura foi confirmada: o único JSON de dados aberto é o `data/trivy.json` da própria aula (o outro é o `translations/en.json` do CrewAI). Mas ela acontece porque o LLM **copiou corretamente** um caminho absoluto de 130 caracteres do enunciado para o argumento da tool. A tool poderia não receber argumento nenhum e fechar sobre a constante `trivy_report_path`, que já está no escopo do módulo. Do jeito que está, **qual arquivo será aberto é uma decisão do modelo**, não do código — e um caminho com acento, espaço ou uma falha de transcrição vira `FileNotFoundError` sem tratamento.
- [x] **A tool chamada `analyze_trivy_report` não analisa, não é do Trivy e não valida nada.** O corpo é `json.load(open(file_path))`. Testada diretamente, sem LLM: caminho inexistente → `FileNotFoundError` cru; JSON malformado → `JSONDecodeError` cru; e `{"qualquer": "coisa"}` → retorna `{'qualquer': 'coisa'}` sem reclamar. Nenhum dos três é tratado, e nada checa se o documento é um relatório de scan. O nome da função promete uma análise que é 100% do LLM; a ferramenta só faz I/O. É a mesma armadilha do OPA por substring da 002 e do canário por regex da 003: **uma tool cujo nome descreve a intenção, não o que o código faz** — e aqui é o próprio LLM quem lê esse nome para decidir usá-la.
- [x] **O fixture não é um relatório que o Trivy produziria, e o "Analista de DevSecOps" não estranhou.** Confrontado com o schema da [documentação do Trivy](https://github.com/aquasecurity/trivy/blob/main/docs/guide/configuration/reporting.md), faltam `SchemaVersion`, `Class`, `Type`, `Layer`, `DataSource`, `CweIDs`, `VendorSeverity`, `CVSS` e `References`. E o campo `Target`, que no Trivy identifica o alvo escaneado (`"ubuntu:latest (ubuntu 22.04)"`), aqui vale `"liblzma5"` — um nome de **pacote** —, com `zlib1g` e `nginx` aninhados dentro dele. Também há incoerência interna: duas URLs apontam para `avd.aquasecurity.jp` e uma para `avd.aquasec.com`, sendo esta última o domínio que o Trivy realmente emite. Para o exercício o fixture serve; o aprendizado é que **o agente processou um documento estruturalmente incoerente sem uma linha de ressalva** — e o primeiro trabalho de um auditor é desconfiar da procedência da evidência.
- [x] **Uma das três CVEs não existe e não pode existir, e o agente montou plano de ação para ela.** `CVE-2022-123` tem 3 dígitos na sequência; a sintaxe de identificador CVE exige no mínimo 4 desde a mudança de 2014. É um ID sintaticamente inválido — verificável por regex, sem consultar base nenhuma. O agente tratou-a como uma vulnerabilidade real de `nginx`, atribuiu-lhe severidade e recomendou "ignorar temporariamente; priorizar correção do backdoor". A triagem terminou com o veredito certo sobre a CVE certa **por acidente de ordenação**: a fabricada calhou de ser a menos grave. Se o fixture tivesse plantado um ID falso marcado `CRITICAL`, nada no pipeline o teria pego.
- [x] **A triagem que a aula pede é impossível com os dados que a aula fornece.** O `goal` do agente é "priorizar o que é explorável", e explorabilidade se avalia por vetor de ataque (`AV:N` vs. `AV:L`), privilégio necessário, score CVSS e severidade do fornecedor — **nada disso está no JSON**. Só há uma string `Severity`. O modelo preenche a lacuna, e os erros observados apontam todos para o mesmo lado. Em um run, chamou a CVE-2023-45853 de criticidade "baixa/média" quando o arquivo diz `"Severity": "HIGH"`. Em outro, leu `HIGH` corretamente mas argumentou que "em ambientes containerizados isolados, o risco de exploração remota é baixo" — uma premissa sobre o ambiente de deploy que **não aparece em lugar nenhum da entrada**. O viés não é aleatório: o goal manda eliminar falsos positivos, e o modelo inventa a justificativa que sustenta a dispensa. **Numa triagem de segurança, o viés deveria ser conservador; aqui o enunciado o empurra para o contrário.**
- [x] **O relatório mistura o scan com a memória do modelo, e nada indica onde termina um e começa o outro.** No JSON, a descrição da CVE-2024-3094 é uma frase: *"Malicious code was discovered in the upstream tarballs of xz, starting with version 5.6.0"*. O parecer entregue fala em interceptação de conexões SSH, roubo de chaves de autenticação e execução remota de código — tudo **factualmente correto** sobre o backdoor da `xz`, e tudo **ausente da evidência recebida**. É o melhor comportamento possível e ainda assim o mais perigoso, porque estabelece a forma: afirmações vindas do scan e afirmações vindas dos pesos do modelo saem no mesmo tom, na mesma tabela, com a mesma aparência de fato apurado. Quando o palpite estiver errado — e no mesmo relatório há uma CVE fabricada tratada como real — ele virá com a mesma confiança.
- [x] **O produto da aula nunca é visto por inteiro.** `crew.kickoff()` tem o retorno descartado, padrão herdado desde a 004. Capturando o valor de retorno, o parecer tem **3.340 caracteres, 57 linhas e 6 seções**; o painel do CrewAI no terminal corta no meio da tabela da seção 6, e o "Plano de Ação Imediato" — que é o entregável — fica parcialmente invisível. Nas aulas anteriores isso não doía porque o resultado ia para o disco (`main.tf`, YAML, JSON do dashboard) e podia ser lido depois. Esta aula não escreve nada: **o único canal de saída é o console, e ele trunca**. Um `print(resultado)` de uma linha resolveria, e a `tools/file_writer.py` herdada da 002 já está no projeto para persistir o parecer.
- [x] **É a aula mais barata da trilha, e o motivo é o mesmo que a torna frágil.** 3.158 tokens em 2 chamadas — contra ~1.150 *por mensagem* na 006 e execuções bem mais caras nas aulas de múltiplos agentes. A economia vem de não haver delegação, nem ciclo ReAct, nem segunda task: o agente chama a tool uma vez, recebe 38 linhas de JSON e escreve. Não há passo de verificação porque não há nada para verificar contra. **O custo baixo aqui não é eficiência, é ausência de checagem** — e o teto de 200.000 tokens/dia daria folga de sobra para uma segunda task de revisão do parecer, que é a extensão mais óbvia do exercício.

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
