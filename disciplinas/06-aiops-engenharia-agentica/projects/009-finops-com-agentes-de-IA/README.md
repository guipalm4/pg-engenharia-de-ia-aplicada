# Exemplo 009 — FinOps com Agentes de IA

> Um agente lê um inventário de nuvem com três recursos desperdiçados e devolve um relatório de economia. A conta dos recursos zumbis sai do arquivo; a do rightsizing — que é 83% do total — sai da memória do modelo, e muda a cada execução.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Um agente com o papel de *Consultor de FinOps Cloud* recebe um inventário JSON de recursos AWS, identifica desperdício em duas categorias — **recursos zumbis** (alocados e faturados, mas sem uso) e **instâncias superdimensionadas** (rightsizing) — e produz um relatório com a economia mensal estimada.

O que torna esta aula diferente das anteriores da trilha é que **a saída é um número**, não um texto ou um artefato. Nas aulas 002 e 003 o agente produzia `main.tf` e manifestos de Kubernetes, que um validador externo aceita ou rejeita. Na 008 produzia YAML, que ao menos é sintaticamente checável. Aqui o entregável é `$325,00/mês` — e a diferença entre um número certo e um número plausível não aparece em nenhuma verificação automática. É o formato de saída em que a alucinação é mais barata de produzir e mais cara de detectar.

O pipeline é o mais curto da trilha: um agente, uma task, uma tool declarada inline, duas chamadas ao modelo. O material da aula está no que acontece com a aritmética — nove execuções controladas mostram que a economia total varia de `$325,00` a `$380,00` sobre o mesmo inventário, porque o preço da instância de destino é inventado pelo modelo a cada volta. Está tudo em *Aprendizados*.

## Herança

- **Esta aula acrescenta:** `get_finops_agent` (9º papel da trilha) · `finops.py`, que declara a tool `analyze_cloud_costs` inline · `data/inventario_cloud.json`, a entrada do pipeline.
- **Vem da 008 sem alteração:** todo o resto — `core/llm_config.py`, os `tests/` e as **8 tools de `tools/`, nenhuma delas usada neste pipeline**. O `data/workflow_lento.yaml` da 008 saiu junto com o entrypoint que o consumia.

## Tecnologias e Ferramentas

- [x] **Python 3.12** — runtime dos agentes
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — orquestração `Agent`/`Task`/`Crew`
- [x] **`@tool` decorator do CrewAI** — a tool desta aula é declarada no entrypoint, não em `tools/`
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** — motor de inferência (free tier); modelo em `GROQ_MODEL`, default `qwen/qwen3.6-27b`
- [x] **AWS** — **apenas o vocabulário** (EBS, EC2, Elastic IP, tipos de instância); nenhuma credencial, nenhuma API, nenhuma conta real
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

cd 009-finops-com-agentes-de-IA

# auditoria FinOps
uv run finops.py

