# Projeto 001 — Smart Model Router Gateway

> Gateway HTTP que roteia requisições para o melhor LLM disponível via OpenRouter, selecionando o modelo por estratégia configurável (preço, latência ou throughput).

## Contexto

- **Disciplina:** 02 — APIs de IA Generativa e Prompt Engineering
- **Período:** Abril/2026
- **Autor:** guipalm4

## Descrição

O Smart Model Router Gateway é um serviço HTTP construído com Fastify que expõe um endpoint `POST /chat` e delega a geração de resposta ao melhor modelo LLM disponível em um pool configurado via OpenRouter. A seleção do modelo é feita pelo próprio OpenRouter com base em uma estratégia de ordenação: `price` (mais barato), `latency` (mais rápido para primeiro token) ou `throughput` (maior taxa de tokens por segundo).

O projeto demonstra o padrão de **gateway/proxy para LLMs**: em vez de acoplar o código a um modelo específico, a aplicação declara uma lista de candidatos e uma política de seleção, e o OpenRouter resolve o roteamento em tempo de execução. A resposta retorna tanto o conteúdo gerado quanto o identificador do modelo que efetivamente respondeu — permitindo auditoria e análise de custo.

O foco da disciplina é o uso de APIs de IA generativa em produção: autenticação, políticas de roteamento, schema validation e testabilidade de integrações com LLMs.

## Tecnologias e Ferramentas

- [x] **Node.js 22+** — execução nativa de TypeScript sem transpilação (`--experimental-transform-types`)
- [x] **TypeScript** — tipagem estática no código-fonte
- [x] **Fastify 5** — servidor HTTP com validação de schema via JSON Schema
- [x] **@openrouter/sdk** — SDK oficial do OpenRouter para roteamento entre LLMs
- [x] **Node.js Test Runner** — testes E2E nativos sem dependências externas

## Pré-requisitos

- Node.js 22+ (`.tool-versions` define a versão exata via `asdf`)
- Conta no [OpenRouter](https://openrouter.ai) com API key

```bash
cp .env.example .env
# preencha OPENROUTER_API_KEY no .env
```

## Como executar

```bash
# Instalar dependências
npm install

# Rodar em modo desenvolvimento (watch)
npm run dev

# Executar testes E2E (requer OPENROUTER_API_KEY válida)
npm test
```

O servidor sobe na porta `3000`. Exemplo de chamada:

```bash
curl -X POST http://localhost:3000/chat \
  -H "Content-Type: application/json" \
  -d '{"question": "What is rate limiting?"}'
```

Resposta:

```json
{
  "model": "nvidia/nemotron-3-nano-30b-a3b:free",
  "content": "Rate limiting is a technique..."
}
```

## Estrutura do Projeto

```
001-smart-model-router-gateway/
├── src/
│   ├── index.ts              — entrypoint: instancia serviços e sobe o servidor
│   ├── server.ts             — Fastify com rota POST /chat e validação de schema
│   ├── openrouterService.ts  — wrapper do SDK OpenRouter, lógica de geração
│   └── config.ts             — pool de modelos, estratégia de roteamento, system prompt
├── tests/
│   └── router.e2e.test.ts    — testes E2E: routing por price e throughput
├── .env.example
└── package.json
```

## Como funciona

```
Cliente
  │
  ▼
POST /chat { question }
  │
  ▼
Fastify (schema validation)
  │
  ▼
OpenRouterService.generate(prompt)
  │  models: ["arcee-ai/trinity-large-preview:free", "nvidia/nemotron-3-nano-30b-a3b:free"]
  │  provider.sort.by: "throughput" | "price" | "latency"
  │
  ▼
OpenRouter API → seleciona o melhor modelo do pool
  │
  ▼
{ model: "modelo-selecionado", content: "resposta gerada" }
```

O `config.ts` centraliza o pool de modelos e a política de roteamento. Trocar de `throughput` para `price` altera qual modelo o OpenRouter escolhe sem mudar nenhuma linha de lógica de negócio.

## Conceitos trabalhados

- [x] **Model routing / gateway pattern** — pool de modelos + política de seleção desacoplada do código de negócio
- [x] **OpenRouter provider sorting** — uso de `provider.sort.by` para roteamento por `price`, `latency` e `throughput`
- [x] **Schema validation em APIs HTTP** — validação de entrada via JSON Schema no Fastify antes de chamar o LLM
- [x] **Testabilidade de integrações com LLM** — E2E com `app.inject()` sem servidor real, verificando modelo selecionado
- [x] **TypeScript nativo no Node.js 22+** — execução direta de `.ts` sem build step

## Aprendizados

- [x] O OpenRouter resolve o roteamento na borda: a aplicação não precisa implementar lógica de fallback ou comparação de preços — basta declarar o pool e a política
- [x] Retornar o `model` na resposta é essencial para auditoria: sem isso, é impossível saber qual modelo respondeu e calcular custo real por requisição
- [x] O `app.inject()` do Fastify permite testes E2E completos sem subir um servidor TCP — ideal para testar comportamento de roteamento com chamadas reais à API
- [x] Manter a config em um único arquivo tipado (`ModelConfig`) facilita sobrescrever parâmetros nos testes sem duplicar lógica

## Referências

- [OpenRouter Docs](https://openrouter.ai/docs)
- [OpenRouter SDK (@openrouter/sdk)](https://www.npmjs.com/package/@openrouter/sdk)
- [Fastify v5 — JSON Schema Validation](https://fastify.dev/docs/latest/Reference/Validation-and-Serialization/)
- [Node.js — Running TypeScript Natively](https://nodejs.org/en/learn/typescript/run-natively)
- [Node.js Test Runner](https://nodejs.org/api/test.html)
