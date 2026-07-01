# Exemplo 006 — Evals e Frameworks de Mercado: Comparando Arquiteturas Cognitivas e Equivalências com LangChain/LangGraph

> Adiciona um harness de avaliação (`benchmark`/`comparar`) que roda o mesmo dataset de incidentes contra 4 arquiteturas cognitivas (padrão, ReAct, Plan-and-Execute, Reflection) e mede taxa de conclusão, tokens, latência e cobertura de ferramentas — mais um mapeamento de conceitos linha a linha mostrando que os mesmos contratos do runtime equivalem a construções do LangChain e do LangGraph.

## Contexto
- Disciplina: Criação de Agentes
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição
Os projetos 001–005 construíram um runtime de agentes 100% orientado a contratos e, em 005, tornaram a arquitetura cognitiva plugável via `--arquitetura` (contratos `planner.md`/`executor.md` de `architectures/<nome>/` sobrescrevem os do agente). Este projeto responde à pergunta que fica em aberto depois disso: **qual arquitetura é melhor, e como eu meço isso?**

A resposta tem duas partes. A primeira é o **eval harness** (`runtime/benchmark.py`): um dataset de 5 cenários de incidente (`evals/datasets/incidentes.json`), cada um com dificuldade e ferramentas esperadas, é rodado contra uma arquitetura via `python main.py benchmark`, e as métricas de cada trace (taxa de conclusão, etapas, tokens, cobertura de ferramentas, qualidade das avaliações, reflexões) são agregadas e comparadas contra limiares declarados em `evals/suites/monitor-agent.yaml`. O novo comando `comparar` roda as 4 arquiteturas em sequência (padrão, `react`, `plan_execute`, `reflect`) contra o mesmo dataset e gera um relatório markdown comparativo (`gerar_relatorio_comparativo`) com a melhor arquitetura por eficiência de tokens, cobertura e velocidade.

Para viabilizar essa comparação, o projeto introduz duas arquiteturas novas em `architectures/`, seguindo o mesmo padrão de 005: **Plan-and-Execute** (`plan_execute/`) gera o plano completo numa única chamada à LLM e o `ciclo.py` o executa passo a passo sem chamar a LLM de novo — o modo `modo_execucao: plan_execute` no contrato do planejador é o que aciona esse fluxo determinístico em `ciclo.py`. **Reflection** (`reflect/critic.md`) adiciona uma fase de autocrítica: quando o planejador decide `FINALIZAR`, `_executar_critica` avalia as evidências coletadas contra critérios declarados (corretude, completude, qualidade da evidência), e se a nota ficar abaixo do `limiar_aprovacao`, o agente recebe os problemas e sugestões e é redirecionado para corrigir, até `max_reflexoes` vezes.

A segunda parte é conceitual: `equivalencias/MAPEAMENTO.md` e os três scripts `01_nosso_framework.py`/`02_langchain_react.py`/`03_langgraph_plan_execute.py` implementam o **mesmo agente de monitoramento** três vezes — uma via contratos (nosso framework, sem código de domínio), uma via `AgentExecutor`/`create_react_agent` do LangChain, e uma via `StateGraph` do LangGraph — para mostrar que `agent.md` ≈ prompt template ≈ `TypedDict` de estado, `skills.md` ≈ `@tool`, `planner.md` ≈ nó de planejamento, e assim por diante. A diferença fundamental documentada: no nosso framework a arquitetura é um **contrato** (trocar Markdown troca comportamento), no LangChain é **composição de classes**, no LangGraph é um **grafo de estados** — o conceito é o mesmo, a representação muda.

Os três agentes de domínio (`monitor-agent`, `backlog-decomposer`, `trace-analyzer`) permanecem inalterados desde 003/004 — o `comparar` usa o `monitor-agent` como agente sob teste, e o `trace-analyzer` continua disponível para diagnosticar qualquer trace individual gerado durante os benchmarks.

## Tecnologias e Ferramentas
- [x] **Python 3** — runtime do agente e eval harness (stdlib: `argparse`, `pathlib`, `json`, `time`, `uuid`)
- [x] **PyYAML** — parse dos contratos `.md` e da eval suite `monitor-agent.yaml`
- [x] **OpenAI SDK** (`gpt-4o-mini`, `response_format=json_object`) — planejador, ferramentas e crítico (Reflection) via LLM
- [x] **python-dotenv** — carga da `OPENAI_API_KEY`
- [x] **LangChain** (`langchain`, `langchain-openai`) — didático, na equivalência ReAct (`02_langchain_react.py`)
- [x] **LangGraph** — didático, na equivalência Plan-and-Execute (`03_langgraph_plan_execute.py`)
- [x] **Contratos Markdown/YAML** — definição declarativa de agentes, arquiteturas cognitivas e eval suites

