# Exemplo 004 — Recomendador de Músicas com Memória Persistente

> Chatbot conversacional de recomendação musical com grafo LangGraph, memória por usuário em PostgreSQL e sumarização automática de histórico.

## Contexto

- **Disciplina:** 02 — APIs de IA Generativa e Prompt Engineering
- **Autor:** guipalm4

## Descrição

Este projeto implementa um assistente de recomendação musical que se lembra de cada usuário entre sessões. A cada conversa, o modelo extrai preferências (nome, idade, gêneros e artistas favoritos, humor) e as persiste em SQLite via `PreferencesService`. O histórico da thread é salvo em PostgreSQL usando o checkpointer do LangGraph — garantindo que o contexto sobreviva ao reinício do processo.

Quando a conversa atinge o limite configurado (`maxMessagesToSummary`), o nó de sumarização comprime a história em um objeto estruturado (Zod) e descarta as mensagens antigas, evitando crescimento ilimitado da janela de contexto. Nas conversas seguintes, o assistente retoma o contexto do usuário instantaneamente a partir do resumo armazenado.

O projeto também expõe o grafo via `@langchain/langgraph-cli`, podendo ser inspecionado no LangGraph Studio sem alteração de código.

## Tecnologias e Ferramentas

- [x] **LangGraph** (`StateGraph`, checkpointer, store, `RemoveMessage`)
- [x] **TypeScript** + Node.js 24+ (ESM, `--experimental-strip-types`)
- [x] **OpenRouter** via `ChatOpenAI` (`langchain/openai`) como gateway de LLM
- [x] **PostgreSQL** (`@langchain/langgraph-checkpoint-postgres`) — checkpointer e store
- [x] **SQLite** (`better-sqlite3` + `knex`) — preferências por usuário
- [x] **Zod** — structured output para respostas do chat e sumarização
- [x] **LangSmith** — tracing de execuções
- [x] **Docker Compose** — PostgreSQL em container local

## Pré-requisitos

- Node.js ≥ 24.10
- Docker (para o PostgreSQL)
- Conta no [OpenRouter](https://openrouter.ai) com API key
- Conta no [LangSmith](https://smith.langchain.com) com API key (opcional, para tracing)

## Como executar

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Preencher OPENROUTER_API_KEY e LANGSMITH_API_KEY no .env

# 3. Subir o PostgreSQL
npm run docker:up

# 4. Iniciar o chat como usuário "erickwendel"
npm run chat:erickwendel

# Ou como outro usuário
npm run chat:ana

# 5. (Opcional) Servir o grafo no LangGraph Studio
npm run langgraph:serve
```

## Estrutura do Projeto

```
src/
├── config.ts                        # Configurações globais (modelos, DB, limites)
├── index.ts                         # CLI interativo (readline)
├── graph/
│   ├── factory.ts                   # Monta o grafo injetando serviços
│   ├── graph.ts                     # Definição do StateGraph e compilação
│   └── nodes/
│       ├── chatNode.ts              # Responde e extrai preferências
│       ├── savePreferencesNode.ts   # Persiste preferências no SQLite
│       ├── summarizationNode.ts     # Sumariza e descarta mensagens antigas
│       └── edgeConditions.ts        # Lógica de roteamento entre nós
├── prompts/v1/
│   ├── chatResponse.ts              # Schemas e prompts do nó de chat
│   └── summarization.ts             # Schemas e prompts do nó de sumarização
└── services/
    ├── memoryService.ts             # Cria checkpointer + store (PostgreSQL)
    ├── openrouterService.ts         # Wrapper para ChatOpenAI + structured output
    └── preferencesService.ts        # CRUD de preferências no SQLite
tests/
└── chat.e2e.test.ts                 # Testes e2e do grafo completo
```

## Como funciona

```
START
  │
  ▼
[chat] ──── tem extractedPreferences? ──yes──► [savePreferences]
  │                                                    │
  │◄─── não ◄─── needsSummarization? ◄────────────────┘
  │
  ├── needsSummarization = true ──► [summarize] ──► END
  └── needsSummarization = false ──────────────────► END
```

1. **chat**: recebe a mensagem, constrói o system prompt com o contexto do usuário, chama o LLM via structured output e determina se precisa salvar preferências ou sumarizar.
2. **savePreferences**: faz merge das preferências extraídas com o perfil existente no SQLite (gêneros e bandas são acumulados por `Set`).
3. **summarize**: pede ao LLM um resumo estruturado da conversa, armazena no SQLite e descarta as mensagens antigas com `RemoveMessage`, mantendo apenas as 2 últimas.

## Conceitos trabalhados

- [x] **Grafo de estado condicional** — `addConditionalEdges` com múltiplas saídas tipadas
- [x] **Structured output com Zod** — `providerStrategy(schema)` garante resposta validada pelo schema
- [x] **Memória de longo prazo com PostgreSQL** — `PostgresSaver` (checkpointer) e `PostgresStore` (store) persistem o estado entre processos
- [x] **Sumarização de histórico** — comprime a janela de contexto ao atingir o limite, preservando o perfil acumulado
- [x] **Contexto por usuário** — `runtime.context.userId` propaga o ID do usuário sem poluir o estado do grafo
- [x] **Multi-tenant** — cada usuário tem seu perfil independente, mesmo compartilhando o mesmo grafo

## Aprendizados

- [x] `RemoveMessage` é a forma idiomática do LangGraph para descartar mensagens do checkpointer sem recriar o thread inteiro
- [x] Separar checkpointer (histórico de mensagens) de store (dados do usuário) permite estratégias de expiração e acesso diferentes para cada tipo de dado
- [x] Zod como contrato entre o LLM e o código evita parsing frágil de strings e centraliza a definição do que o modelo deve retornar
- [x] `providerStrategy` do LangChain ativa o modo nativo de structured output do provedor quando disponível, melhorando confiabilidade

## Referências

- [LangGraph — Checkpointers](https://langchain-ai.github.io/langgraphjs/concepts/persistence/)
- [LangGraph — Memory Store](https://langchain-ai.github.io/langgraphjs/concepts/memory/)
- [OpenRouter — API Docs](https://openrouter.ai/docs)
- [LangSmith — Tracing](https://docs.smith.langchain.com/)
