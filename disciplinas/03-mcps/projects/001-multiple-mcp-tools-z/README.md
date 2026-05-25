# Exemplo 001 — Agente com Múltiplos MCP Tools

> Agente LangGraph que orquestra três MCP tools (MongoDB, Filesystem e CSV-to-JSON) para processar dados de vendas de ponta a ponta via linguagem natural.

## Contexto

- **Disciplina:** 03 — Model Context Protocol (MCPs)
- **Autor:** guipalm4

## Descrição

Este projeto demonstra como um único agente LangGraph pode coordenar múltiplas ferramentas MCP para executar um pipeline de dados completo sem código imperativo explícito. A entrada é uma pergunta em linguagem natural contendo um CSV; a saída é um relatório `.txt` salvo em disco e o resultado de consultas no MongoDB.

O grafo tem dois nós sequenciais: `intentNode` extrai a intenção e o conteúdo do arquivo da mensagem do usuário via structured output Zod; `agentNode` recebe esses dados e decide autonomamente quais ferramentas chamar — nessa ordem: converter CSV para JSON, escrever o JSON em disco, inserir no MongoDB, consultar o banco e salvar o relatório final.

A arquitetura separa extração de intenção (sem ferramentas, custo baixo) de execução agentiva (com acesso a todas as ferramentas MCP), evitando que o agente principal receba conteúdo bruto de arquivo junto às instruções de tool use.

## Tecnologias e Ferramentas

- [x] **TypeScript** + Node.js ≥ 24.10
- [x] **LangGraph** (`@langchain/langgraph`) — orquestração do grafo de estado
- [x] **LangChain** (`@langchain/core`, `langchain`) — abstrações de agente e mensagens
- [x] **`@langchain/mcp-adapters`** — integração de servidores MCP como LangChain tools
- [x] **MongoDB MCP Server** (`mongodb-mcp-server`) — CRUD e queries via linguagem natural
- [x] **Filesystem MCP Server** (`@modelcontextprotocol/server-filesystem`) — leitura e escrita de arquivos
- [x] **CSV-to-JSON Tool** (custom LangChain tool com `csvtojson`)
- [x] **OpenRouter** via `@langchain/openai` — gateway para LLMs gratuitos
- [x] **Fastify** — servidor HTTP que expõe o grafo via `POST /chat`
- [x] **Docker Compose** — MongoDB + Mongo Express para infra local
- [x] **LangSmith** — tracing opcional via `LANGSMITH_API_KEY`

## Pré-requisitos

- Node.js ≥ 24.10 (via `asdf` ou diretamente)
- Docker e Docker Compose (para MongoDB)
- Chave de API do OpenRouter (`OPENROUTER_API_KEY`)

## Como executar

```bash
# 1. Entre no diretório do projeto
cd disciplinas/03-mcps/projects/001-multiple-mcp-tools-z

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# edite .env e preencha OPENROUTER_API_KEY

# 4. Suba a infra (MongoDB + Mongo Express)
npm run docker:infra:up

# 5. Execute o agente
npm run dev
```

O servidor sobe em `http://0.0.0.0:3000`. O `src/index.ts` injeta automaticamente uma requisição de teste com o CSV completo de vendas.

Para parar a infra:
```bash
npm run docker:infra:down
```

## Estrutura do Projeto

