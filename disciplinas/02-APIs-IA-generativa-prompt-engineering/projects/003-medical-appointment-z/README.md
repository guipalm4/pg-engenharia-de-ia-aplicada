# Exemplo 003 — Agendamento Médico Conversacional com LangGraph

> Sistema de agendamento de consultas por linguagem natural: grafo de estado (LangGraph) com roteamento condicional real, extração de entidades via structured output e API Fastify.

## Contexto

- Disciplina: APIs de IA Generativa e Prompt Engineering
- Período: Maio/2026
- Autor: guipalm4

## Descrição

Este projeto implementa um assistente conversacional de clínica médica que permite agendar e cancelar consultas através de mensagens em linguagem natural. O usuário envia uma frase livre (ex.: "Quero agendar uma consulta com a Dra. Ana Pereira para amanhã às 14h") e o sistema interpreta a intenção, extrai as entidades relevantes e executa a ação correspondente.

O coração da aplicação é um `StateGraph` do LangGraph com quatro nós: `identifyIntent`, `schedule`, `cancel` e `message`. Após a identificação da intenção, arestas condicionais roteiam o fluxo diretamente para o nó de agendamento ou cancelamento. Ao final, o nó de geração de mensagem produz uma resposta amigável em português para o paciente.

Toda comunicação com o LLM usa **structured outputs** via Zod — o modelo retorna JSON validado por schema, evitando alucinações e eliminando parsing frágil de texto livre. O serviço de agendamento é in-memory com verificação de conflitos de horário. O projeto também inclui suporte ao **LangGraph Studio** e ao **LangSmith** para visualização e rastreamento do grafo em tempo real.

## Tecnologias e Ferramentas

- [x] Node.js ≥ 24.10.0 — TypeScript nativo com ESM (sem transpile)
- [x] LangGraph (`@langchain/langgraph`) — StateGraph com arestas condicionais
- [x] LangChain (`@langchain/core`, `@langchain/openai`, `langchain`) — orquestração de LLM
- [x] OpenRouter — gateway de LLMs (modelo gratuito `arcee-ai/trinity-large-preview:free`)
- [x] Zod v3 — structured outputs e validação de estado do grafo
- [x] Fastify v5 — servidor HTTP com validação de schema
- [x] LangSmith — rastreamento e observabilidade de chamadas LLM
- [x] LangGraph Studio — visualização interativa do grafo

## Pré-requisitos

- Chave de API do OpenRouter (`OPENROUTER_API_KEY`)
- Opcionalmente: chave do LangSmith para rastreamento (`LANGSMITH_API_KEY`)

## Como executar

```bash
# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com sua OPENROUTER_API_KEY

# Iniciar servidor HTTP
npm start
# Servidor disponível em http://localhost:3000

# Exemplo de chamada
curl -X POST -H 'Content-type: application/json' \
  --data '{"question": "Sou Maria Santos e quero agendar com o Dr. Alicio da Silva amanhã às 16h para check-up"}' \
  localhost:3000/chat

# Rodar testes e2e (requer API key)
npm run test:e2e

# Abrir no LangGraph Studio
npm run langgraph:serve
```

## Estrutura do Projeto

```
src/
  ├── config.ts                        # Configuração de modelo e OpenRouter
  ├── index.ts                         # Entry point (inicia Fastify na porta 3000)
  ├── server.ts                        # Servidor Fastify com rota POST /chat
  ├── graph/
  │   ├── graph.ts                     # StateGraph: nós, arestas condicionais e schema Zod do estado
  │   ├── factory.ts                   # Instancia serviços e compila o grafo
  │   └── nodes/
  │       ├── identifyIntentNode.ts    # Classifica intenção e extrai entidades via LLM
  │       ├── schedulerNode.ts         # Valida campos e agenda a consulta
  │       ├── cancellerNode.ts         # Valida campos e cancela a consulta
  │       └── messageGeneratorNode.ts  # Gera resposta amigável em português via LLM
  ├── prompts/v1/
  │   ├── identifyIntent.ts            # System/user prompt para classificação de intenção
  │   └── messageGenerator.ts         # System/user prompt para geração de mensagem
  └── services/
      ├── appointmentService.ts        # CRUD in-memory de consultas com verificação de conflito
      └── openRouterService.ts         # Cliente LLM com suporte a structured output (Zod)
tests/
  └── router.e2e.test.ts               # Testes e2e via Fastify inject (sem mock)
langgraph.json                         # Configuração do LangGraph Studio
```

## Como funciona

```
POST /chat { question: "..." }
        │
        ▼
  [identifyIntent] ──── LLM (structured output) ────▶ { intent, professionalId, datetime, patientName, ... }
        │
        ├─── intent === 'schedule' ──▶ [schedule] ──▶ bookAppointment()
        │
        ├─── intent === 'cancel'   ──▶ [cancel]   ──▶ cancelAppointment()
        │
        └─── intent === 'unknown'  ──▶ ┐
                                       ▼
                                   [message] ──── LLM (structured output) ────▶ { message: "..." }
                                       │
                                       ▼
                                   resposta JSON ao cliente
```

O estado do grafo carrega todo o contexto da conversa: `messages`, `intent`, `patientName`, `professionalId`, `datetime`, `reason`, `actionSuccess`, `actionError` e `appointmentData`. Cada nó lê o que precisa e retorna apenas as chaves que atualiza — o LangGraph faz o merge via `StateGraph`.

## Conceitos trabalhados

- [x] **Roteamento condicional** — `addConditionalEdges` roteia para nó diferente com base no valor de `state.intent` após a classificação
- [x] **Structured outputs com Zod** — o LLM retorna JSON validado por schema (`IntentSchema`, `MessageSchema`), eliminando parsing de texto livre
- [x] **Extração de entidades** — o prompt de intenção instrui o LLM a extrair professional ID, datetime em ISO, nome do paciente e motivo em uma única chamada
- [x] **Prompt engineering com JSON** — system prompts são objetos JSON serializados com `role`, `task`, `rules`, `examples` — mais estruturado e fácil de versionar
- [x] **Injeção de dependência em nós** — cada nó é uma factory function que recebe `llmClient` ou `appointmentService` como parâmetro
- [x] **Validação com Zod antes da ação** — `schedulerNode` e `cancellerNode` validam campos obrigatórios do estado antes de qualquer operação
- [x] **LangGraph Studio** — grafo exportado via `langgraph.json` para inspeção visual interativa
- [x] **LangSmith tracing** — rastreamento de todas as chamadas LLM para debugging e análise de custo

## Aprendizados

- [x] Usar structured outputs é mais confiável do que pedir ao LLM para formatar em texto e depois parsear — o schema Zod força o contrato de saída
- [x] Prompts em formato JSON (não texto livre) são mais previsíveis para extração de entidades: o LLM "vê" o schema implicitamente
- [x] O `addConditionalEdges` elimina a necessidade de um nó de decisão dedicado — a lógica de roteamento fica declarativa no grafo
- [x] Separar `identifyIntent` de `schedule`/`cancel` mantém cada nó com responsabilidade única e facilita testes independentes
- [x] O LangGraph Studio + LangSmith juntos tornam o debugging de fluxos multi-nó muito mais observável do que logs em console

## Referências

- [LangGraph — StateGraph](https://langchain-ai.github.io/langgraphjs/)
- [LangChain — Structured Output](https://js.langchain.com/docs/how_to/structured_output/)
- [OpenRouter — Free Models](https://openrouter.ai/models?fmt=cards&max_price=0)
- [LangSmith — Tracing](https://docs.smith.langchain.com/)
- [Fastify v5](https://fastify.dev/docs/latest/)
