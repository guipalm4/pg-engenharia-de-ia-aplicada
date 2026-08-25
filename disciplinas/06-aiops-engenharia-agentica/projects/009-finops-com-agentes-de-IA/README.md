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

- [x] Quando o entregável é um **número**, a alucinação fica barata de produzir e cara de detectar: não há validador que recuse `$325,00/mês` como recusaria um YAML inválido
- [x] Num relatório gerado por LLM, a confiabilidade de cada número é a do dado mais fraco que entra nele — a soma dos zumbis, presente no JSON, é estável; o rightsizing, que depende de um preço ausente, varia de `$325,00` a `$380,00`
- [x] Preço ausente do inventário vira geração, não consulta: o mesmo tipo de instância recebeu dois preços diferentes em execuções distintas
- [x] Fixture com preço fora da escala real ensina a somar maçãs com laranjas — o agente subtrai um preço correto que traz de memória de um preço fictício do arquivo
- [x] Não passar `max_tokens` prende a resposta no default do endpoint (2.048 na Groq): ela sai truncada com `finish_reason: length`, às vezes com retry que dobra o custo, às vezes pela metade com exit code 0
- [x] Relatório que só existe no stdout de um processo encerrado não é auditoria — a `file_writer` está na pasta desde a aula 002 e segue sem ser entregue a nenhum agente

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [CrewAI — Tools](https://docs.crewai.com/concepts/tools)
- [Groq API — Chat Completions (`max_tokens` e `finish_reason`)](https://console.groq.com/docs/api-reference#chat-create)
- [Groq — Rate limits (TPM/TPD por modelo)](https://console.groq.com/docs/rate-limits)
- [FinOps Foundation — Framework](https://www.finops.org/framework/)
- [AWS — EC2 On-Demand Pricing](https://aws.amazon.com/ec2/pricing/on-demand/)
- [AWS — Elastic IP: cobrança de endereços não associados](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html)
