# Exemplo 005 — Observabilidade Preditiva

> Agente único de AIOps que traduz linguagem natural para PromQL, prevê a saturação de um volume antes do alerta tocar e materializa o dashboard do incidente em disco.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Este projeto fecha a trilha iniciada em [004 — Reduzindo o MTTR com Inteligência Agêntica](../004-reduzindo-mttr-com-inteligencia-agentica), onde uma crew de dois papéis **reagia** a um incidente já em curso: diagnosticava pelo framework ReAct e devolvia o hotfix. O delta da aula é o deslocamento no tempo — aqui o pipeline **antecipa** a falha. A *backstory* do novo agente resume a virada: "Você não espera o alerta tocar, você prevê o alerta".

A estrutura encolhe em vez de crescer, e isso é intencional. Onde a 004 tinha duas tasks, dois agentes e delegação habilitada, a 005 tem **um agente e uma task**. O que muda não é a orquestração, é a natureza das ferramentas: as três tools de `tools/aiops_tools.py` cobrem as três camadas de uma plataforma de observabilidade moderna — **consulta** (`nl_to_promql`), **predição** (`predictive_disk_alert`) e **visualização** (`generate_grafana_dashboard`). O quinto papel em `core/agents.py`, `get_aiops_agent()`, é quem as encadeia.

`nl_to_promql` ataca a barreira de entrada do Prometheus: PromQL é uma linguagem própria, e traduzir "qual a porcentagem de disco livre?" para `node_filesystem_avail_bytes{...} / node_filesystem_size_bytes{...} * 100` é a diferença entre uma plataforma que só o time de SRE usa e uma que o time de produto consulta. `predictive_disk_alert` inverte a lógica de alerta: em vez de disparar quando o disco chega a 95%, projeta a tendência e informa que a saturação ocorre em 4 horas — a janela onde ainda existe ação preventiva. E `generate_grafana_dashboard` é a única das três com efeito colateral real: grava `incident_dashboard.json` no disco, pronto para importação no Grafana.

O `incident_dashboard.json` versionado aqui é **saída do agente**, não código escrito à mão — mesma convenção do `checkout-k8s-fix.yaml` da 004.

Esta é a primeira aula da trilha em que **a configuração herdada do LLM quebrou o pipeline**, e a correção está documentada em *Aprendizados*: o `reasoning_effort="low"` que as aulas 001–004 usam faz a Groq recusar o 3º tool call deste fluxo em ~80% das tentativas. As aulas anteriores não foram alteradas.

## Tecnologias e Ferramentas

- [x] **Python 3.12** — runtime dos agentes
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — orquestração `Agent`/`Task`/`Crew`, aqui com um único agente e uma única task
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** (`openai/gpt-oss-20b`) — motor de inferência dos agentes (free tier)
- [x] **PromQL / Prometheus** — linguagem-alvo da tradução em `nl_to_promql`
- [x] **Grafana** — destino do dashboard gerado (JSON de importação)
- [x] **Prophet / Isolation Forest** — algoritmos de série temporal **citados**, aqui simulados por resposta roteirizada
- [x] **pytest** — testes dos helpers herdados das aulas anteriores
- [x] **uv (workspace)** — ambiente único compartilhado por todas as aulas da disciplina

## Pré-requisitos

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python e as dependências
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`)

> ⚠️ Consumo medido em 5 execuções: **4.500 a 8.800 tokens por run** (4 a 7 chamadas ao LLM), tudo dentro de uma janela de 60s. O teto do free tier da Groq é de 8.000 tokens/minuto, então **um run isolado pode raspar o limite** e dois runs seguidos o estouram. O `RateLimitAwareLLM` (`core/llm_config.py`) segura o pipeline pausando quando isso acontece e imprime `⏳ Limite de tokens/minuto da Groq atingido` — é a proteção funcionando, não erro. Se for rodar repetidamente, espere ~50s entre execuções.

> ⚠️ Rode sempre a partir do diretório do projeto. `generate_grafana_dashboard` grava com caminho relativo (`open("incident_dashboard.json", "w")`), então o arquivo aparece no diretório de trabalho corrente, não no do projeto.

## Como executar

```bash
cd disciplinas/06-aiops-engenharia-agentica/projects

# setup (uma vez para todas as aulas)
cp .env.example .env && $EDITOR .env   # cole a GROQ_API_KEY
uv sync --all-packages

cd 005-observabilidade-preditiva

# fluxo de AIOps: PromQL → previsão → dashboard
uv run aiops.py

# o artefato gerado pelo agente
cat incident_dashboard.json

