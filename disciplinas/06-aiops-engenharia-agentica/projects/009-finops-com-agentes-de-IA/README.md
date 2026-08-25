# Exemplo 009 — FinOps com Agentes de IA

> Um agente lê um inventário de nuvem com três recursos desperdiçados e devolve um relatório de economia. A conta dos recursos zumbis sai do arquivo; a do rightsizing — que é 83% do total — sai da memória do modelo, e muda a cada execução.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Um agente com o papel de *Consultor de FinOps Cloud* recebe um inventário JSON de recursos AWS, identifica desperdício em duas categorias — **recursos zumbis** (alocados e faturados, mas sem uso) e **instâncias superdimensionadas** (rightsizing) — e produz um relatório com a economia mensal estimada.

O que torna esta aula diferente das anteriores da trilha é que **a saída é um número**, não um texto ou um artefato. Nas aulas 002 e 003 o agente produzia `main.tf` e manifestos de Kubernetes, que um validador externo aceita ou rejeita. Na 008 produzia YAML, que ao menos é sintaticamente checável. Aqui o entregável é `$325,00/mês` — e a diferença entre um número certo e um número plausível não aparece em nenhuma verificação automática. É o formato de saída em que a alucinação é mais barata de produzir e mais cara de detectar.

O pipeline é o mais curto da trilha: um agente, uma task, uma tool declarada inline, duas chamadas ao modelo. O material da aula está no que acontece com a aritmética — nove execuções controladas mostram que a economia total varia de `$325,00` a `$380,00` sobre o mesmo inventário, porque o preço da instância de destino não está no arquivo e é gerado pelo modelo a cada volta.

A AWS entra apenas como vocabulário: nenhuma credencial, nenhuma chamada de API, nenhuma conta. `data/inventario_cloud.json` é um fixture de três recursos com preços fora da escala real (`$340,00/mês` para uma `m5.4xlarge` que custa ~`$560`), `analyze_cloud_costs` é um `json.load`, nada confere a soma e nada é deletado ou redimensionado — o relatório não sai do terminal.

**O que esta aula acrescenta à trilha:** `get_finops_agent` (9º papel), `finops.py` com a tool `analyze_cloud_costs` declarada inline e `data/inventario_cloud.json`, a entrada do pipeline.

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

Funcionando, o terminal mostra o painel `🤖 Agent Started`, a linha `Tool analyze_cloud_costs executed with result: {'account_id': '123456789012', ...}` e o painel `✅ Agent Final Answer` com o relatório em Markdown — tabela de zumbis, tabela de rightsizing, total e plano de ação. Roda em poucos segundos com 2 chamadas ao modelo (~2.700–2.900 tokens), não escreve nada em disco, e `uv run pytest -v` reporta **41 passed**.

Entre execuções, a tool é chamada uma vez, os três recursos são sempre classificados corretamente e o subtotal de zumbis é sempre `$55,00/mês`; o que muda é o tipo de instância recomendado, o preço atribuído a ele e a economia total. Quando a resposta bate o teto de saída do provedor, o relatório pode sair truncado — às vezes com um retry que dobra o custo, às vezes em silêncio.

> O painel do CrewAI corta o relatório na largura do terminal e o lab chama `crew.kickoff()` sem guardar o retorno: para ler o texto inteiro é preciso capturar o valor de retorno.

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

- [x] Recurso zumbi e instância superdimensionada são desperdícios de naturezas diferentes: o zumbi (volume `available`, IP `unassociated`) se resolve deletando, enquanto o rightsizing exige medir utilização ao longo do tempo antes de decidir o destino
- [x] Quando o entregável é um **número**, a alucinação fica barata de produzir e cara de detectar: não há validador que recuse `$325,00/mês` como o Checkov recusa um Terraform inseguro
- [x] A economia de rightsizing depende de **dois** preços — o da instância atual e o da instância de destino; com só um no inventário, o outro vem da memória do modelo e a conta muda a cada execução
- [x] Num relatório gerado por LLM, a confiabilidade de cada número é a do dado mais fraco que entra nele, e o relatório não sinaliza qual é qual: `$55,00` calculado do arquivo e `$270,00` estimado saem na mesma tabela
- [x] Preço de fixture fora da escala real faz o agente subtrair um valor correto (que ele traz de memória) de um valor fictício — o resultado não descreve nem a nuvem real nem o cenário do exercício
- [x] Uma auditoria de FinOps que não é arquivada não é auditoria: o relatório precisa de destino em disco ou ticket, senão morre no terminal junto com o processo

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [CrewAI — Tools](https://docs.crewai.com/concepts/tools)
- [Groq API — Chat Completions (`max_tokens` e `finish_reason`)](https://console.groq.com/docs/api-reference#chat-create)
- [Groq — Rate limits (TPM/TPD por modelo)](https://console.groq.com/docs/rate-limits)
- [FinOps Foundation — Framework](https://www.finops.org/framework/)
- [AWS — EC2 On-Demand Pricing](https://aws.amazon.com/ec2/pricing/on-demand/)
- [AWS — Elastic IP: cobrança de endereços não associados](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/elastic-ip-addresses-eip.html)