## Pré-requisitos
- **Python 3.10+** e `pip`
- (Opcional) **`OPENAI_API_KEY`** em `runtime/.env` — sem ela os agentes e o crítico rodam em modo mock (planejador determinístico, primeira reflexão sempre rejeita e a segunda aprova)
- (Opcional, só para rodar `equivalencias/02_langchain_react.py` e `03_langgraph_plan_execute.py`) `pip install langchain langchain-openai langgraph`

## Como executar
```bash
cd disciplinas/04-criacao-de-agentes/projects/006-evals-e-frameworks-mercado/runtime
pip install -r requirements.txt
cp .env.example .env   # opcional: preencher OPENAI_API_KEY

# rodar um agente com uma arquitetura especifica
python main.py rodar --agente ../monitor-agent --entrada "alerta de latencia" --arquitetura plan_execute
python main.py rodar --agente ../monitor-agent --entrada "alerta de latencia" --arquitetura reflect

# benchmark: uma arquitetura contra o dataset de eval
python main.py benchmark --agente ../monitor-agent --suite ../evals/suites/monitor-agent.yaml --arquitetura react

# comparar: roda as 4 arquiteturas (padrao, react, plan_execute, reflect) e gera relatorio comparativo
python main.py comparar --agente ../monitor-agent --suite ../evals/suites/monitor-agent.yaml
# -> ../benchmarks/report.md

# equivalencias com frameworks de mercado (leitura/execucao independente)
python ../equivalencias/02_langchain_react.py         # requer langchain + langchain-openai
python ../equivalencias/03_langgraph_plan_execute.py  # requer langgraph
```

## Estrutura do Projeto
```
006-evals-e-frameworks-mercado/
├── architectures/
│   ├── react/                    # (de 005) raciocinio explicito antes de agir
│   ├── plan_execute/              # NOVO: plano completo gerado 1x, executado sem nova chamada a LLM
│   │   ├── planner.md             # modo_execucao: plan_execute + formato_saida.plano_completo
│   │   └── executor.md
│   └── reflect/                   # NOVO: autocritica antes de finalizar
│       ├── planner.md
│       ├── executor.md
│       └── critic.md              # criterios, limiar_aprovacao, max_reflexoes
│
├── evals/
│   ├── datasets/incidentes.json   # 5 cenarios com dificuldade + ferramentas_esperadas
│   └── suites/monitor-agent.yaml  # metricas coletadas + limiares de aprovacao
│
├── equivalencias/
│   ├── 01_nosso_framework.py      # so comentarios: mapeia os 9 contratos aos conceitos
│   ├── 02_langchain_react.py      # mesmo agente via AgentExecutor + create_react_agent
│   ├── 03_langgraph_plan_execute.py  # mesmo agente via StateGraph
│   └── MAPEAMENTO.md              # tabela de equivalencia nosso-framework x LangChain x LangGraph
│
├── monitor-agent/  backlog-decomposer/  trace-analyzer/   # agentes de dominio, inalterados desde 003-004
│
└── runtime/
    ├── benchmark.py    # NOVO: roda dataset, agrega metricas, gera relatorio comparativo
    ├── ciclo.py         # + fluxo plan_execute (segue plano sem chamar LLM) + fase de reflexao
    ├── contratos.py     # carrega critic.md quando a arquitetura o declarar
    ├── main.py           # + subcomandos benchmark e comparar
    ├── planejador.py  ferramentas.py  executor.py  telemetria.py  validador.py   # papeis inalterados
```

## Como funciona

**Plan-and-Execute** — o plano é gerado uma única vez, na primeira etapa:
```
etapa 1: chamar_llm() -> {plano_completo: [passo1, passo2, ...], proxima_acao: CHAMAR_FERRAMENTA (passo1)}
         estado["plano_completo"] = [passo2, passo3, ...]   # restante fica guardado no estado
etapa 2..N: plano_armazenado existe -> NAO chama a LLM
            passo = plano_armazenado.pop(0)
            plano = {proxima_acao: CHAMAR_FERRAMENTA, nome_ferramenta: passo["ferramenta"], ...}
```
Tokens de planejamento ficam zerados a partir da etapa 2 — é essa a métrica (`tokens_planejamento`) que o benchmark usa para provar a economia frente ao ReAct, que chama a LLM a cada etapa.

