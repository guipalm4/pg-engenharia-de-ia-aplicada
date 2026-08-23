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

Esta é a primeira aula da trilha em que **a configuração herdada do LLM quebrou o pipeline**, e a investigação acabou mudando as cinco aulas. O `reasoning_effort="low"` que as 001–004 usavam fazia a Groq recusar o 3º tool call deste fluxo em ~80% das tentativas; ao testar os outros modelos do free tier para resolver, apareceu a causa raiz de todos os rate limits da disciplina — a Groq **reserva** `max_tokens` do orçamento em vez de cobrar o consumo real. As duas correções (modelo padrão trocado para `qwen/qwen3.6-27b` via `GROQ_MODEL`, e `max_tokens` de 4096 para 2560) foram aplicadas nas cinco aulas. O enunciado da task permanece o **original** do material — a solução foi de runtime, não de prompt. Detalhes em *Aprendizados*.

## Tecnologias e Ferramentas

- [x] **Python 3.12** — runtime dos agentes
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — orquestração `Agent`/`Task`/`Crew`, aqui com um único agente e uma única task
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** (`qwen/qwen3.6-27b`, trocável por `GROQ_MODEL` no `.env`) — motor de inferência dos agentes (free tier)
- [x] **PromQL / Prometheus** — linguagem-alvo da tradução em `nl_to_promql`
- [x] **Grafana** — destino do dashboard gerado (JSON de importação)
- [x] **Prophet / Isolation Forest** — algoritmos de série temporal **citados**, aqui simulados por resposta roteirizada
- [x] **pytest** — testes dos helpers herdados das aulas anteriores
- [x] **uv (workspace)** — ambiente único compartilhado por todas as aulas da disciplina