```
001-multiple-mcp-tools-z/
├── data/
│   ├── sales.csv              # Dataset reduzido (8 registros)
│   └── sales-complete.csv     # Dataset completo (100 registros)
├── reports/                   # Relatórios gerados pelo agente (.txt)
├── src/
│   ├── config.ts              # Configuração do modelo e OpenRouter
│   ├── index.ts               # Entrypoint — inicia servidor e dispara teste
│   ├── server.ts              # Fastify com rota POST /chat
│   ├── graph/
│   │   ├── factory.ts         # Monta o grafo com o serviço LLM
│   │   ├── graph.ts           # Define nós e arestas do StateGraph
│   │   ├── state.ts           # Zod schema do estado do grafo
│   │   └── nodes/
│   │       ├── intentNode.ts  # Extrai intent, fileName e fileContent
│   │       └── agentNode.ts   # Executa o pipeline com MCP tools
│   ├── prompts/v1/
│   │   ├── identifyIntent.ts  # System prompt + Zod schema de intenção
│   │   └── agentNode.ts      # System prompt com os 5 passos do pipeline
│   ├── services/
│   │   ├── mcpService.ts      # Inicializa MultiServerMCPClient
│   │   └── openRouterService.ts # Wrapper do ChatOpenAI com callbacks de log
│   └── tools/
│       ├── csvToJSONTool.ts   # LangChain tool customizada (csv_to_json)
│       ├── fsTool.ts          # Configuração do Filesystem MCP server
│       └── mongodbTool.ts     # Configuração do MongoDB MCP server
├── docker-compose.yaml
├── langgraph.json             # Configuração do LangGraph Studio
├── package.json
└── tsconfig.json
```

## Como funciona

```
POST /chat { question: "CSV + pergunta" }
        │
        ▼
  intentNode (LLM sem ferramentas)
    └─ extrai: intent, fileContent, fileName, fileType
        │
        ▼ (se sem erro)
  agentNode (LLM com MCP tools)
    └─ Passo 0: limpa coleções MongoDB
    └─ Passo 1: csv_to_json → converte fileContent
    └─ Passo 2: write_file → salva JSON em disco
    └─ Passo 3: MongoDB insert → persiste os registros
    └─ Passo 4: MongoDB query → responde a intent
    └─ Passo 5: write_file → salva relatório em ./reports/*.txt
        │
        ▼
  resposta textual para o cliente
```

O `MultiServerMCPClient` inicializa os servidores MCP como processos filhos via `stdio` e expõe todas as ferramentas como `StructuredTool` do LangChain — o agente os vê como funções comuns e decide a ordem de chamada.

## Conceitos trabalhados

- [x] **Model Context Protocol (MCP)** — integração de servidores MCP externos (`mongodb-mcp-server`, `@modelcontextprotocol/server-filesystem`) em um agente LangChain via `MultiServerMCPClient`
- [x] **Separação intent/execução** — nó dedicado para extração de intenção (structured output sem ferramentas) antes do nó de execução agentiva
- [x] **Tool orchestration** — agente decide autonomamente a sequência de chamadas a múltiplas ferramentas heterogêneas
- [x] **Zod state typing** — estado do grafo definido como schema Zod com `withLangGraph` para serialização automática de mensagens
- [x] **Pipeline de dados via linguagem natural** — CSV → JSON → MongoDB → query → relatório sem código imperativo explícito
- [x] **Callbacks de observabilidade** — `handleToolStart/End` e `handleLLMEnd` para rastrear cada passo do agente no console

## Aprendizados

- [x] O `MultiServerMCPClient` inicializa processos `npx` em background; se o servidor MCP falhar no startup, o erro aparece nos logs de callback (`onMessage`), não como exceção do Node
- [x] Passar o CSV bruto junto ao prompt do agente aumenta latência e custo — separar a extração em um nó anterior com structured output é mais eficiente
- [x] O MongoDB MCP server expõe operações de insert, find, aggregate e delete como ferramentas individuais; o agente combina essas primitivas para montar pipelines de análise
- [x] `providerStrategy` do LangChain força structured output via instruções de sistema, compatível com modelos gratuitos do OpenRouter que não suportam `response_format` nativo

## Referências

- [LangChain MCP Adapters](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain-mcp-adapters)
- [MongoDB MCP Server](https://github.com/mongodb-js/mongodb-mcp-server)
- [Filesystem MCP Server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [LangGraph — StateGraph](https://langchain-ai.github.io/langgraphjs/)
- [OpenRouter](https://openrouter.ai/docs)
