# Mapeamento de Conceitos: Nosso Framework → LangChain → LangGraph

## Tabela de Equivalencia

| Conceito | Nosso Framework | LangChain | LangGraph |
|----------|----------------|-----------|-----------|
| **Identidade do agente** | `agent.md` | Prompt template | `TypedDict` de estado |
| **Ferramentas/Skills** | `skills.md` + `toolbox.md` | `@tool` decorators | `@tool` decorators |
| **Planejador** | `contracts/planner.md` | `create_react_agent()` | No "planejar" do grafo |
| **Executor** | `contracts/executor.md` | `AgentExecutor` | No "executar" do grafo |
| **Ciclo principal** | `ciclo.py` + `contracts/loop.md` | `AgentExecutor.invoke()` | `grafo.compile().invoke()` |
| **Condicoes de parada** | `loop.md` (condicoes_parada) | `max_iterations` | `conditional_edges` |
| **Guardrails/Rules** | `rules.md` | Config manual no prompt | Logica nos nos do grafo |
| **Memoria** | `memory.md` + historico | `ConversationBufferMemory` | Estado do grafo |
| **Observabilidade** | `hooks.md` + `telemetria.py` | `verbose=True` / Callbacks | Callbacks / LangSmith |
| **Trace** | `trace.json` | LangSmith | LangSmith |
| **Circuit breaker** | `validar_resposta_llm()` | `handle_parsing_errors` | Try/except nos nos |
| **Eval/Benchmark** | `evals/` + `benchmark.py` | LangSmith Evals | LangSmith Evals |

## Arquiteturas

| Arquitetura | Nosso Framework | LangChain | LangGraph |
|-------------|----------------|-----------|-----------|
| **ReAct** | `architectures/react/planner.md` | `create_react_agent()` (padrao) | Grafo com loop think→act→observe |
| **Plan-Execute** | `architectures/plan_execute/planner.md` | `PlanAndExecute` chain | Grafo: planejar → executar → avaliar (loop) |
| **Reflection** | `architectures/reflect/critic.md` | Chain com step de revisao | Grafo com no "criticar" antes do END |

## Diferenca Fundamental

- **Nosso framework**: arquitetura definida por **contrato** (Markdown/YAML). Troca de arquitetura = troca de arquivo.
- **LangChain**: arquitetura definida por **composicao de classes** (Python). Troca de arquitetura = troca de codigo.
- **LangGraph**: arquitetura definida por **grafo de estados** (Python). Troca de arquitetura = troca de nos e edges.

O conceito e o mesmo. A representacao e diferente.

Quem entende o conceito, usa qualquer framework.