# testes (não precisam de API key)
uv run pytest -v
```

Para ver o resultado no Grafana: **Dashboards → New → Import → Upload JSON file**, e selecione o `incident_dashboard.json`.

## Estrutura do Projeto

```
005-observabilidade-preditiva/
├── aiops.py                      # entrypoint: 1 agente, 1 task, 3 tools em sequência
├── incident_dashboard.json       # artefato GERADO pelo agente (sobrescrito a cada run)
├── core/
│   ├── agents.py                 # + get_aiops_agent()  ← novo papel (o 5º da trilha)
│   └── llm_config.py             # Groq + RateLimitAwareLLM — reasoning_effort ajustado nesta aula
├── tools/
│   ├── aiops_tools.py            # ← NOVO: nl_to_promql, predictive_disk_alert,
│   │                             #         generate_grafana_dashboard
│   ├── file_writer.py            # herdado da 002/004 — não usado neste pipeline
│   ├── k8s_diag.py               # herdado da 004 — não usado neste pipeline
│   ├── obs_tools.py              # herdado da 004 — não usado neste pipeline
│   ├── k8s_ops.py                # herdado da 003 — não usado neste pipeline
│   ├── security_scan.py          # herdado da 002 — não usado neste pipeline
│   └── policy_rag.py             # herdado da 001 — não usado neste pipeline
├── tests/
│   ├── test_file_writer.py       # herdado da 004
│   └── test_k8s_ops.py           # herdado da 003
└── pyproject.toml
```

> Nota: `tools/file_writer.py` aqui é a cópia **anterior** ao ancoramento de diretório feito na 004 (`_OUTPUT_DIR`). Como nenhum agente desta aula recebe `write_file`, a divergência não afeta o pipeline — mas é bom saber que o arquivo herdado não é o mais recente.

## Como funciona

```
aiops.py
   │
   └─ aiops_agent = get_aiops_agent(tools=[nl_to_promql,
                                           predictive_disk_alert,
                                           generate_grafana_dashboard])
        │
        └─ Crew(agents=[aiops_agent], tasks=[task_aiops_workflow]).kickoff()
                 │
                 │  Task única — "lentidão no banco + suspeita de disco enchendo"
                 │
                 ├─ 1. nl_to_promql("qual a porcentagem de disco livre?")
                 │        └─ match por substring "disco"/"disk"
                 │              └─ node_filesystem_avail_bytes{mountpoint="/data"}
                 │                 / node_filesystem_size_bytes{mountpoint="/data"} * 100
                 │
                 ├─ 2. predictive_disk_alert("Uso atual 85%. Crescimento de 2GB/h")
                 │        └─ match por substring "crescimento"/"growth"
                 │              └─ 🚨 saturação de 100% em 4 horas (Prophet)
                 │
                 ├─ 3. generate_grafana_dashboard("Disk Saturation")
                 │        └─ monta o dict de painéis, json.dumps(indent=2)
                 │              └─ ESCREVE incident_dashboard.json no disco
                 │                    └─ retorna só a confirmação (não o JSON)
                 │
                 └─ resposta final: PromQL + alerta + JSON do dashboard
