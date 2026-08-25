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

Esta é a primeira aula da trilha em que **a configuração herdada do LLM quebrou o pipeline**, e a investigação acabou mudando as cinco aulas. O `reasoning_effort="low"` que as 001–004 usavam fazia a Groq recusar o 3º tool call deste fluxo em ~80% das tentativas; ao testar os outros modelos do free tier para resolver, apareceu a causa real dos `RateLimitError` que matavam o pipeline — o retry lia mal o formato de tempo da Groq. As correções (modelo padrão trocado para `qwen/qwen3.6-27b` via `GROQ_MODEL`, `max_tokens` destravado e parser de espera consertado) foram aplicadas nas cinco aulas. O enunciado da task permanece o **original** do material — a solução foi de runtime, não de prompt. Detalhes em *Aprendizados*.

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

- [x] O parser do provedor falha de forma não-determinística com modelos pequenos: o `gpt-oss-20b` quebrava o 3º tool call com `output_parse_failed`, e trocar o `GROQ_MODEL` resolveu sem tocar no enunciado
- [x] Um pipeline que termina sem erro não é um pipeline que fez o trabalho — o critério de sucesso é o artefato em disco, não o exit code
- [x] O que a Groq debita é o consumo real: o `Requested = prompt + max_tokens` das mensagens de 429 é checagem de admissão contra o saldo, não valor cobrado, então capar `max_tokens` não economiza e ainda arrisca truncar
- [x] Um teste cujos blocos compartilham um recurso que se esgota não compara nada: quem roda depois sempre perde, e o efeito acaba creditado à variável errada
- [x] Retry de rate limit precisa entender o formato de duração do provedor (`3m9.648s`, `547ms`) e desistir com instrução quando a espera indicar cota diária
- [x] Tool que produz artefato deveria devolver o artefato: retornar só `"gerado com sucesso"` faz o agente chamá-la de novo esperando o conteúdo

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [Prometheus — Querying basics (PromQL)](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [Grafana — Dashboard JSON model](https://grafana.com/docs/grafana/latest/dashboards/build-dashboards/view-dashboard-json-model/)
- [Prophet — Forecasting at scale](https://facebook.github.io/prophet/)
- [scikit-learn — Isolation Forest](https://scikit-learn.org/stable/modules/outlier_detection.html#isolation-forest)
- [Groq — Reasoning e `reasoning_effort`](https://console.groq.com/docs/reasoning)
- [OpenAI — gpt-oss e o formato Harmony](https://cookbook.openai.com/articles/openai-harmony)
- [Google SRE Book — Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/)
