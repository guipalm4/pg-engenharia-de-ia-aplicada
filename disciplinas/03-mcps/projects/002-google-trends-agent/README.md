# Exemplo 002 — Agente Google Trends: Transformando Serviços em Ferramentas

> Agente LangGraph que envolve a API SerpAPI/Google Trends como uma ferramenta LangChain nativa para recomendar títulos de vídeo com base em dados reais de tendência.

## Contexto

- **Disciplina:** Model Context Protocol (MCPs)
- **Período:** 2026
- **Autor:** guipalm4

## Descrição

Este projeto demonstra o padrão central da disciplina de MCPs: **transformar um serviço externo arbitrário em uma ferramenta de agente**. Em vez de conectar um servidor MCP pré-existente, o projeto encapsula manualmente a API REST do SerpAPI (Google Trends) como um `tool` LangChain, tornando-a invocável por qualquer LLM em um grafo LangGraph.

O agente responde a perguntas como *"Estou pensando em criar um vídeo sobre Web AI, quais títulos você me recomendaria?"*. O grafo possui dois nós em sequência: o **Researcher** extrai palavras-chave da pergunta e aciona a ferramenta `google_trends` para buscar dados reais de volume e tendência; o **Responder** recebe esses dados e produz uma recomendação concreta e orientada por dados, respondendo sempre no idioma do usuário.

O projeto é exposto como API HTTP via Fastify (POST `/chat`) e também como um grafo LangGraph deployável via `langgraph serve`, com suporte a LangSmith tracing para observabilidade das chamadas.

Um fixture de dados (`data/trendingData.ts`) permite rodar o agente offline, desabilitando a chamada real ao SerpAPI via flag `disabled` na configuração — útil para desenvolvimento sem consumir cota de API.

## Tecnologias e Ferramentas

- [x] **LangGraph** — orquestração do grafo de agente com dois nós sequenciais
- [x] **LangChain Core** — abstração de tools (`tool()`), mensagens e modelos
- [x] **@langchain/mcp-adapters** — integração de servidores MCP externos (Filesystem MCP via stdio)
- [x] **SerpAPI** (`serpapi`) — fonte de dados de Google Trends
- [x] **OpenRouter** — gateway de LLMs (modelos gratuitos como `arcee-ai/trinity-large-preview`)
- [x] **Fastify** — servidor HTTP para expor o agente como API REST
- [x] **Zod** — validação de schema para structured output (keywords e recomendação)
- [x] **LangSmith** — rastreamento e observabilidade das execuções do agente
- [x] **TypeScript ESM + Node.js 24** — runtime nativo sem transpilação

## Pré-requisitos