# testes (não precisam de API key)
uv run pytest -v
```

## Saída esperada

`uv run finops.py` imprime o painel `🤖 Agent Started` com o enunciado; uma linha `Tool analyze_cloud_costs executed with result: {'account_id': '123456789012', ...}`; e o painel `✅ Agent Final Answer` com o relatório em Markdown — tabela de zumbis, tabela de rightsizing, total e plano de ação. Sai com código 0 em poucos segundos e **não escreve nada em disco**.

> O painel do CrewAI **corta o relatório na largura do terminal**, e o lab chama `crew.kickoff()` sem guardar o retorno. Para ler o relatório inteiro é preciso capturar o valor de retorno — não há como recuperá-lo depois que o processo termina.

`uv run pytest -v` deve reportar **41 passed** — são os testes herdados das aulas 003 a 005; esta aula não acrescenta testes.

**Custo medido** (`qwen/qwen3.6-27b`, 9 execuções): **2 chamadas, 2.728–2.879 tokens** no caso normal. A pior janela de 60s fica em torno de **36% do teto de 8.000 TPM**, e cabem **~69 execuções** no teto diário de 200.000 tokens por modelo. Quando a resposta bate o teto de saída e o CrewAI repete a volta (ver *Aprendizados*), sobe para **4 chamadas e 5.758 tokens** — o dobro, e a metade das execuções diárias.

**O que é estável nas 9 execuções:**

- a tool é chamada exatamente uma vez;
- os três recursos são sempre classificados corretamente (2 zumbis, 1 superdimensionada);
- o subtotal de zumbis é sempre `$55,00/mês`;
- o formato é sempre Markdown com tabelas.

**O que muda:** o tipo de instância recomendado (`m5.large` ou `t3.medium`), o preço atribuído a ele, a economia total (`$325,00`, `$336,50`, `$365,00`, `$380,00`) e se o relatório chega ou não ao fim.

## Real vs. simulado

| Componente | Real ou simulado | O que isso implica para quem reusar |
|---|---|---|
| **Agente e inferência** | **Real** — chamada à API da Groq | é a única parte que custa e que varia |
| **AWS** | **Simulado** — nenhuma credencial, nenhuma chamada de API, nenhuma conta | o projeto **não** demonstra integração com Cost Explorer, Trusted Advisor ou Compute Optimizer |
| **`data/inventario_cloud.json`** | **Fixture de 3 recursos, com preços fora da escala real** | `$340,00/mês` para uma `m5.4xlarge` que custa ~$560 on-demand; os números não são comparáveis aos preços que o modelo traz de memória |
| **`analyze_cloud_costs`** | **Real, mas não faz o que o nome diz** — é `json.load` | não analisa, não valida schema, não calcula nada; a análise é 100% do LLM |
| **Preço da instância de destino** | **Inventado a cada execução** | não está no inventário e não vem de API nenhuma — é o número que decide a economia anunciada |
| **Economia total** | **Aritmética do LLM, não verificada** | nada no código confere a soma, e ela mudou em 4 valores diferentes sobre o mesmo arquivo |
| **Execução das recomendações** | **Nenhuma** | nada é deletado, redimensionado ou liberado; o relatório não sai do terminal |

O pipeline termina sem erro em 100% das execuções porque nada é aplicado — e, nas execuções em que o relatório é cortado no meio, ele **também** termina sem erro.

## Estrutura do Projeto

```
009-finops-com-agentes-de-IA/
├── finops.py                     # entrypoint — e também onde vive a tool desta aula
│                                 #   @tool("analyze_cloud_costs") declarada inline
├── data/
│   └── inventario_cloud.json     # entrada do pipeline (3 recursos: EBS órfão,
│                                 #   EC2 a 2,5% de CPU, Elastic IP solto)
├── core/
│   ├── agents.py                 # + get_finops_agent()  ← novo papel (o 9º da trilha)
│   └── llm_config.py             # Groq + RateLimitAwareLLM — herdado, intocado
├── tools/                        # 8 tools herdadas das aulas 001–006
│                                 #   NENHUMA é usada neste pipeline
├── tests/                        # 41 testes herdados das aulas 003–005
└── pyproject.toml                # idêntico ao da 008, só muda o `name`
```

## Conceitos trabalhados

- [x] **Agente especialista em FinOps** — o 9º papel da trilha, com `goal` de reduzir desperdício financeiro
- [x] **Recursos zumbis** — volume `available`, Elastic IP `unassociated`: alocados, faturados, sem uso
- [x] **Rightsizing** — o gap entre capacidade provisionada e utilização real (2,5% de CPU numa `m5.4xlarge`)
- [x] **Tool declarada inline no entrypoint** — mesmo padrão da 007 e da 008, sem passar por `tools/`
- [x] **Inventário como entrada do pipeline** — o caminho é montado em Python e viaja para o modelo dentro do prompt
- [x] **Aritmética delegada ao LLM** — o que acontece quando o entregável é um número e não há validador
- [x] **Teto de saída do provedor** — `finish_reason: length` e o que o framework faz com uma resposta cortada

## Aprendizados

- [x] **A economia total varia de `$325,00` a `$380,00` sobre o mesmo inventário, porque o número que decide o resultado não está no arquivo.** O inventário informa um único preço relevante ao rightsizing: `$340,00/mês` da `m5.4xlarge`. O preço da instância **de destino** — o subtraendo — nunca é fornecido, e o agente precisa dele para fechar a conta. Nas execuções completas ele produziu `m5.large a $70,00` (2×), `m5.large a $58,50` (1×) e `t3.medium a $30,00` (1×), gerando economias de `$270,00`, `$281,50` e `$310,00` e totais de `$325,00`, `$336,50`, `$365,00` e `$380,00`. **O mesmo tipo de instância recebeu dois preços diferentes em duas execuções**, o que encerra a dúvida sobre a origem: não é consulta, é geração. E o rightsizing é **83% da economia anunciada** — a parte fabricada é a parte grande.
- [x] **A única aritmética estável é a que o arquivo permite verificar.** Os zumbis dão `$50,00 + $5,00 = $55,00` em 100% das execuções completas, porque os dois valores estão no JSON e a operação é uma soma. Assim que o cálculo exige um dado ausente, a estabilidade desaparece. Isso é uma régua útil e transferível: **num relatório gerado por LLM, a confiabilidade de cada número é a do dado mais fraco que entra nele** — e o relatório não sinaliza qual é qual, porque `$55,00` e `$270,00` saem na mesma tabela, com a mesma formatação e o mesmo tom de certeza.
- [x] **Os preços que o modelo inventa estão certos; o fixture é que está errado.** `m5.large` custa `$0,096/h` ≈ `$70/mês` e `t3.medium` `$0,0418/h` ≈ `$30/mês` — exatamente os valores que o agente usou. Já a `m5.4xlarge` do inventário está marcada a `$340,00/mês` quando o preço on-demand é ~`$560/mês` (a família m5 escala linear: 8× o `large`). O agente, portanto, subtrai um preço real de um preço fictício, e o resultado não descreve nem a nuvem real nem o cenário do exercício. **É o pior caso possível de dado misturado, e é invisível: ambos os números têm cifrão e duas casas decimais.**
- [x] **4 de 9 execuções devolveram o relatório cortado no meio de uma palavra, e o teto é da API da Groq — não do código.** As saídas truncadas param com `finish_reason: length` em exatamente `2048` tokens de completion. O `core/llm_config.py` desta trilha deliberadamente **não** passa `max_tokens`, e o CrewAI repassa `max_tokens=None`; o catálogo da Groq anuncia `max_completion_tokens: 16384` para este modelo. Mas uma chamada crua com `curl`, sem framework nenhum e sem `max_tokens` no corpo, também volta com `finish_reason: length` e `completion_tokens: 2048` — **o default do endpoint é 2048, e não é o teto do modelo.** A lição operacional inverte a intuição de economia: não passar `max_tokens` não deixa o modelo "livre", deixa ele preso no default do provedor.
- [x] **Quando a resposta é cortada, o CrewAI às vezes repete a volta inteira — e cobra por isso.** Numa das execuções truncadas o pipeline emitiu `Error executing listener call_llm_native_tools: Invalid response from LLM call - None or empty`, disparou um segundo par de chamadas e terminou com **4 chamadas e 5.758 tokens** — o dobro do custo normal, pela metade das execuções diárias disponíveis. Nas outras três truncadas não houve retry nem aviso: o processo saiu com código 0 entregando um relatório que para no meio de uma linha de tabela. **O modo de falha mais caro e o mais silencioso são o mesmo evento, e nada no pipeline distingue os dois.**
- [x] **Nenhum dos três recursos é tocado, e a `file_writer` herdada continua ociosa pela segunda aula seguida.** Assim como na 008, o artefato mais valioso da execução — aqui, um relatório de auditoria com plano de ação datado — existe apenas no stdout de um processo que já terminou. A tool que resolveria isso está na pasta desde a aula 002. É a diferença entre um exercício e um pipeline: nada aqui deixa rastro.
- [x] **A tool chamada `analyze_cloud_costs` não analisa e não calcula custo — é `json.load`.** Quarta aula seguida com o mesmo vício (`analyze_trivy_report` na 007, `analyze_workflow_yaml` na 008). Já não é um deslize de um lab, é a assinatura do material: **o nome da tool descreve a intenção do autor, e é esse nome que o LLM lê para decidir usá-la e para inferir o que ela lhe entregou.** Um agente que recebe uma tool chamada "analyze" tende a tratar o retorno como análise, e não como o dump cru que é.
- [x] **O que faria diferente:** incluir o preço de destino no inventário (ou dar ao agente uma tool de tabela de preços), transformando o rightsizing num cálculo verificável em vez de uma lembrança; corrigir a escala do fixture para que `m5.4xlarge` bata com o preço real, já que hoje o exercício ensina a somar maçãs com laranjas; passar `max_tokens` explícito no `llm_config.py` para tirar o relatório do default de 2048 da Groq; e entregar a `file_writer` ao agente, fechando o ciclo como a 002 faz — um relatório de FinOps que não é arquivado não é uma auditoria, é uma conversa.

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [CrewAI — Tools](https://docs.crewai.com/concepts/tools)
- [Groq API — Chat Completions (`max_tokens` e `finish_reason`)](https://console.groq.com/docs/api-reference#chat-create)
- [Groq — Rate limits (TPM/TPD por modelo)](https://console.groq.com/docs/rate-limits)
- [FinOps Foundation — Framework](https://www.finops.org/framework/)
- [AWS — EC2 On-Demand Pricing](https://aws.amazon.com/ec2/pricing/on-demand/)
- [AWS — Elastic IP: cobrança de endereços não associados](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html)