**Reflection** — a autocrítica intercepta a decisão de finalizar:
```
planner decide FINALIZAR
  -> contrato "critico" existe? sim
      -> _executar_critica(estado, criterios, limiar_aprovacao)
           nota < limiar_aprovacao?
             sim -> reflexoes_feitas += 1; plano redirecionado para a ferramenta sugerida na critica
             nao -> FINALIZAR de fato
      -> reflexoes_feitas >= max_reflexoes? finaliza mesmo sem aprovacao (evita loop infinito)
```

**Benchmark/Comparar** — cada cenário do dataset roda isoladamente, com trace descartado ao final:
```
para cada cenario do dataset:
  estado = ciclo.rodar(agente, entrada=cenario["entrada"], arquitetura=X, saida=trace_temporario)
  metricas = extrair_metricas_trace(estado, cenario)  # conclusao, etapas, tokens, cobertura, qualidade
agregado = media/soma de todas as metricas + violacoes de limiares (evals/suites/*.yaml)
comparar: repete o benchmark para [padrao, react, plan_execute, reflect] e monta tabela markdown
          destacando em negrito o melhor valor de cada metrica entre as 4 arquiteturas
```

## Conceitos trabalhados
- [x] **Eval harness dirigido por dataset** — `evals/datasets/*.json` + `evals/suites/*.yaml` (métricas e limiares) desacoplados do código do benchmark
- [x] **Plan-and-Execute** — planejamento em uma única chamada à LLM, execução determinística do plano armazenado no estado
- [x] **Reflection** — ciclo `execute → critique → improve → finalize` com limiar de aprovação e teto de reflexões para evitar loop de perfeccionismo
- [x] **Comparação empírica de arquiteturas** — mesma tarefa, mesmo dataset, métricas objetivas (tokens, cobertura, tempo) em vez de opinião sobre qual arquitetura é "melhor"
- [x] **Equivalência conceitual entre frameworks** — os mesmos 9 contratos do runtime mapeados linha a linha para `AgentExecutor`/`create_react_agent` (LangChain) e `StateGraph` (LangGraph)
- [x] **Arquitetura como contrato substituível** (de 005, reaproveitado) — `plan_execute` e `reflect` seguem o mesmo mecanismo de sobrescrita via `architectures/<nome>/` sem tocar no runtime
- [x] **Trade-off tokens × qualidade × velocidade** — Plan-and-Execute economiza tokens de planejamento mas perde adaptabilidade; Reflection gasta mais tokens/tempo mas aumenta a taxa de aprovação

## Aprendizados
- [x] Medir arquitetura cognitiva exige o mesmo rigor de qualquer eval de ML: dataset fixo, métricas declaradas antes de rodar, limiares objetivos — não é "rodar uma vez e achar que ficou bom".
- [x] Plan-and-Execute só é barato em tokens de planejamento porque o plano vira dado no estado (`estado["plano_completo"]`), não porque a LLM "pensa menos" — ela só pensa uma vez em vez de N.
- [x] O limiar de reflexão (`max_reflexoes`) é o guardrail que evita que "autocrítica" vire "loop infinito de refinamento" — o mesmo padrão anti-estagnação (`sem_progresso`) já usado nas regras do agente desde 001.
- [x] Reimplementar o mesmo agente em LangChain e LangGraph deixou claro que "framework de agente" é sempre a mesma dobradiça — planejador, executor, memória, guardrails, observabilidade — só muda se ela é expressa em Markdown, decorators Python ou nós de grafo.
- [x] `comparar` só é útil porque `benchmark` isola cada cenário com trace descartável — sem esse isolamento, tokens e etapas de um cenário vazariam para o próximo e a métrica agregada mentiria.

## Referências
- [001-contratos](../001-contratos/README.md) — definição declarativa do agente
- [002-runtime](../002-runtime/README.md) — internos do runtime
- [003-observabilidade](../003-observabilidade/README.md) — agente que analisa outro agente (`trace-analyzer`)
- [004-tipos-agentes-e-projetos](../004-tipos-agentes-e-projetos/README.md) — tipos de agente e múltiplos domínios
- [005-arquiteturas-cognitivas](../005-arquiteturas-cognitivas/README.md) — arquitetura cognitiva plugável via contrato (ReAct)
- [equivalencias/MAPEAMENTO.md](equivalencias/MAPEAMENTO.md) — tabela de equivalência nosso framework × LangChain × LangGraph
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [Reflexion: Language Agents with Verbal Reinforcement Learning](https://arxiv.org/abs/2303.11366)
- [LangChain — Agents](https://python.langchain.com/docs/how_to/#agents)
- [LangGraph — StateGraph](https://langchain-ai.github.io/langgraph/concepts/low_level/)
