# Exemplo 006 — RAG com NL2Cypher: Análise de Vendas em Neo4j

> Pipeline RAG que converte perguntas em linguagem natural para Cypher, executa no Neo4j e gera respostas analíticas — com decomposição de queries complexas e autocorreção, exposto via API Fastify.

## Contexto

- **Disciplina:** APIs de IA Generativa e Prompt Engineering
- **Autor:** guipalm4

## Descrição

Este projeto implementa um sistema de perguntas e respostas sobre dados de vendas de uma academia online, usando Neo4j como banco de dados de grafo e LLM para traduzir perguntas em linguagem natural para Cypher (NL2Cypher).

O grafo modela estudantes (`Student`), cursos (`Course`) e dois tipos de relacionamento: `PURCHASED` (com atributos de valor, método de pagamento e status) e `PROGRESS` (percentual de conclusão). Isso permite consultas relacionais ricas como "quais cursos são frequentemente comprados juntos?" ou "quais estudantes completaram todos os cursos que compraram?".

O pipeline LangGraph tem seis nós encadeados: o `queryPlanner` classifica a pergunta como simples ou complexa e decompõe queries complexas em até 3 sub-perguntas; o `cypherGenerator` gera queries Cypher usando o schema real do banco; o `cypherExecutor` valida e executa; o `cypherCorrectionNode` autocorrige queries com erro (até 1 tentativa); e o `analyticalResponse` sintetiza os resultados em prosa analítica com sugestões de follow-up. Perguntas complexas executam o ciclo `cypherGenerator → cypherExecutor` uma vez por sub-pergunta e sintetizam tudo no final.

O sistema é exposto via servidor Fastify com endpoint `POST /sales`, com E2E tests usando Node.js Test Runner nativo e seed de dados com Faker.js.

## Tecnologias e Ferramentas

- [x] TypeScript (Node.js >= 24.10, `--experimental-strip-types`)
- [x] LangGraph (`@langchain/langgraph`) — StateGraph com roteamento condicional multi-nó
- [x] LangChain (`@langchain/core`, `@langchain/openai`, `@langchain/community`) — geração estruturada com Zod
- [x] OpenRouter (`arcee-ai/trinity-large-preview:free`) — gateway LLM
- [x] Neo4j 5.14 + APOC — banco de grafo via Docker
- [x] Fastify 5 — servidor HTTP com endpoint `/sales`
- [x] Faker.js — geração de dados de seed realistas
- [x] LangSmith — tracing via `LANGCHAIN_TRACING_V2`
- [x] LangGraph Studio — visualização do grafo via `langgraph.json`

## Pré-requisitos

