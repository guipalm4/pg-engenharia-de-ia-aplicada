# Exemplo 007 — DevSecOps com Agentes de IA

> Um agente de segurança lê um relatório de scan de container, filtra o ruído e escreve o parecer executivo sobre o backdoor da `xz` — sem receber nenhum dos dados que uma triagem de vulnerabilidade exige.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Um agente com o papel de *Analista de DevSecOps* recebe um relatório de scan de vulnerabilidades de uma imagem de container e produz um parecer executivo: o que exige ação hoje, o que é ruído, e qual o plano imediato. O relatório contém três CVEs de severidades diferentes, e a mais grave é a **CVE-2024-3094** — o backdoor plantado no *upstream* da biblioteca `xz`, um ataque de cadeia de suprimentos que não se trata como as falhas de código ao lado dele.

O trabalho que o exercício automatiza é a **triagem**: a distância entre "o scanner achou 3 CVEs" e "uma delas exige ação hoje". É o gargalo real de qualquer esteira de segurança — scanners produzem volume, e quase todo o custo humano está em separar o explorável do teórico. O `goal` do agente diz exatamente isso: *"triar vulnerabilidades reais e eliminar falsos positivos, priorizando o que é explorável"*.

O pipeline é o mais simples da disciplina: um agente, uma task, uma ferramenta. Não há delegação, ciclo ReAct nem segunda passagem de revisão — o agente chama a tool uma vez, recebe o JSON e escreve. O que torna o exercício interessante não é a orquestração, e sim o tipo de produto: um **julgamento**. Um `main.tf` pode ser validado pelo Checkov; um manifesto Kubernetes, pelo API server; um dashboard, pelo schema do Grafana. Um parecer em prosa não tem validador — e é aí que as perguntas úteis desta aula começam, todas registradas em *Aprendizados*.

## Herança

- **Esta aula acrescenta:** `get_devsecops_agent` (7º papel da trilha) · `devsecops.py`, que declara a tool `analyze_trivy_report` inline em vez de em `tools/` · `data/trivy.json`, primeira **entrada** de arquivo da trilha.
- **Vem da 006 sem alteração:** todo o resto — `core/llm_config.py`, os `tests/` e as **8 tools de `tools/`, nenhuma delas usada neste pipeline**. A dependência `streamlit`, que só a 006 usava, foi removida do `pyproject.toml`.

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

## Saída esperada

`uv run devsecops.py` imprime, nesta ordem: o painel `🤖 Agent Started` com o enunciado da task; uma linha `Tool analyze_trivy_report executed with result: {'ArtifactName': 'python:3.11-slim', ...}`; e o painel `✅ Agent Final Answer` com um relatório executivo em Markdown. Sai com código 0 em ~10s e **não escreve nada em disco**.

`uv run pytest -v` deve reportar **41 passed** — são os testes herdados das aulas 003 a 005; esta aula não acrescenta testes.

**O que é estável entre execuções:**

- a tool é chamada exatamente uma vez;
- a CVE-2024-3094 é sempre identificada como a ameaça crítica e sempre recebe o plano de ação prioritário.

**O que muda a cada execução:** todo o resto. `temperature=0.2` não é zero — o texto do parecer, os títulos das seções e a estrutura das tabelas variam sempre. E, mais importante, **a classificação das outras duas CVEs varia**: em execuções diferentes a CVE-2023-45853 foi chamada de "criticidade baixa/média" (contrariando o `"Severity": "HIGH"` do arquivo) e de "HIGH, mas de risco de exploração baixo em ambientes containerizados". Se você reproduzir esta aula, espere um parecer diferente do que está descrito aqui — o que se reproduz é o comportamento, não o texto.

> ⚠️ O painel do CrewAI **trunca** o parecer no terminal, e o entrypoint descarta o retorno de `kickoff()`. O relatório completo não é visível em nenhuma execução — ver *Aprendizados*.

## Real vs. simulado

| Componente | Real ou simulado | O que isso implica para quem reusar |
|---|---|---|
| **Agente e inferência** | **Real** — chamada à API da Groq | é a única parte que custa e que varia |
| **Scanner Trivy** | **Simulado** — o binário não é instalado nem executado | o projeto **não** demonstra integração com scanner; para valer, trocar o fixture por `trivy image -f json` |
| **`data/trivy.json`** | **Fixture, e não é o formato que o Trivy emite** | faltam `SchemaVersion`, `Class`, `Type`, `CVSS`, `Layer`, `DataSource`; não sirva de referência de schema |
| **`analyze_trivy_report`** | **Real, mas não faz o que o nome diz** — é `json.load` | a análise é 100% do LLM; a tool só lê o arquivo |
| **Ação corretiva** | **Nenhuma** — o parecer é texto | nada é aplicado, corrigido ou bloqueado; não há integração com esteira |

