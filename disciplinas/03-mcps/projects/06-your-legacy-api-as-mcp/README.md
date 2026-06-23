# Exemplo 06 — Sua API Legada como MCP

> Transforma uma API REST legada (Fastify + MongoDB) em um servidor MCP, expondo o CRUD de clientes como Tools, Resource e Prompt consumíveis por agentes LLM no VS Code Copilot.

## Contexto
- Disciplina: Model Context Protocol (MCPs)
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição
Este projeto demonstra o padrão **"legacy API as MCP"**: em vez de reescrever um sistema existente, coloca-se uma fina camada MCP na frente de uma API REST já em produção. Assim, um agente LLM passa a operar o sistema legado por linguagem natural, sem que a API precise saber o que é MCP.

O repositório reúne três peças que compõem o exemplo de ponta a ponta:

1. **`nodejs-fastify-mongodb-crud`** — a *API legada*. Um CRUD de clientes (`name`, `phone`) em Fastify + MongoDB, com endpoints versionados em `/v1/customers`, validação de schema, seed de dados e suíte de testes de integração com `node:test` e CI no GitHub Actions. Representa o sistema que já existia antes do MCP.
2. **`customers-mcp-z`** — o *servidor MCP finalizado*. Envolve a API legada e expõe suas operações como primitivas MCP: cinco Tools (list/get/create/update/delete), um Resource que descreve a API e um Prompt de busca. Organizado em camadas (domain / application / infrastructure / mcp) com schemas Zod tipados.
3. **`customers-mcp-template`** — o *scaffold inicial*, com a mesma estrutura de pastas DDD vazia, servindo como ponto de partida para construir o servidor passo a passo.

O servidor MCP não acessa o banco diretamente: ele fala HTTP com a API legada (`http://localhost:9999/v1`) via um `CustomerHttpClient`, mantendo a separação entre a lógica de negócio existente e a camada de exposição para agentes.

## Tecnologias e Ferramentas
- [x] **MCP** — `@modelcontextprotocol/sdk` (`McpServer`, transporte Stdio)
- [x] **TypeScript** executado direto via Node.js (`--experimental-strip-types`)
- [x] **Zod** — schemas de input/output tipados das Tools
- [x] **Fastify** — API REST legada
- [x] **MongoDB** — persistência dos clientes
- [x] **Docker Compose** — sobe API + MongoDB localmente
- [x] **node:test** — testes de integração (API e MCP)
- [x] **VS Code Copilot Chat** (Agent mode) — cliente MCP

## Pré-requisitos
- **Node.js v24+** para os servidores MCP (`customers-mcp-*`); **Node.js v20** para a API legada
- **Docker** + **Docker Compose** para subir a API legada e o MongoDB

## Como executar

### 1. Suba a API legada (Fastify + MongoDB)
```bash
cd nodejs-fastify-mongodb-crud
npm install
npm run docker:infra:up        # MongoDB via docker-compose
DB_NAME=customers npm start    # API em http://localhost:9999
npm run config/seed.js         # (opcional) popula clientes de exemplo
```

### 2. Rode o servidor MCP que envolve a API
```bash
cd customers-mcp-z
npm install
npm start                      # conecta no stdio; usado pelo cliente MCP
```

### 3. Use no VS Code Copilot
Com `.vscode/mcp.json` apontando para `src/index.ts`, recarregue a janela do VS Code e, no Copilot Chat (Agent mode), peça por exemplo: *"liste os clientes"*, *"crie o cliente Ana com telefone 999-000-111"* ou *"atualize o telefone do cliente X"*.

### Inspecionar e testar
```bash
npm run mcp:inspect            # abre o MCP Inspector no browser
npm test                       # testes de integração (API legada precisa estar no ar)
```

