# Exemplo 009 — FinOps com Agentes de IA

> Um agente lê um inventário de nuvem com três recursos desperdiçados — um volume EBS órfão, um Elastic IP solto e uma instância a 2,5% de CPU — e devolve o relatório de economia mensal.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Um agente com o papel de *Consultor de FinOps Cloud* recebe um inventário JSON de recursos AWS, identifica desperdício em duas categorias — **recursos zumbis** (alocados e faturados, mas sem uso) e **instâncias superdimensionadas** (rightsizing) — e produz um relatório com a economia mensal estimada.

O que torna esta aula diferente das anteriores da trilha é que **a saída é um número**, não um texto ou um artefato. Nas aulas 002 e 003 o agente produzia `main.tf` e manifestos de Kubernetes, que um validador externo aceita ou rejeita. Na 008 produzia YAML, que ao menos é sintaticamente checável. Aqui o entregável é `$325,00/mês` — e a diferença entre um número certo e um número plausível não aparece em nenhuma verificação automática. É o formato de saída em que a alucinação é mais barata de produzir e mais cara de detectar.

O pipeline é o mais curto da trilha: um agente, uma task, uma tool declarada inline. O material da aula está no que acontece com a **aritmética**. A economia dos zumbis é uma soma do que está no arquivo; a do rightsizing depende de um segundo preço — o da instância de destino — que o inventário não traz, e que por isso é gerado pelo modelo. O total do relatório mistura as duas origens sem distingui-las.

A AWS entra apenas como vocabulário: nenhuma credencial, nenhuma chamada de API, nenhuma conta. `data/inventario_cloud.json` é um fixture de três recursos com preços próprios do cenário — a `m5.4xlarge` aparece a `$340,00/mês`, abaixo do preço on-demand real —, `analyze_cloud_costs` é um `json.load`, e nada é deletado ou redimensionado.

Esta aula acrescenta o `get_finops_agent` (9º papel), o `finops.py` com a tool `analyze_cloud_costs` declarada inline e o `data/inventario_cloud.json`, a entrada do pipeline.

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

Funcionando, o terminal mostra o painel `🤖 Agent Started`, a linha `Tool analyze_cloud_costs executed with result: {'account_id': '123456789012', ...}` confirmando a leitura do inventário, e o painel `✅ Agent Final Answer` com o relatório em Markdown — tabela de zumbis, tabela de rightsizing, total e plano de ação. Nada é escrito em disco.

O subtotal de zumbis (`$55,00/mês`) sai direto do arquivo e é o mesmo sempre; o total, que inclui o rightsizing, depende do preço que o modelo atribuir à instância de destino.

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
│                                 #   nenhuma é usada neste pipeline
├── tests/                        # testes herdados das aulas 003–005
└── pyproject.toml                # idêntico ao da 008, só muda o `name`
```

## Como funciona

```
uv run finops.py
   │
   ├─ PROJECT_ROOT = dirname(abspath(__file__))              ← raiz da aula
   ├─ cloud_inventory_path = PROJECT_ROOT/data/inventario_cloud.json
   │
   ├─ @tool("analyze_cloud_costs")
   │      def analyze_cloud_costs(file_path: str) -> dict:
   │          return json.load(open(file_path))              ← devolve o inventário inteiro
   │
   ├─ agent = get_finops_agent(tools=[analyze_cloud_costs])
   │
   ├─ task = Task(description=f"""Analise o inventário em '{cloud_inventory_path}'.
   │                             1. Recursos 'Zumbis' (volumes disponíveis, IPs soltos).
   │                             2. Instâncias superdimensionadas (Rightsizing).
   │                             Calcule a economia total estimada em dólares.""")
   │
   └─ Crew(agents=[agent], tasks=[task]).kickoff()
            │
            ├─ o LLM transcreve o caminho para o argumento da tool
            │        └─ os 3 recursos entram no contexto com `cost_per_month`
            │
            ├─ classificação — duas categorias, duas aritméticas diferentes:
            │        │
            │        ├─ ZUMBIS   vol-0a1b2c3d (`available`, $50) + eipalloc-001122
            │        │           (`unassociated`, $5)
            │        │              └─ economia = SOMA do que está no arquivo → $55,00
            │        │
            │        └─ RIGHTSIZING  i-99887766, `m5.4xlarge` a 2,5% de CPU, $340
            │                   └─ economia = $340 − preço da instância de destino
            │                            ↑
            │              o tipo de destino e o preço dele NÃO estão no inventário:
            │              os dois saem do conhecimento prévio do modelo
            │
            └─ relatório em Markdown: tabela de zumbis + tabela de rightsizing
               + total + plano de ação
```

As duas categorias exigem trabalhos diferentes. O zumbi é uma decisão de leitura: `status: available` num volume e `unassociated` num Elastic IP já bastam para dizer que ele é faturado sem uso, e a economia é o próprio `cost_per_month`. O rightsizing é uma decisão de dimensionamento: `avg_cpu_utilization: 2.5%` diz que a instância está grande demais, mas não diz qual o tamanho certo — e a economia só existe depois que alguém escolhe a instância de destino e sabe quanto ela custa.

## Conceitos trabalhados

- [x] **Agente especialista em FinOps** — o 9º papel da trilha, com `goal` de reduzir desperdício financeiro
- [x] **Recursos zumbis** — volume `available`, Elastic IP `unassociated`: alocados, faturados, sem uso
- [x] **Rightsizing** — o gap entre capacidade provisionada e utilização real (2,5% de CPU numa `m5.4xlarge`)
- [x] **Tool declarada inline no entrypoint** — mesmo padrão da 007 e da 008, sem passar por `tools/`
- [x] **Inventário como entrada do pipeline** — o caminho é montado em Python e viaja para o modelo dentro do prompt
- [x] **Aritmética delegada ao LLM** — o que acontece quando o entregável é um número e não há validador
- [x] **Origem do dado dentro de um mesmo relatório** — números lidos do arquivo e números gerados pelo modelo saem na mesma tabela, sem marca que os separe

## Aprendizados

- [x] Recurso zumbi e instância superdimensionada são desperdícios de naturezas diferentes: o zumbi (volume `available`, IP `unassociated`) se resolve deletando, enquanto o rightsizing exige medir utilização ao longo do tempo antes de decidir o destino
- [x] Quando o entregável é um **número**, a alucinação fica barata de produzir e cara de detectar: não há validador que recuse `$325,00/mês` como o Checkov recusa um Terraform inseguro
- [x] A economia de rightsizing depende de **dois** preços — o da instância atual e o da instância de destino; com só um no inventário, o outro vem da memória do modelo e a conta muda a cada execução
- [x] Num relatório gerado por LLM a confiabilidade de cada número é a do dado mais fraco que entra nele, e nada na tabela sinaliza qual é qual — com o preço do cenário e o preço que o modelo traz de memória na mesma conta, o resultado não descreve nem a nuvem real nem o exercício
- [x] Uma auditoria de FinOps que não é arquivada não é auditoria: o relatório precisa de destino em disco ou ticket, senão morre no terminal junto com o processo

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [CrewAI — Tools](https://docs.crewai.com/concepts/tools)
- [FinOps Foundation — Framework](https://www.finops.org/framework/)
- [AWS — EC2 On-Demand Pricing](https://aws.amazon.com/ec2/pricing/on-demand/)
- [AWS — Elastic IP: cobrança de endereços não associados](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html)