O pipeline termina sem erro em 100% das execuções porque nada de perigoso é feito. Isso é adequado para a aula e enganoso para quem copia.

## Estrutura do Projeto

```
007-devsecops-com-agentes-de-IA/
├── devsecops.py                  # entrypoint — e também onde vive a tool desta aula
│                                 #   @tool("analyze_trivy_report") declarada inline
├── data/
│   └── trivy.json                # entrada do pipeline (fixture; ver "Real vs. simulado")
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

- [x] **Um hack de `sys.path` copiado do material original passou cinco aulas sendo inofensivo e quebrou nesta.** O lab calcula `PROJECT_ROOT = dirname(__file__)/".."` porque os labs do professor vivem em `labs/`. Nas aulas 001–006 isso apontava para `projects/` — um diretório sem `core/` nem `tools/` — e não fazia diferença, porque ninguém usava a variável para montar caminho: os imports resolviam pelo diretório do script, que o Python insere sozinho. Aqui ela é **load-bearing**: `trivy_report_path = os.path.join(PROJECT_ROOT, "data", "trivy.json")`. Copiada como estava, apontaria para um diretório sem `data/` e o pipeline morreria no primeiro `open()`. Corrigido para `os.path.dirname(os.path.abspath(__file__))` — e, depois desta aula, **retroativamente nas seis anteriores**, porque uma linha inofensiva que insere o diretório errado na frente do `sys.path` é uma armadilha esperando um arquivo homônimo aparecer em `projects/`. **Código de caminho copiado entre layouts diferentes costuma sobreviver sem fazer nada até o dia em que faz.**
- [x] **O caminho do arquivo é calculado em Python, vira texto no prompt e volta ao código pela transcrição do modelo.** Instrumentando `builtins.open` para registrar todo JSON aberto no processo, a leitura foi confirmada: o único JSON de dados aberto é o `data/trivy.json` da própria aula. Mas ela acontece porque o LLM **copiou corretamente** um caminho absoluto de 130 caracteres do enunciado para o argumento da tool. A tool poderia não receber argumento nenhum e fechar sobre a constante `trivy_report_path`, que já está no escopo do módulo. Do jeito que está, **qual arquivo será aberto é uma decisão do modelo**, não do código.
- [x] **A tool chamada `analyze_trivy_report` não analisa, não é do Trivy e não valida nada.** O corpo é `json.load(open(file_path))`. Testada diretamente, sem LLM: caminho inexistente → `FileNotFoundError` cru; JSON malformado → `JSONDecodeError` cru; e `{"qualquer": "coisa"}` → retorna sem reclamar. Nenhum dos três é tratado, e nada checa se o documento é um relatório de scan. **É uma tool cujo nome descreve a intenção, não o que o código faz** — e é o próprio LLM quem lê esse nome para decidir usá-la.
- [x] **O fixture não é um relatório que o Trivy produziria, e o "Analista de DevSecOps" não estranhou.** Confrontado com o schema da documentação do Trivy, faltam `SchemaVersion`, `Class`, `Type`, `Layer`, `DataSource`, `CweIDs`, `VendorSeverity`, `CVSS` e `References`. O campo `Target`, que no Trivy identifica o alvo escaneado (`"ubuntu:latest (ubuntu 22.04)"`), aqui vale `"liblzma5"` — um nome de **pacote** —, com `zlib1g` e `nginx` aninhados dentro dele. Para o exercício o fixture serve; o achado é que **o agente processou um documento estruturalmente incoerente sem uma linha de ressalva** — e o primeiro trabalho de um auditor é desconfiar da procedência da evidência.
- [x] **Uma das três CVEs não existe e não pode existir, e o agente montou plano de ação para ela.** `CVE-2022-123` tem 3 dígitos na sequência; a sintaxe de identificador CVE exige no mínimo 4 desde a mudança de 2014. É um ID sintaticamente inválido — verificável por regex, sem consultar base nenhuma. O agente tratou-a como vulnerabilidade real de `nginx`, atribuiu severidade e recomendou "ignorar temporariamente". A triagem terminou com o veredito certo sobre a CVE certa **por acidente de ordenação**: a fabricada calhou de ser a menos grave. Um ID falso marcado `CRITICAL` teria passado igual.
- [x] **A triagem que a aula pede é impossível com os dados que a aula fornece.** Explorabilidade se avalia por vetor de ataque (`AV:N` vs. `AV:L`), privilégio necessário, score CVSS e severidade do fornecedor — **nada disso está no JSON**, que só traz uma string `Severity`. O modelo preenche a lacuna, e os erros observados apontam todos para o mesmo lado. Em uma execução chamou a CVE-2023-45853 de criticidade "baixa/média" quando o arquivo diz `HIGH`. Em outra leu `HIGH` corretamente mas argumentou que "em ambientes containerizados isolados, o risco de exploração remota é baixo" — uma premissa sobre o ambiente de deploy **ausente de toda a entrada**. O viés não é aleatório: o `goal` manda eliminar falsos positivos, e o modelo inventa a justificativa que sustenta a dispensa. **Numa triagem de segurança o viés deveria ser conservador; o enunciado o empurra para o contrário.**
- [x] **O parecer mistura o scan com a memória do modelo, e nada indica onde termina um e começa o outro.** No JSON, a descrição da CVE-2024-3094 é uma frase: *"Malicious code was discovered in the upstream tarballs of xz, starting with version 5.6.0"*. O parecer entregue fala em interceptação de conexões SSH, roubo de chaves e execução remota de código — tudo **factualmente correto** sobre o backdoor da `xz`, e tudo **ausente da evidência recebida**. É o melhor comportamento possível e ainda assim o mais perigoso, porque estabelece a forma: o que veio do scan e o que veio dos pesos do modelo saem no mesmo tom, na mesma tabela, com a mesma aparência de fato apurado. Quando o palpite estiver errado — e no mesmo relatório há uma CVE fabricada tratada como real — virá com a mesma confiança.
- [x] **O produto da aula nunca é visto por inteiro.** `crew.kickoff()` tem o retorno descartado. Capturando o valor, o parecer tem **3.340 caracteres, 57 linhas e 6 seções**; o painel do CrewAI corta no meio da tabela da seção 6, e o "Plano de Ação Imediato" — que é o entregável — fica parcialmente invisível. Nas aulas anteriores isso não doía porque o resultado ia para o disco e podia ser lido depois. **Esta aula não escreve nada: o único canal de saída é o console, e ele trunca.**
- [x] **O pipeline é barato porque não verifica nada.** Duas chamadas ao LLM por execução — sem delegação, sem ciclo ReAct, sem segunda task. Não há passo de revisão porque não há nada contra o que revisar: o parecer é a única saída e ninguém a confere. **Custo baixo aqui não é eficiência, é ausência de checagem**, e o orçamento diário disponível comportaria uma segunda passagem com folga.

## O que faria diferente

1. **Tirar o caminho do arquivo do prompt.** `analyze_trivy_report()` sem argumento, fechando sobre `trivy_report_path`. Elimina a etapa probabilística entre dois pontos determinísticos e remove um modo de falha inteiro.
2. **Fazer a tool merecer o nome.** Validar o schema antes de devolver (`SchemaVersion` presente, `Results[].Class`, CVEs casando `^CVE-\d{4}-\d{4,}$`) e tratar `FileNotFoundError`/`JSONDecodeError` com mensagem útil. A regex sozinha teria pego a `CVE-2022-123`.
3. **Dar ao agente os dados que a triagem exige.** Enriquecer o fixture com `CVSS` e `VendorSeverity` no formato real do Trivy. Sem isso, "priorize o que é explorável" é um pedido que o modelo só pode atender inventando.
4. **Reescrever o `goal` para falhar fechado.** Trocar "eliminar falsos positivos" por algo como "não rebaixar severidade declarada sem evidência no relatório" — o enunciado atual cria o viés que produz os dois erros observados.
5. **Persistir o parecer.** `print()` do retorno de `kickoff()` e gravação em `parecer.md` — a `tools/file_writer.py` herdada da 002 já está no projeto.
6. **Testar o que dá para testar sem LLM.** Um `test_analyze_trivy_report.py` cobrindo os três modos de falha e a validação de schema custa dez linhas, e a trilha já tem esse hábito para `file_writer` e `k8s_ops`.

## Medição

**Medido em 24/08/2026** · `python 3.12.11` · `crewai 1.15.15` · `litellm 1.83.0` · `groq/qwen/qwen3.6-27b` (`temperature=0.2`, `max_tokens` aberto)

| Métrica | Valor |
|---|---|
| Chamadas ao LLM por execução | 2 |
| Tokens reais por execução | 3.158 |
| Pior janela de 60s | 3.158 — teto TPM da Groq: 8.000 ✅ |
| Execuções no teto diário (200.000 tokens/modelo) | ~63 |
| Duração aproximada | ~10s |
| `RateLimitAwareLLM` acionado | não, em nenhuma das 4 execuções |

Os limites do free tier da Groq e a estratégia de troca de modelo estão documentados uma vez no [README da disciplina](../README.md), na seção *Modelo e limites do free tier*.

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