```

1. **Consulta** — a tradução NL→PromQL é a camada que democratiza o acesso à métrica. O agente decide *o que* perguntar; a tool devolve a query.
2. **Predição** — o alerta deixa de ser um limiar (`disco > 95%`) e passa a ser uma projeção de tendência, que entrega uma janela de ação em vez de um aviso tardio.
3. **Visualização** — a única tool com efeito colateral: o dashboard é materializado em disco, e o incidente ganha um painel dedicado sem ninguém abrir o Grafana para montá-lo.

## Conceitos trabalhados

- [x] **Observabilidade preditiva** — o objetivo de design invertido em relação à 004: antecipar a falha em vez de diagnosticá-la depois
- [x] **NL→PromQL como camada de acesso** — traduzir a pergunta de negócio para a linguagem de query é o que tira a métrica das mãos de um único time
- [x] **Alerta por tendência, não por limiar** — projetar a série temporal entrega janela de ação; o limiar entrega apenas o aviso
- [x] **Agente com efeito colateral** — `generate_grafana_dashboard` escreve no disco; as outras duas só devolvem texto, e essa assimetria muda o que pode ser repetido sem consequência
- [x] **Simplificação da orquestração** — um agente e uma task bastam quando a complexidade está nas ferramentas, não na coordenação; a 004 pagou caro pela delegação
- [x] **Prompt que nomeia a ferramenta** — quando o modelo consegue produzir o artefato de cabeça, o passo do enunciado precisa dizer *qual tool chamar*, senão o efeito colateral não acontece
- [x] **Acúmulo como método** — cinco papéis e sete módulos de tools convivem; este pipeline compõe apenas os três de que precisa

## Aprendizados

- [x] **A configuração de LLM herdada das aulas 001–004 quebrava esta aula em ~50% dos runs, e a causa era o `reasoning_effort`.** O sintoma: `GroqException - output_parse_failed` com `"failed_generation": ""`, sempre no **3º tool call** (`generate_grafana_dashboard`) — os dois primeiros passavam. Instrumentando `litellm.completion` e capturando a request rejeitada, a comparação com um run bem-sucedido mostrou que **as duas requests são idênticas byte a byte** (só mudam os IDs dos tool calls). Não era payload malformado: era o parser harmony da Groq falhando de forma não-determinística sobre a saída do `gpt-oss-20b`. Fazendo *replay* da mesma request isolando um parâmetro: `low` + temp 0.2 → **8/10 falhas**; `low` + temp 0.0 → **6/6 falhas**; `medium` → **0/6**; sem `reasoning_effort` → **0/6**. *Correção:* `reasoning_effort="medium"` só nesta aula. As 001–004 continuam em `low` — não testei o efeito da mudança nelas.
- [x] **Consertar o crash revelou um segundo bug que o crash escondia.** Com `medium`, o pipeline passou a terminar — mas `incident_dashboard.json` **não era escrito**: em 3/3 runs o modelo, raciocinando mais, concluiu que sabia montar o JSON do Grafana sozinho e respondeu inline, sem nunca chamar `generate_grafana_dashboard`. O enunciado original dizia "Crie um Dashboard dinâmico do Grafana" — uma instrução que descreve o *resultado*, e um LLM capaz atende descrevendo o resultado. *Correção:* reescrever a task nomeando as três ferramentas explicitamente e proibindo produzir o passo de cabeça. Depois disso, 5/5 runs completos com o arquivo gravado. A lição: **um pipeline que "termina sem erro" não é um pipeline que fez o trabalho** — o critério de sucesso tem que ser o artefato em disco, não o exit code.
- [x] **Os dois modos de falha do `gpt-oss-20b` na Groq puxam em direções opostas.** O comentário herdado no `llm_config.py` explicava que `low` existia para evitar `tool_use_failed` (JSON do tool call truncado porque o raciocínio comeu o orçamento de saída). Esta aula mostra o outro lado: com `low` demais, vem `output_parse_failed`. Não há um valor globalmente certo — o esforço de raciocínio é um parâmetro a calibrar por fluxo, e um pipeline com mais tool calls encadeados aguenta menos "economia" de raciocínio que um com menos.
- [x] **O agente chama `generate_grafana_dashboard` até 4 vezes no mesmo run, e a culpa é do contrato da tool.** Medido: em 3 dos 5 runs, o 3º passo se repetiu 4x. O motivo é que a tool grava o arquivo e retorna **só uma string de confirmação** (`"✅ Dashboard gerado com sucesso!"`), enquanto o `expected_output` da task pede "o JSON do dashboard". O modelo chama de novo esperando receber o JSON que a tool nunca devolve. Custo: os runs de 7 chamadas gastam ~8.800 tokens contra ~4.500 dos de 4 chamadas — quase o dobro, raspando o teto do free tier. **Tool que produz artefato deveria devolver o artefato**, não apenas a confirmação de que ele existe.
- [x] **As três tools são `if` sobre substring, e a "predição" não prediz nada.** `nl_to_promql` procura `"disco"`/`"disk"` no texto e devolve uma query fixa; `predictive_disk_alert` procura `"crescimento"`/`"growth"` e devolve "saturação em exatas 4 horas" — o número **não depende dos 85% nem dos 2GB/h** informados. Faça a conta com dados reais e daria outro valor. É a mesma fragilidade do OPA por substring da 002, do canário por regex da 003 e do `inspect_pod_failure` da 004, agora aplicada ao que a aula chama de Machine Learning. O que a aula ensina de verdade é a **arquitetura** de uma plataforma de AIOps (consulta → predição → visualização) e como um agente a encadeia; Prophet e Isolation Forest aparecem só como nome numa string.
- [x] **O `incident_dashboard.json` tem menos "dinâmico" do que o nome sugere.** Dos dois painéis gerados, apenas o `title` varia com o `incident_context` recebido; as queries dos painéis são constantes, e o segundo painel (`Error Rate Spike`) nem sequer tem relação com saturação de disco. Um dashboard realmente dinâmico usaria o PromQL que o passo 1 acabou de gerar — a informação está no contexto do agente e é simplesmente descartada. É o gancho mais óbvio para estender o exercício.

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [Prometheus — Querying basics (PromQL)](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana — Dashboard JSON model](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model/)
- [Prophet — Forecasting at scale](https://facebook.github.io/prophet/)
- [scikit-learn — Isolation Forest](https://scikit-learn.org/stable/modules/outlier_detection.html#isolation-forest)
- [Groq — Reasoning e `reasoning_effort`](https://console.groq.com/docs/reasoning)
- [OpenAI — gpt-oss e o formato Harmony](https://cookbook.openai.com/articles/openai-harmony)
- [Google SRE Book — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