- Node.js >= 24.10.0 (usa `--env-file` nativo e `--test` runner)
- Conta e chave de API no [SerpAPI](https://serpapi.com/) (tier gratuito: 100 buscas/mês)
- Conta e chave de API no [OpenRouter](https://openrouter.ai/) (modelos gratuitos disponíveis)
- (Opcional) Chave do [LangSmith](https://smith.langchain.com/) para tracing

## Como executar

```bash
# 1. Instale as dependências
cd disciplinas/03-mcps/projects/002-google-trends-agent
npm install

# 2. Configure as variáveis de ambiente
cp .env.example .env
# Edite .env com suas chaves de API

# 3. Execute o servidor
npm start
# Servidor disponível em http://localhost:3000

# 4. Faça uma pergunta ao agente
curl -X POST http://localhost:3000/chat \
  -H 'Content-Type: application/json' \
  -d '{"question": "Estou pensando em criar um video sobre Web AI, quais titulos você me recomendaria?"}'

# Para rodar como LangGraph API (compatível com LangGraph Studio)
npm run langgraph:serve
```

> Para rodar **sem consumir cota do SerpAPI**, defina `disabled: true` no campo `serpAPIConfig` em [src/config.ts](src/config.ts) — o agente usará os fixtures de `data/trendingData.ts`.

## Estrutura do Projeto

```
002-google-trends-agent/
├── src/
│   ├── index.ts                    # Entrypoint: inicia servidor e dispara teste de smoke
│   ├── server.ts                   # Servidor Fastify com rota POST /chat
│   ├── config.ts                   # Configuração centralizada de modelos e SerpAPI
│   ├── graph/
│   │   ├── factory.ts              # Instancia o grafo para uso no LangGraph API
│   │   ├── graph.ts                # Definição do StateGraph (researcher → responder)
│   │   ├── state.ts                # Estado Zod do grafo (messages, trendsData, question)
│   │   └── nodes/
│   │       ├── researcherNode.ts   # Extrai keywords e chama google_trends tool
│   │       └── responderNode.ts    # Gera recomendação usando dados de tendência
│   ├── tools/
│   │   └── googleTrendsTool.ts     # Wrapping da SerpAPIService como LangChain tool
│   ├── services/
│   │   ├── openRouterService.ts    # Cliente LLM com suporte a tools e structured output
│   │   ├── serpApiService.ts       # Integração com SerpAPI + cache in-memory + fixture
│   │   └── mcpService.ts           # Carrega tools: MCP Filesystem + google_trends
│   └── prompts/v1/
│       ├── keywords.ts             # System prompt + schema Zod para extração de keywords
│       └── videoTrends.ts          # System/user prompts para recomendação de títulos
├── data/
│   └── trendingData.ts             # Fixtures de dados para execução offline
├── langgraph.json                  # Configuração para deploy via LangGraph CLI
├── tsconfig.json
└── package.json
```

## Como funciona

```
POST /chat { question }
       │
       ▼
  [StateGraph]
       │
       ├─► researcher
       │      ├── Extrai keywords da pergunta (structured output → KeywordsSchema)
       │      └── Chama tool `google_trends` com as keywords via SerpAPI
       │             └── Retorna: { keywords[], relatedQueries[], risingTopics[] }
       │
       └─► responder
              ├── Recebe trendsData + question do estado
              └── Gera recomendação em PT-BR com base nos dados (structured output)
                     └── Retorna AIMessage com análise e sugestões de título
```

O `OpenRouterService` unifica o acesso ao LLM: quando chamado sem schema Zod, cria um agente com ferramentas (`google_trends` + MCP tools); quando chamado com schema, usa `structured output` com `providerStrategy` do LangChain para resposta formatada.

## Conceitos trabalhados

- [x] **Transformando serviços em ferramentas** — encapsulamento de API REST (SerpAPI) como `tool()` LangChain invocável por LLM
- [x] **Grafo multi-nó com estado compartilhado** — dois nós especializados (pesquisa + síntese) que se comunicam via estado Zod tipado
- [x] **Structured output com Zod** — extração confiável de dados estruturados do LLM (keywords, recomendações)
- [x] **MCP Adapters** — integração de servidores MCP externos (Filesystem stdio) via `MultiServerMCPClient`
- [x] **Fixture/mock de serviço externo** — flag `disabled` para desenvolvimento offline sem custo de API
- [x] **LangGraph API** — grafo deployável como serviço via `langgraph serve` com `langgraph.json`
- [x] **Observabilidade com LangSmith** — rastreamento end-to-end das chamadas de agente

## Aprendizados

- [x] O padrão `tool()` do LangChain permite transformar qualquer função assíncrona em uma ferramenta invocável pelo LLM com schema Zod — isso é a base do modelo MCP aplicado localmente
- [x] Separar o agente em nós especializados (researcher vs responder) melhora a qualidade das respostas: o LLM de pesquisa não precisa saber formatar; o LLM de resposta não precisa conhecer a API
- [x] `providerStrategy` com Zod schema é mais confiável que pedir ao LLM para formatar JSON no texto — elimina necessidade de parsing manual
- [x] A flag `disabled` no serviço externo é um padrão simples e eficaz para alternar entre dados reais e fixtures sem alterar o código do agente
- [x] O LangGraph `langgraph.json` permite expor qualquer grafo como serviço REST padronizado compatível com LangGraph Studio, sem código adicional

## Referências

- [LangGraph — Building Agents](https://langchain-ai.github.io/langgraphjs/)
- [LangChain Tools — tool()](https://js.langchain.com/docs/concepts/tools)
- [SerpAPI — Google Trends](https://serpapi.com/google-trends-api)
- [OpenRouter — Free Models](https://openrouter.ai/models?q=free)
- [LangSmith — Tracing](https://docs.smith.langchain.com/)
- [MCP Adapters for LangChain](https://github.com/langchain-ai/langchainjs/tree/main/libs/langchain-mcp-adapters)