- Node.js >= 24.10.0
- Docker e Docker Compose
- Conta no [OpenRouter](https://openrouter.ai) com chave de API
- Arquivo `.env` configurado (copie `.env.example`)

```bash
cp .env.example .env
# Preencha OPENROUTER_API_KEY
# (Opcional) LANGSMITH_API_KEY para tracing
```

## Como executar

```bash
npm install

# 1. Subir Neo4j via Docker
npm run docker:infra:up

# 2. Seed do banco com dados fake (20 estudantes, 10 cursos, vendas e progresso)
npm run seed

# 3. Iniciar servidor HTTP na porta 4000
npm run dev

# 4. Fazer uma pergunta
curl -X POST http://localhost:4000/sales \
  -H 'Content-Type: application/json' \
  -d '{"question": "Which courses are commonly bought together?"}'

# Rodar testes E2E (requer Neo4j rodando)
npm run test:e2e

# LangGraph Studio
npm run langgraph:serve

# Parar infraestrutura
npm run docker:infra:down
```

## Estrutura do Projeto

```
006-rag-neo4j-students-z/
├── src/
│   ├── index.ts                          # Entry point — inicia servidor e faz request de teste
│   ├── server.ts                         # Fastify server com endpoint POST /sales
│   ├── config.ts                         # Configuração do modelo, Neo4j e limites
│   ├── graph/
│   │   ├── graph.ts                      # StateGraph LangGraph (schema Zod + nós + edges)
│   │   ├── factory.ts                    # Builder para CLI e LangGraph Studio
│   │   └── nodes/
│   │       ├── extractQuestionNode.ts    # Extrai texto da última mensagem
│   │       ├── queryPlannerNode.ts       # Classifica complexidade e decompõe query
│   │       ├── cypherGeneratorNode.ts    # Traduz pergunta → Cypher usando schema
│   │       ├── cypherExecutorNode.ts     # Valida e executa Cypher no Neo4j
│   │       ├── cypherCorrectionNode.ts   # Autocorrige query com erro (max 1x)
│   │       └── analyticalResponseNode.ts # Gera resposta analítica em prosa
│   ├── prompts/v1/
│   │   ├── salesContext.ts               # Regras de negócio da academia (contexto fixo)
│   │   ├── cypherGenerator.ts            # Prompt + Zod schema para geração Cypher
│   │   ├── cypherCorrection.ts           # Prompt + Zod schema para correção Cypher
│   │   ├── queryAnalyzer.ts              # Prompt + Zod schema para análise de complexidade
│   │   ├── analyticalResponse.ts         # Prompt + Zod schema para resposta analítica
│   │   └── nlpResponse.ts               # (Alternativa) template NLP com placeholders
│   └── services/
│       ├── neo4jService.ts               # Cliente Neo4j com lazy init e validação de queries
│       └── openrouterService.ts          # Cliente OpenRouter com geração estruturada via Zod
├── data/
│   ├── courses.json                      # 10 cursos da academia (nome + URL)
│   ├── seed.ts                           # Entry point do seed
│   └── seedHelpers.ts                    # Gera e insere estudantes, vendas e progresso
├── tests/
│   └── sales.e2e.test.ts                 # 10 testes E2E com Node.js Test Runner
├── docker-compose.yaml                   # Neo4j 5.14 + APOC
├── langgraph.json                        # Configuração para LangGraph Studio
└── .env.example
```

## Como funciona

```
POST /sales { question }
       │
       ▼
┌─────────────────┐
│ extractQuestion │  ← texto da última mensagem
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  queryPlanner   │  ← simples ou complexa?
│  (Zod schema)   │     se complexa → decomposição em subQuestions[]
└────────┬────────┘
         │
         ▼
┌──────────────────┐
│ cypherGenerator  │  ← usa schema real do Neo4j + contexto de negócio
│  (Zod schema)    │     em multi-step: executa uma vez por sub-pergunta
└────────┬─────────┘
         │
         ▼
┌──────────────────┐        ┌──────────────────┐
│  cypherExecutor  │──erro──▶ cypherCorrection  │
│  (valida + exec) │◀───────┤  (corrige 1x)    │
└────────┬─────────┘        └──────────────────┘
         │ (se multi-step e há mais passos → volta a cypherGenerator)
         ▼
┌────────────────────┐
│ analyticalResponse │  ← gera prosa analítica + follow-up questions
│   (Zod schema)     │     em multi-step: sintetiza todos os subResults
└────────────────────┘
         │
         ▼
{ answer, followUpQuestions, query }
```

O estado LangGraph (`SalesStateAnnotation`) carrega tanto o contexto da query atual (`question`, `query`, `dbResults`) quanto o estado de execução multi-step (`subQuestions`, `currentStep`, `subQueries`, `subResults`) e o estado de correção (`correctionAttempts`, `validationError`, `needsCorrection`).

## Conceitos trabalhados

- [x] **NL2Cypher (Text-to-Cypher)** — LLM traduz linguagem natural para Cypher usando schema introscpectado do Neo4j
- [x] **RAG sobre grafo** — recuperação de dados relacionais em Neo4j em vez de busca vetorial
- [x] **Query planning com decomposição** — o `queryPlannerNode` detecta queries complexas e as divide em sub-perguntas independentes
- [x] **Self-healing / autocorreção** — `cypherCorrectionNode` recebe a query falha + mensagem de erro e gera versão corrigida
- [x] **Structured output com Zod** — todos os nós usam `generateStructured` + schema Zod via `providerStrategy`
- [x] **LangGraph StateGraph multi-nó** — roteamento condicional com loop implícito (multi-step volta para `cypherGenerator`)
- [x] **Schema introspection** — `Neo4jService.getSchema()` extrai schema real do banco a cada geração de query
- [x] **Fastify com LangGraph** — servidor HTTP que expõe o grafo como API REST

## Aprendizados

- [x] Usar o schema real do banco no prompt do gerador de Cypher reduz drasticamente erros de property/label inexistentes
- [x] A decomposição de queries complexas (`queryPlanner`) é necessária porque o LLM tende a gerar queries Cypher incorretas quando a pergunta envolve múltiplos agregados dependentes
- [x] `EXPLAIN <query>` antes de executar é uma forma eficiente de validar sintaxe sem consumir dados — o Neo4j retorna erro de parse sem executar
- [x] `providerStrategy(schema)` do LangChain garante saída estruturada mesmo em modelos sem suporte nativo a function calling
- [x] Manter o `Neo4jGraph` com singleton lazy-initialized evita múltiplas conexões simultâneas durante a execução de nós paralelos do grafo

## Referências

- [LangGraph — StateGraph (JS)](https://langchain-ai.github.io/langgraphjs/)
- [LangChain Community — Neo4jGraph](https://js.langchain.com/docs/integrations/graphs/neo4j_graph)
- [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/current/)
- [OpenRouter — Model Routing](https://openrouter.ai/docs/features/provider-routing)
- [Text2Cypher: NL to Cypher Survey](https://arxiv.org/abs/2310.14546)
