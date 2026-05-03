# Projeto 002 — Roteador de Intenções com LangGraph

> Grafo de estado (LangGraph) que detecta intenção numa mensagem de texto e executa a transformação correta — exposto via API HTTP com Fastify e inspecionável pelo LangGraph Studio.

## Contexto

- Disciplina: APIs de IA Generativa e Prompt Engineering
- Período: Maio/2026
- Autor: guipalm4

## Descrição

Este projeto introduz o **LangGraph** construindo um grafo de estado simples com roteamento condicional. A entrada é uma mensagem de texto livre enviada via HTTP; o grafo identifica a intenção do usuário (converter para maiúsculo, minúsculo ou comando desconhecido) e roteia para o nó de transformação adequado antes de devolver a resposta.

O objetivo didático é demonstrar os blocos fundamentais do LangGraph: definição de estado tipado com Zod, criação de nós como funções puras, edges fixas e conditional edges. O grafo é compilado e servido simultaneamente como uma API REST (Fastify) e como um grafo inspecionável pelo LangGraph Studio.

A escolha por lógica determinística — em vez de um LLM — na etapa de identificação de intenção é intencional: isola o comportamento do grafo de variáveis externas e torna os testes de ponta a ponta reproduzíveis e rápidos.

## Tecnologias e Ferramentas

- [x] TypeScript (ESM, Node.js 20)
- [x] LangGraph (`@langchain/langgraph`) — grafo de estado com roteamento condicional
- [x] LangChain (`langchain`, `@langchain/core`) — mensagens (`HumanMessage`, `AIMessage`)
- [x] Zod — schema de estado tipado via `StateGraph` + `withLangGraph`
- [x] Fastify — servidor HTTP para expor o grafo como API REST
- [x] Node.js Test Runner — testes E2E sem dependências externas

## Pré-requisitos

- Node.js 20+
- Arquivo `.env` na raiz do projeto (necessário apenas para execução via LangGraph Studio; a API local não requer variáveis de ambiente)

## Como executar

```bash
# Instalar dependências
npm install

# Iniciar o servidor HTTP (porta 3000)
npm run dev

# Testar a API
curl localhost:3000/chat \
  --data '{"question": "make this message upper please"}' \
  -H "Content-type: application/json"

# Executar testes E2E
npm test

# Iniciar o LangGraph Studio (Chrome/Firefox recomendado — ver nota abaixo)
npm run langgraph:serve
# Para Safari: npm run langgraph:serve:safari  (requer configurar domínio nas Advanced Settings do Studio)
```

> **Nota Safari:** O Safari bloqueia HTTP em localhost por padrão. Use `npm run langgraph:serve:safari` para gerar um túnel Cloudflare, anote o domínio gerado e adicione-o em **Advanced Settings → Allowed Domains** no LangGraph Studio. A alternativa mais simples é usar Chrome ou Firefox.

## Estrutura do Projeto

```
src/
├── index.ts                    # Entry point — inicia o servidor Fastify
├── server.ts                   # Configura Fastify e expõe POST /chat
└── graph/
    ├── factory.ts              # Exporta o grafo compilado para o LangGraph Studio
    ├── graph.ts                # Schema de estado (Zod) + montagem do StateGraph
    └── nodes/
        ├── identifyIntentNode.ts   # Detecta comando na mensagem (uppercase/lowercase/unknown)
        ├── upperCaseNode.ts        # Transforma o output para maiúsculas
        ├── lowerCaseNode.ts        # Transforma o output para minúsculas
        ├── fallbackNode.ts         # Responde com mensagem de erro para comandos desconhecidos
        └── chatResponseNode.ts     # Empacota o output final como AIMessage
tests/
└── router.e2e.test.ts          # Testes E2E via Fastify inject (sem servidor real)
langgraph.json                  # Configuração do LangGraph Studio
```

## Como funciona

```
POST /chat { question: "make this UPPER please" }
        │
        ▼
   [ identifyIntent ]
   Detecta keyword no texto:
   "upper" → command = 'uppercase'
   "lower" → command = 'lowercase'
   else   → command = 'unknown'
        │
        ├─ command = 'uppercase' ──► [ upperCaseNode ]  → output.toUpperCase()
        ├─ command = 'lowercase' ──► [ lowerCaseNode ]  → output.toLowerCase()
        └─ command = 'unknown'   ──► [ fallbackNode ]   → mensagem de ajuda
                                          │
                                          ▼
                                  [ chatResponseNode ]
                                  Cria AIMessage com o output
                                          │
                                          ▼
                                        END
                                          │
                                HTTP 200 com o texto transformado
```

O estado (`GraphState`) carrega três campos: `messages` (histórico LangChain), `output` (texto em processamento) e `command` (intenção detectada).

## Conceitos trabalhados

- [x] **StateGraph com Zod** — schema de estado fortemente tipado via `z.object` + `withLangGraph` para integração nativa do campo `messages` com o protocolo LangGraph
- [x] **Nós como funções puras** — cada nó recebe o estado completo e retorna apenas os campos alterados, sem efeitos colaterais
- [x] **Conditional edges** — `addConditionalEdges` roteia o fluxo com base no valor de `state.command`, substituindo `if/else` imperativo por roteamento declarativo no grafo
- [x] **Grafo compilado como artefato reutilizável** — o mesmo grafo compilado é usado tanto pelo servidor Fastify quanto exposto ao LangGraph Studio via `factory.ts`
- [x] **Testes E2E com Fastify inject** — `app.inject()` simula requisições HTTP completas sem abrir porta de rede, tornando os testes rápidos e determinísticos

## Aprendizados

- [x] O `StateGraph` do LangGraph exige que todos os campos do schema sejam retornados pelos nós — retornar um estado parcial causa erro de validação Zod em runtime
- [x] `withLangGraph` é necessário para que o campo `messages` receba o tratamento especial de append automático (reducer) do LangGraph, em vez de substituição simples
- [x] O LangGraph Studio não aceita domínios de túnel arbitrários — ao usar `--tunnel`, o domínio gerado precisa ser adicionado manualmente nas configurações avançadas do Studio
- [x] O Node.js Test Runner nativo (sem Jest/Vitest) é suficiente para testes E2E simples e elimina uma dependência de desenvolvimento

## Referências

- [LangGraph JS — Documentação oficial](https://langchain-ai.github.io/langgraphjs/)
- [LangGraph Studio](https://github.com/langchain-ai/langgraph-studio)
- [Fastify — Guia de uso](https://fastify.dev/docs/latest/)
- [Zod — TypeScript-first schema validation](https://zod.dev/)