## Pré-requisitos

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python e as dependências
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`)

> ⚠️ **Se aparecer `RateLimitError`:** o `RateLimitAwareLLM` pausa e repete sozinho — mensagens `⏳ Aguardando Ns` são a proteção funcionando. Mas se ele avisar que a Groq pediu **minutos** de espera, é a cota **diária** (200.000 tokens/dia, contada por modelo) e esperar não resolve: troque `GROQ_MODEL` no `.env` (`groq/openai/gpt-oss-120b` tem cota própria) ou volte mais tarde.

> ⚠️ Consumo medido em 7 execuções com o modelo padrão (`qwen/qwen3.6-27b`): **1.900 a 3.500 tokens por run**, em 4 chamadas ao LLM, ~7s de parede. O free tier da Groq tem dois limites — **8.000 tokens/minuto** e **200.000 tokens/dia**, este último invisível nos headers da API. Nesta aula os dois ficam folgados. O `RateLimitAwareLLM` (`core/llm_config.py`) segura o pipeline pausando se ainda assim bater, imprimindo `⏳ Limite de tokens/minuto da Groq atingido` — é a proteção funcionando, não erro.
>
> Para comparação, o antigo padrão `openai/gpt-oss-20b` gastava 4.500 a 8.800 tokens no mesmo pipeline, raspando o teto por minuto sozinho.

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
│   └── llm_config.py             # Groq + RateLimitAwareLLM — modelo por GROQ_MODEL,
│                                 #   max_tokens recalibrado nesta aula (vale p/ as 5)
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
- [x] **Escolha de modelo como decisão de arquitetura** — o mesmo enunciado e as mesmas tools entregam 50% ou 100% de sucesso conforme o modelo; e o teto de `max_tokens` decide quantas chamadas cabem no orçamento antes do rate limit
- [x] **Acúmulo como método** — cinco papéis e sete módulos de tools convivem; este pipeline compõe apenas os três de que precisa

## Aprendizados

- [x] **A configuração de LLM herdada das aulas 001–004 quebrava esta aula em ~50% dos runs.** O sintoma: `GroqException - output_parse_failed` com `"failed_generation": ""`, sempre no **3º tool call** (`generate_grafana_dashboard`) — os dois primeiros passavam. Instrumentando `litellm.completion` e capturando a request rejeitada, a comparação com um run bem-sucedido mostrou que **as duas requests são idênticas byte a byte** (só mudam os IDs dos tool calls). Não era payload malformado: era o parser harmony da Groq falhando de forma não-determinística sobre a saída do `gpt-oss-20b`. Fazendo *replay* da mesma request isolando um parâmetro: `reasoning_effort="low"` + temp 0.2 → **8/10 falhas**; `low` + temp 0.0 → **6/6**; `medium` → **0/6**. A primeira correção foi subir para `medium`, e ela funcionou — mas não era a melhor.
- [x] **Consertar o crash revelou um segundo bug que o crash escondia.** Com `medium`, o pipeline passou a terminar — mas `incident_dashboard.json` **não era escrito**: em 3/3 runs o modelo, raciocinando mais, concluiu que sabia montar o JSON do Grafana sozinho e respondeu inline, sem nunca chamar `generate_grafana_dashboard`. O enunciado diz "Crie um Dashboard dinâmico do Grafana" — uma instrução que descreve o *resultado*, e um LLM capaz atende descrevendo o resultado. A lição vale além desta aula: **um pipeline que "termina sem erro" não é um pipeline que fez o trabalho** — o critério de sucesso é o artefato em disco, não o exit code.
- [x] **Trocar o modelo resolveu os dois bugs de uma vez, e sem tocar no enunciado.** Testados os 3 modelos do free tier da Groq com tool calling (`compound` e `compound-mini` têm 70.000 TPM mas a API recusa: `tool calling is not supported with this model`). No replay da chamada que quebra: `qwen/qwen3.6-27b` **8/8** e `gpt-oss-120b` **8/8**, ambos sem falha de parse — inclusive o 120b no mesmo `reasoning_effort="low"` que derruba o 20b, o que mostra que **o bug é fraqueza do 20b, não do formato harmony**. E com o qwen o pipeline chama as três tools sozinho: **7/7 runs com o dashboard escrito, usando o enunciado ORIGINAL da aula**. Por isso o reforço de prompt que eu tinha adicionado foi revertido — a solução certa era o modelo, e o texto didático voltou ao original.
- [x] **A causa raiz dos rate limits de toda a trilha não era o modelo: era `max_tokens`.** A Groq **reserva** `max_tokens` do orçamento no momento da chamada, em vez de cobrar o consumo real — e a própria mensagem de erro entrega isso: `Requested 2059` para um prompt de 11 tokens com `max_tokens=2048`. Vale para os dois limites (8.000/minuto e 200.000/dia). Com o `max_tokens=4096` herdado, o orçamento **diário** comportava só ~48 chamadas de LLM e a janela de minuto comportava **uma**, independente do modelo escolhido. Medido: com 4096 passa 1 chamada por janela (consumo real: 184 tokens); com 600, passam 3. Ajustado para **2560** — 44% de folga sobre a maior resposta já observada (2.051 tokens) e 37% menos reserva. Note que meu primeiro chute, 2048, teria truncado: dimensionei por uma medição antiga (1.489) antes de ver a real.
- [x] **O retry de rate limit lia mal o relógio da Groq, e por isso o pipeline morria.** O `RateLimitAwareLLM` herdado extraía o tempo de espera com `re.search(r"try again in ([\d.]+)s")` — que só entende segundos puros. A Groq também responde `3m9.648s`, `24m3.744s` e `547ms`, e nesses casos o parser caía num fallback de 35s. Com 4 tentativas, isso dava ~105s de espera máxima; quando a cota **diária** estourava a Groq pedia 7 a 24 minutos, e o pipeline morria com `RateLimitError` cru depois de esperar em vão. *Correção:* parser de duração composta (`h`/`m`/`s`/`ms`), 6 tentativas, e um teto de 180s acima do qual ele **desiste na hora com instrução** — porque espera de 24 min é cota diária, e esperar não resolve dentro de uma aula. Medido depois: 3 runs consecutivos sem pausa, 3/3 com o dashboard escrito, esperas reais de 2 a 16s no lugar do chute de 35s. Tem teste de regressão em `tests/test_rate_limit_espera.py`.
- [x] **A cota diária é por modelo, e isso é a saída de emergência.** Os 200.000 tokens/dia são contados separadamente para cada modelo. Quando o padrão esgota, `GROQ_MODEL=groq/openai/gpt-oss-120b` no `.env` destrava o laboratório na hora, com orçamento zerado — foi assim que validei esta correção com a cota do qwen zerada. A mensagem de erro do `RateLimitAwareLLM` diz isso ao aluno em vez de deixá-lo adivinhando.
- [x] **O modelo virou env var porque a Groq já matou dois modelos deste material.** O enunciado original usava `llama-3.1-8b-instant` (removido, a API responde `model_not_found`), e a Groq também descontinuou `qwen/qwen3-32b` e `qwen-qwq-32b`. O padrão agora é `GROQ_MODEL` no `.env`: quando o próximo sair do catálogo, é uma linha trocada em vez de cinco `llm_config.py` editados e um dia de depuração. **O trade-off é consciente:** `qwen3.6-27b` é catálogo *Preview* ("may be discontinued at short notice") enquanto os `gpt-oss` são *Production*. Escolhi o qwen porque é o único que mantém **todas** as cinco aulas abaixo do teto por minuto (o `gpt-oss-120b` estoura na 002 com 10.025 e na 004 com 11.007), e o env var é justamente o que torna o risco de Preview barato.
- [x] **O agente chama `generate_grafana_dashboard` até 4 vezes no mesmo run, e a culpa é do contrato da tool.** Observado com o `gpt-oss-20b`: em 3 de 5 runs o 3º passo se repetiu 4x. O motivo é que a tool grava o arquivo e retorna **só uma string de confirmação** (`"✅ Dashboard gerado com sucesso!"`), enquanto o `expected_output` da task pede "o JSON do dashboard". O modelo chama de novo esperando receber o JSON que a tool nunca devolve. Custo: os runs de 7 chamadas gastavam ~8.800 tokens contra ~4.500 dos de 4 chamadas. Com o qwen o sintoma some (1 chamada, 7/7 runs), mas **o defeito de contrato continua lá** — só deixou de ser exercitado. **Tool que produz artefato deveria devolver o artefato**, não apenas a confirmação de que ele existe.
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