## Estrutura do Projeto
```
06-your-legacy-api-as-mcp/
├── nodejs-fastify-mongodb-crud/   # API REST legada (Fastify + MongoDB)
│   ├── src/
│   │   ├── index.js               # rotas /v1/customers (GET/POST/PUT/DELETE)
│   │   ├── db.js                  # conexão MongoDB
│   │   └── config.js              # config via env (host, porta, db)
│   ├── config/{seed.js,users.js}  # seed de clientes de exemplo
│   ├── test/api.test.js           # testes de integração da API
│   └── docker-compose.yml         # API + MongoDB
│
├── customers-mcp-z/               # servidor MCP finalizado
│   ├── src/
│   │   ├── domain/customer.ts     # schemas Zod (Customer, Query, Update, Mutation)
│   │   ├── infrastructure/customerHttpClient.ts  # fetch → API legada
│   │   ├── application/customerService.ts         # regras (ex.: findCustomer)
│   │   └── mcp/
│   │       ├── server.ts          # registra tools/resource/prompt
│   │       ├── tools/             # list/get/create/update/delete
│   │       ├── resources/apiInfo.ts
│   │       └── prompts/findCustomer.ts
│   └── tests/                     # testes via Client MCP real
│
└── customers-mcp-template/        # scaffold DDD vazio (ponto de partida)
```

## Como funciona
```
Copilot (Agent) ──MCP/stdio──▶ customers-mcp-z ──HTTP──▶ API legada (Fastify) ──▶ MongoDB
        │                            │
        │  "liste os clientes"       │  registerTool("list_customers", …)
        └────────────────────────────┘  CustomerService → CustomerHttpClient.GET /v1/customers
```

1. O agente descobre as Tools expostas pelo servidor MCP (`list_customers`, `get_customer`, `create_customer`, `update_customer`, `delete_customer`).
2. Ao escolher uma Tool, o servidor valida os argumentos com o schema Zod de `inputSchema` e chama o `CustomerService`.
3. O `CustomerService` orquestra a regra (ex.: `findCustomer` busca por `_id` ou filtra a lista por `name`/`phone`) e delega a chamada HTTP ao `CustomerHttpClient`.
4. A resposta volta como `structuredContent` validado pelo `outputSchema`, e o agente apresenta o resultado em linguagem natural.
5. O **Resource** `customers://api-info` documenta a API para o agente; o **Prompt** `find_customer_prompt` injeta uma instrução pronta de busca.

## Conceitos trabalhados
- [x] **API legada como MCP** — expor um sistema existente sem reescrevê-lo, via camada MCP fina
- [x] **MCP Tools** — `server.registerTool` com `inputSchema`/`outputSchema` Zod e tratamento de erro (`isError`)
- [x] **MCP Resource** — `customers://api-info` descrevendo a API que o servidor encapsula
- [x] **MCP Prompt** — `find_customer_prompt` parametrizado pelo `CustomerQuerySchema`
- [x] **Structured output** — `CustomerMutationSchema` ajustado para não violar o output schema do MCP
- [x] **Separação em camadas** — domain / application / infrastructure / mcp
- [x] **Transporte Stdio** — `StdioServerTransport` no servidor e `StdioClientTransport` nos testes
- [x] **Testes de integração com Client MCP** — `createTestClient` conecta um `Client` real ao servidor

## Aprendizados
- [x] Não é preciso reescrever um sistema para torná-lo "agent-ready": uma camada MCP sobre a API REST existente já habilita operação por linguagem natural.
- [x] O `outputSchema` do MCP é estrito — campos retornados que não estão no schema causam erro *"data must NOT have additional properties"*; por isso `CustomerMutationSchema` precisou incluir explicitamente `customer`/`customers`.
- [x] Manter a regra de negócio (`findCustomer`) na camada `application`, e não na Tool, mantém o servidor MCP fino e testável.
- [x] Testar o servidor com um `Client` MCP real (em vez de chamar funções diretamente) valida o contrato de ponta a ponta — registro de tools, schemas e serialização.

## Referências
- [Model Context Protocol](https://modelcontextprotocol.io)
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Inspector](https://github.com/modelcontextprotocol/inspector)
- [Fastify](https://fastify.dev)
- [Zod](https://zod.dev)
