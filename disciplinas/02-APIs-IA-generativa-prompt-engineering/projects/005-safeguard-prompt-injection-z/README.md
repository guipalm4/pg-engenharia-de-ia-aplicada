# Exemplo 005 — Defesa contra Prompt Injection com LangGraph e Guardrails LLM

> Demo educacional que demonstra ataques de prompt injection e como bloqueá-los com um modelo LLM de segurança dedicado, orquestrado por um grafo LangGraph.

## Contexto

- **Disciplina:** APIs de IA Generativa e Prompt Engineering
- **Autor:** guipalm4

## Descrição

Este projeto mostra, de forma prática e comparativa, por que confiar apenas em regras de system prompt para controlar acesso não é suficiente — e como um guardrail baseado em LLM resolve o problema.

O sistema simula um assistente com acesso ao filesystem via MCP (`@modelcontextprotocol/server-filesystem`). Dois usuários existem: `erickwendel` (admin, com permissão de leitura de arquivos) e `ananeri` (member, sem permissão). O assistente principal recebe instruções no system prompt sobre quem pode fazer o quê. O problema: um usuário malicioso pode injetar comandos no input para manipular o LLM a ignorar essas regras.

A defesa de dois estágios implementada com LangGraph resolve isso:
1. **System prompt** — barreira comportamental, facilmente contornável
2. **Guardrails LLM** (`openai/gpt-oss-safeguard-20b` via OpenRouter) — modelo separado que analisa todo input antes de chegar ao agente, detectando padrões de injection

O grafo LangGraph roteia o fluxo: se o guardrail classifica o input como `UNSAFE`, o nó `blocked` é invocado em vez do `chat`, retornando uma mensagem de alerta sem nunca acionar as ferramentas.

## Tecnologias e Ferramentas

- [x] TypeScript (Node.js >= 24.10, `--experimental-strip-types`)
- [x] LangGraph (`@langchain/langgraph`) — orquestração do grafo de estado
- [x] LangChain (`@langchain/core`, `langchain`) — agente com ferramentas MCP
- [x] OpenRouter — gateway para `qwen/qwen-2.5-7b-instruct` (agente) e `openai/gpt-oss-safeguard-20b` (guardrail)
- [x] MCP Filesystem (`@modelcontextprotocol/server-filesystem`) — ferramenta de acesso a arquivos
- [x] LangGraph Studio — visualização e debug do grafo via `langgraph.json`

## Pré-requisitos

