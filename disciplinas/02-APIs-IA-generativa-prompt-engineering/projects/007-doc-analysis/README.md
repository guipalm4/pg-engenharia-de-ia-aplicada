# Exemplo 007 — Análise de Documentos com LLM Multimodal e LangGraph

> Pipeline de Q&A sobre PDFs usando LangGraph, OpenRouter e modelos de visão (Google Gemini 2.5 Flash)

## Contexto

- **Disciplina:** 02 — APIs de IA Generativa e Prompt Engineering
- **Autor:** guipalm4

## Descrição

Este projeto implementa um pipeline de perguntas e respostas sobre documentos PDF usando processamento multimodal. O usuário envia um arquivo PDF e uma pergunta via API HTTP; o sistema converte o documento em base64, orquestra o fluxo com LangGraph e envia tudo para um modelo de visão via OpenRouter, que lê o documento e responde em linguagem natural.

O pipeline demonstra como tratar documentos como entrada multimodal — passando o PDF como `image_url` com MIME type `application/pdf` diretamente para o modelo, sem necessidade de extração de texto prévia ou chunking. O modelo processa a estrutura visual e textual do documento de forma holística.

A arquitetura usa um `StateGraph` LangGraph com estado Zod tipado e um único nó `answerGeneration`, exposto via servidor Fastify com suporte a upload multipart. Ao iniciar, o servidor automaticamente testa o pipeline com um PDF local de demonstração.

## Tecnologias e Ferramentas

- [x] **LangGraph** — orquestração de grafo de estado com `StateGraph` e schema Zod
- [x] **LangChain / `@langchain/openai`** — cliente LLM com suporte a conteúdo multimodal
- [x] **OpenRouter** — gateway de LLMs com roteamento por throughput e suporte a modelos de visão
- [x] **Google Gemini 2.5 Flash Lite** — modelo multimodal para análise de PDF
- [x] **Fastify + `@fastify/multipart`** — servidor HTTP com upload de arquivo (limite 10 MB)
- [x] **LangSmith** — rastreamento de execuções do grafo
- [x] **TypeScript + Node.js 24** — runtime com ESM nativo e carregamento de `.ts` direto

## Pré-requisitos

- Node.js ≥ 24.10.0
- Conta e API key no [OpenRouter](https://openrouter.ai)
- (Opcional) API key do [LangSmith](https://smith.langchain.com) para rastreamento

## Como executar

```bash
cd disciplinas/02-APIs-IA-generativa-prompt-engineering/projects/007-doc-analysis

# Instalar dependências
pnpm install

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com sua OPENROUTER_API_KEY

# Iniciar o servidor
pnpm start
```

O servidor sobe em `http://localhost:4000` e automaticamente executa um teste com o PDF em `docs/`.

Para enviar seu próprio documento:

```bash
curl -X POST \
  -F "file=@seu-documento.pdf" \
  -F "question=O que este documento aborda?" \
  http://localhost:4000/chat
```

## Estrutura do Projeto

```
src/
├── config.ts                        # Configuração de modelos e OpenRouter
├── index.ts                         # Entrypoint: sobe o servidor e testa com PDF local
├── server.ts                        # Fastify: rota POST /chat com multipart
├── graph/
│   ├── factory.ts                   # Instancia o LLMClient e compila o grafo
│   ├── graph.ts                     # StateGraph com schema Zod e rota START → answerGeneration → END
│   └── nodes/
│       └── answerGenerationNode.ts  # Envia documento + pergunta ao modelo multimodal
└── services/
    └── openrouterService.ts         # ChatOpenAI configurado para OpenRouter com conteúdo multimodal
docs/
└── a-comprehensive-overview-of-large-language-models.pdf  # PDF de demonstração
```

## Como funciona

```
POST /chat (PDF + question)
        │
        ▼
  server.ts: lê o arquivo, converte para base64
        │
        ▼
  graph.invoke({ messages: [HumanMessage(question)], documentBase64 })
        │
        ▼
  [START] → answerGenerationNode
                │
                ├─ Monta HumanMessage com conteúdo misto:
                │    { type: "text", text: question }
                │    { type: "image_url", url: "data:application/pdf;base64,..." }
                │
                ├─ Envia para modelo de visão via OpenRouter
                │
                └─ Retorna AIMessage com a resposta
        │
        ▼
  [END] → { answer, filename, question }
```

## Conceitos trabalhados

- [x] **Entrada multimodal com PDF** — documento passado como `image_url` base64 para modelo de visão; sem necessidade de parsing ou chunking
- [x] **StateGraph Zod** — estado do grafo tipado com `z.object()` e `withLangGraph` para campo de mensagens
- [x] **Roteamento de modelos no OpenRouter** — `modelKwargs` com `models[]` e `provider.sort` por throughput
- [x] **Upload multipart com Fastify** — `@fastify/multipart` para receber PDF e campos de formulário juntos
- [x] **Injeção de dependência no grafo** — `llmClient` injetado no nó via factory, facilitando testes
- [x] **LangSmith tracing** — ativado via variáveis de ambiente `LANGCHAIN_TRACING_V2` e `LANGCHAIN_PROJECT`

## Aprendizados

- [x] Modelos de visão conseguem ler PDFs diretamente como imagem via `data:application/pdf;base64,...` — não é necessário converter para texto antes
- [x] O `StateGraph` do LangGraph aceita schemas Zod nativamente com `stateSchema`, eliminando a necessidade do padrão `Annotation` baseado em reducers
- [x] O OpenRouter suporta fallback e roteamento entre modelos via `models[]` e `provider.sort` em `modelKwargs`, sem alterar o código da aplicação
- [x] Passar o `llmClient` como parâmetro para os nós (em vez de instanciar dentro) mantém o grafo testável e desacoplado da implementação concreta

## Referências

- [LangGraph — StateGraph com Zod](https://langchain-ai.github.io/langgraphjs/)
- [OpenRouter — Multi-model Routing](https://openrouter.ai/docs)
- [Fastify Multipart](https://github.com/fastify/fastify-multipart)
- [LangSmith Tracing](https://docs.smith.langchain.com)
- [A Comprehensive Overview of Large Language Models](https://arxiv.org/pdf/2307.06435)