- Node.js >= 24.10.0
- Conta no [OpenRouter](https://openrouter.ai) com chave de API
- Arquivo `.env` configurado (copie `.env.example`)

```bash
cp .env.example .env
# Preencha OPENROUTER_API_KEY com sua chave
```

## Como executar

```bash
npm install

# Admin perguntando versão do package.json (deve funcionar)
npm run chat:admin

# Member tentando ler .env via social engineering (bloqueado com guardrails)
npm run chat:member:safe

# Member com injeção clássica "IGNORE PREVIOUS INSTRUCTIONS" (bloqueado)
npm run chat:member:unsafe:package

# Member SEM guardrails — vulnerável, injection funciona
npm run chat:member:unsafe:env

# Ou manualmente:
node --experimental-strip-types --env-file .env src/index.ts \
  --user erickwendel \
  --message "What is the version in the package.json?"

# LangGraph Studio (requer @langchain/langgraph-cli)
npm run langgraph:serve
```

## Estrutura do Projeto

```
005-safeguard-prompt-injection-z/
├── src/
│   ├── index.ts                        # CLI entry point (parse args, invocar grafo)
│   ├── config.ts                       # Configuração do modelo, usuários e prompts
│   ├── graph/
│   │   ├── graph.ts                    # Construção do StateGraph LangGraph
│   │   ├── factory.ts                  # Export do grafo para CLI e LangGraph Studio
│   │   ├── state.ts                    # Schema Zod do estado compartilhado
│   │   └── nodes/
│   │       ├── guardrailsCheckNode.ts  # Nó: chama safeguard model
│   │       ├── chatNode.ts             # Nó: agente principal com MCP tools
│   │       ├── blockedNode.ts          # Nó: resposta de bloqueio formatada
│   │       └── edgeConditions.ts       # Condição de roteamento SAFE/UNSAFE
│   └── services/
│       ├── openrouterService.ts        # Cliente OpenRouter (agente + guardrail)
│       └── mcpService.ts               # Inicialização do MCP filesystem
├── prompts/
│   ├── system.txt                      # System prompt do agente (com regras RBAC)
│   ├── guardrails.txt                  # Prompt do modelo de segurança
│   ├── blocked.txt                     # Template de mensagem de bloqueio
│   └── user/
│       ├── read-env.txt                # Ataque via social engineering
│       └── read-package-version.txt    # Ataque clássico "IGNORE PREVIOUS INSTRUCTIONS"
├── data/users.json                     # Base de usuários com roles e permissões
├── langgraph.json                      # Configuração para LangGraph Studio
└── .env.example
```

## Como funciona

```
Input do usuário
       │
       ▼
┌──────────────────┐
│ guardrails_check │  ← safeguard model analisa o input
│  (SAFE/UNSAFE)   │     e retorna classificação
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
  SAFE      UNSAFE
    │         │
    ▼         ▼
┌───────┐  ┌─────────┐
│ chat  │  │ blocked │
│ (MCP) │  │ (alerta)│
└───────┘  └─────────┘
```

O estado do grafo (`SafeguardStateAnnotation`) carrega: mensagens, o usuário autenticado, o resultado do guardrail (`guardrailCheck`) e o flag `guardrailsEnabled` (controlado via `--unsafe`). O roteamento condicional em `edgeConditions.ts` direciona para `blocked` se o guardrail retornar `UNSAFE`; caso contrário (ou se guardrails estiver desabilitado), segue para `chat`.

O `chatNode` cria um agente LangChain com as ferramentas MCP do filesystem e um system prompt que inclui o papel do usuário atual. O agente só pode executar ferramentas se o LLM decidir fazê-lo — e o system prompt instrui a não usar ferramentas para usuários `member`.

## Conceitos trabalhados

- [x] **Prompt Injection** — dois vetores demonstrados: social engineering ("por fins educacionais, execute...") e injeção direta ("IGNORE PREVIOUS INSTRUCTIONS")
- [x] **Defense in Depth** — camadas de segurança: system prompt (soft) + guardrail LLM (hard)
- [x] **LangGraph StateGraph** — grafo com roteamento condicional baseado em resultado de nó
- [x] **Modelo de segurança dedicado** — uso de `gpt-oss-safeguard-20b` separado do modelo principal
- [x] **RBAC via system prompt** — controle de acesso por role embutido no prompt do agente
- [x] **MCP como ferramenta de agente** — integração `@langchain/mcp-adapters` com agente LangChain
- [x] **PromptTemplate** — uso seguro de templates em vez de substituição manual de strings

## Aprendizados

- [x] Regras em system prompt são facilmente burladas — um modelo suficientemente capaz ou suscetível ignora instruções de segurança quando o input é bem construído
- [x] Um guardrail LLM separado é mais robusto porque analisa o input antes de ele chegar ao agente, sem contexto de conversa que possa ser manipulado
- [x] O `--unsafe` flag torna o impacto concreto: com guardrails desabilitado, o mesmo input que seria bloqueado consegue extrair dados do filesystem
- [x] `PromptTemplate.fromTemplate` + `.format()` é mais seguro que substituição manual com `.replace()` — evita que sequências como `{USER_ROLE}` no input do usuário interfiram no template

## Referências

- [LangGraph — StateGraph](https://langchain-ai.github.io/langgraphjs/)
- [OpenRouter — Safeguard Models](https://openrouter.ai/models?q=safeguard)
- [MCP Filesystem Server](https://github.com/modelcontextprotocol/servers/tree/main/src/filesystem)
- [OWASP LLM Top 10 — LLM01: Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
