# Engenharia de IA Aplicada — Pós-Graduação UniPDS

> Repositório de projetos práticos desenvolvidos ao longo da pós-graduação em Engenharia de IA Aplicada.
> Cada exemplo é autocontido, documentado e executável localmente.

**Autor:** guipalm4 · **Instituição:** UniPDS · **Início:** 2026

---

## Disciplinas

| # | Disciplina | Projetos |
|---|-----------|---------|
| 01 | [Fundamentos de IA e LLMs](#01--fundamentos-de-ia-e-llms) | 14 exemplos |
| 02 | [APIs de IA Generativa e Prompt Engineering](#02--apis-de-ia-generativa-e-prompt-engineering) | 7 projetos |
| 03 | [Model Context Protocol (MCPs)](#03--model-context-protocol-mcps) | 6 projetos |
| 04 | [Criação de Agentes](#04--criação-de-agentes) | 2 projetos |

---

## 01 · Fundamentos de IA e LLMs

Explora os fundamentos práticos de modelos de linguagem, machine learning no browser e Node.js, IA agentiva e uso de MCP como infraestrutura de desenvolvimento assistido por IA.

### Machine Learning com TensorFlow.js

| # | Projeto | O que demonstra |
|---|---------|----------------|
| 000 | [Classificação de Perfil com Rede Neural](disciplinas/01-fundamentos-IA-LLM/projects/exemplo-000/README.md) | Rede neural densa em Node.js classifica perfis em `premium`, `medium` ou `basic` usando `@tensorflow/tfjs-node` |
| 001 | [Recomendações em Mini E-commerce](disciplinas/01-fundamentos-IA-LLM/projects/exemplo-001/README.md) | Modelo TensorFlow.js no browser prevê probabilidade de compra e gera lista de recomendações por usuário |

### IA em Jogos

| # | Projeto | O que demonstra |
|---|---------|----------------|
| 002 | [Duck Hunt JS — Vencendo Qualquer Jogo](disciplinas/01-fundamentos-IA-LLM/projects/exemplo-002-vencendo-qualquer-jogo/README.md) | Reimplementação do Duck Hunt como base para explorar como IAs aprendem a jogar e vencer jogos digitais |

### LLM Local no Navegador — Chrome Built-in AI

Série de três demos progressivos usando o **Gemini Nano on-device** via Chrome AI API — sem servidor, sem API key, inferência 100% local.

| # | Projeto | O que demonstra |
|---|---------|----------------|
| 003 | [Web AI 01 — LLM Local no Navegador](disciplinas/01-fundamentos-IA-LLM/projects/exemplo-003-webai01/README.md) | Inferência com `LanguageModel` API nativa do Chrome, sem dependências externas |
| 004 | [Web AI 02 — Temperature e Top-K](disciplinas/01-fundamentos-IA-LLM/projects/exemplo-004-webai02-temperature-and-topK/README.md) | Controle em tempo real dos parâmetros de amostragem e cancelamento de geração via `AbortController` |
| 005 | [Web AI 03 — Entrada Multimodal](disciplinas/01-fundamentos-IA-LLM/projects/exemplo-005-webai03-multimodal/README.md) | Texto, imagem e áudio como entrada; resposta traduzida automaticamente com Chrome Translation API |

### IA Agentiva com Playwright MCP

Série sobre agentes que controlam um browser real via **Playwright MCP** — navegação, extração de dados e geração de testes sem intervenção humana.

| # | Projeto | O que demonstra |
|---|---------|----------------|
| 006 | [Playwright MCP — Geração de Testes](disciplinas/01-fundamentos-IA-LLM/projects/exemplo-006-playwright-testes/README.md) | Agente observa uma aplicação real e gera testes Playwright TypeScript que passam no CI |
| 007 | [Playwright MCP — Navegação Agentiva](disciplinas/01-fundamentos-IA-LLM/projects/exemplo-007-playwright-navegacao/README.md) | Agente navega em múltiplas páginas, extrai dados de um perfil público e preenche um formulário real |

### MCP como Ferramenta de Desenvolvimento

| # | Projeto | O que demonstra |
|---|---------|----------------|
| 008 | [Context7 MCP + Better Auth + Next.js](disciplinas/01-fundamentos-IA-LLM/projects/exemplo-008-context7/README.md) | Uso do Context7 MCP para consultar documentação atualizada durante a geração de código — aplicado a um demo de autenticação OAuth com Next.js e SQLite |
| 009 | [Grafana MCP + Observabilidade + Diagnóstico de Bugs](disciplinas/01-fundamentos-IA-LLM/projects/exemplo-009-grafana-mcp/README.md) | Uso do Grafana MCP para investigar bugs de produção via linguagem natural no IDE — consultando métricas, logs e traces de uma app Node.js com OpenTelemetry |

### Modelos Locais com Ollama

| # | Projeto | O que demonstra |
|---|---------|----------------|
| 010 | [Modelos Locais com Ollama: Censura, Alinhamento e Chain-of-Thought](disciplinas/01-fundamentos-IA-LLM/projects/exemplo-010-ollama/README.md) | Comparação entre modelo sem guardrails (`llama2-uncensored:7b`) e modelo alinhado (`gpt-oss:20b`) com raciocínio interno visível via campo `thinking` — tudo rodando localmente via Ollama |

### LLMs via API Gateway

| # | Projeto | O que demonstra |
|---|---------|----------------|
| 011 | [Acesso Unificado a LLMs com OpenRouter](disciplinas/01-fundamentos-IA-LLM/projects/exemplo-011-openrouter/README.md) | Uso do OpenRouter como gateway OpenAI-compatível para acessar o Gemma 3 27B (Google AI Studio) via tier gratuito — com roteamento transparente e rastreamento de custo por token |

### Embeddings e Busca Semântica

| # | Projeto | O que demonstra |
|---|---------|----------------|
| 012 | [Busca Semântica em PDF com Embeddings e Neo4j](disciplinas/01-fundamentos-IA-LLM/projects/exemplo-012-embeddings-neo4j/README.md) | Pipeline completo de indexação vetorial: PDF → chunks → embeddings locais (HuggingFace Transformers) → Neo4j Vector Store → busca por similaridade semântica em linguagem natural |
| 013 | [RAG Completo com Embeddings, Neo4j e OpenRouter](disciplinas/01-fundamentos-IA-LLM/projects/exemplo-013-embeddings-neo4j-rag/README.md) | Pipeline RAG end-to-end: indexação de PDF com embeddings locais no Neo4j Vector Store e geração de respostas via LLM (OpenRouter) orquestrado pelo LangChain com `RunnableSequence` |

---

## 02 · APIs de IA Generativa e Prompt Engineering

Explora o consumo de APIs de IA generativa em produção: autenticação, roteamento inteligente entre modelos, prompt engineering e testabilidade de integrações com LLMs.

### Roteamento e Gateway de LLMs

| # | Projeto | O que demonstra |
|---|---------|----------------|
| 001 | [Smart Model Router Gateway](disciplinas/02-APIs-IA-generativa-prompt-engineering/projects/001-smart-model-router-gateway/README.md) | Gateway HTTP (Fastify) que roteia requisições para o melhor LLM de um pool via OpenRouter, selecionando por estratégia configurável de preço, latência ou throughput |

### Grafos de Agentes com LangGraph

| # | Projeto | O que demonstra |
|---|---------|----------------|
| 002 | [Roteador de Intenções com LangGraph](disciplinas/02-APIs-IA-generativa-prompt-engineering/projects/002-langchain-intro/README.md) | Grafo de estado (LangGraph) com roteamento condicional que detecta intenção em mensagens de texto (uppercase / lowercase / fallback) e expõe o grafo via API Fastify e LangGraph Studio |
| 003 | [Agendamento Médico Conversacional](disciplinas/02-APIs-IA-generativa-prompt-engineering/projects/003-medical-appointment-z/README.md) | Sistema de agendamento e cancelamento de consultas por linguagem natural: LangGraph com roteamento condicional real, extração de entidades via structured output Zod, serviço in-memory com verificação de conflito e LangSmith tracing |
| 004 | [Recomendador de Músicas com Memória Persistente](disciplinas/02-APIs-IA-generativa-prompt-engineering/projects/004-song-highlights-z/README.md) | Chatbot conversacional de recomendação musical com grafo LangGraph multi-nó (chat, savePreferences, summarize), memória de longo prazo em PostgreSQL via checkpointer/store, preferências por usuário em SQLite e sumarização automática de histórico com Zod structured output |
| 005 | [Defesa contra Prompt Injection com LangGraph e Guardrails LLM](disciplinas/02-APIs-IA-generativa-prompt-engineering/projects/005-safeguard-prompt-injection-z/README.md) | Demo educacional de ataque e defesa: grafo LangGraph com nó guardrail dedicado (`gpt-oss-safeguard-20b`) que intercepta prompts maliciosos antes do agente principal, demonstrando por que regras em system prompt são insuficientes sem um modelo de segurança separado |
| 006 | [RAG com NL2Cypher: Análise de Vendas em Neo4j](disciplinas/02-APIs-IA-generativa-prompt-engineering/projects/006-rag-neo4j-students-z/README.md) | Pipeline RAG que converte perguntas em linguagem natural para Cypher via LangGraph multi-nó (planejamento, geração, execução, autocorreção e síntese analítica), consultando grafo Neo4j de estudantes/vendas/progresso e exposto via API Fastify |
| 007 | [Análise de Documentos com LLM Multimodal e LangGraph](disciplinas/02-APIs-IA-generativa-prompt-engineering/projects/007-doc-analysis/README.md) | Pipeline Q&A sobre PDFs: LangGraph com `StateGraph` Zod, PDF enviado como `image_url` base64 para modelo de visão (Gemini 2.5 Flash via OpenRouter) e exposto via Fastify com upload multipart |

---

## 03 · Model Context Protocol (MCPs)

Explora a criação e composição de servidores MCP para conectar agentes LLM a fontes de dados externas, sistemas de arquivos e bancos de dados — transformando ferramentas arbitrárias em primitivas nativas de agente.

### Agentes com Múltiplos MCP Tools

| # | Projeto | O que demonstra |
|---|---------|----------------|
| 001 | [Agente com Múltiplos MCP Tools](disciplinas/03-mcps/projects/001-multiple-mcp-tools-z/README.md) | Agente LangGraph que coordena três MCP tools (MongoDB, Filesystem e CSV-to-JSON) para executar um pipeline de dados completo via linguagem natural: CSV → JSON → MongoDB → query analítica → relatório em disco |
| 002 | [Agente Google Trends: Transformando Serviços em Ferramentas](disciplinas/03-mcps/projects/002-google-trends-agent/README.md) | Agente LangGraph que encapsula a API SerpAPI/Google Trends como `tool()` LangChain para recomendar títulos de vídeo com dados reais de tendência via grafo researcher → responder exposto por API Fastify |
| 003 | [Agentes de Desenvolvimento com GitHub Copilot Custom Agents](disciplinas/03-mcps/projects/003-dev-instructions-agents/README.md) | Quatro agentes especializados definidos em `.github/agents/*.agent.md` cobrindo o pipeline completo de qualidade: developer TDD, playwright planner, test generator e test healer autônomo — com servidor MCP Playwright declarado inline nas definições |
| 004 | [Skills: Conhecimento Modular para Agentes de IA](disciplinas/03-mcps/projects/004-skills/README.md) | Instalação e uso de skills via `npx skills` — pacotes de conhecimento (`ffmpeg`, `find-skills`, `neo4j-cypher-guide`) que complementam MCPs estendendo agentes com guias especializados rastreados por `skills-lock.json` |

### Criação de Servidores MCP

| # | Projeto | O que demonstra |
|---|---------|----------------|
| 005 | [MCP do Zero: Servidor de Criptografia](disciplinas/03-mcps/projects/005-mcps-do-zero-z/README.md) | Servidor MCP construído do zero com o `@modelcontextprotocol/sdk` que expõe criptografia AES-256-CBC (chave derivada por scrypt) como Tools (`encrypt_message`/`decrypt_message`), Resource (`encryption://info`) e Prompt — schemas Zod tipados, transporte Stdio e testes de integração com `Client` MCP real |
| 006 | [Sua API Legada como MCP](disciplinas/03-mcps/projects/06-your-legacy-api-as-mcp/README.md) | Padrão *legacy API as MCP*: uma camada MCP fina envolve uma API REST legada (Fastify + MongoDB) e expõe o CRUD de clientes como Tools (list/get/create/update/delete), Resource (`customers://api-info`) e Prompt — separação em camadas DDD, `CustomerHttpClient` falando HTTP com a API e testes de integração via `Client` MCP real |

---

## 04 · Criação de Agentes

Explora a construção de agentes autônomos do zero: o ciclo perceber→planejar→agir→avaliar, guardrails de segurança, observabilidade e a separação entre a definição declarativa do agente e o runtime que o executa.

### Agentes Orientados a Contratos

| # | Projeto | O que demonstra |
|---|---------|----------------|
| 001 | [Agentes Orientados a Contratos](disciplinas/04-criacao-de-agentes/projects/001-contratos/README.md) | Runtime Python genérico que executa agentes definidos 100% por contratos Markdown/YAML (nove arquivos: identidade, ciclo, decisão, skills, limites, ganchos, memória) — loop perceber→planejar→agir→avaliar com structured output forçado, circuit breaker com autocorreção, guardrails (ferramentas obrigatórias, confirmação humana, limites de tempo/tokens/estagnação), telemetria estruturada em `trace.json` e quatro modos de operação |
| 002 | [Por Dentro do Runtime](disciplinas/04-criacao-de-agentes/projects/002-runtime/README.md) | Mergulho nos internos do runtime de 001: mesmo código, perspectiva invertida — mapeia cada chave YAML do contrato ao módulo Python que a lê (`contratos.py`, `ciclo.py`, `planejador.py`, `ferramentas.py`, `executor.py`, `telemetria.py`), detalhando o circuit breaker e o debug de agentes via `trace.json` (relacionar cada etapa do trace ao código que a gerou) |

---

## Estrutura do Repositório

```
disciplinas/
└── 01-fundamentos-IA-LLM/
    ├── docs/          # Ementa, material de apoio e indicações de leitura
    └── projects/      # Um diretório por exemplo, com README próprio
shared/
└── templates/         # Templates reutilizáveis (README, commits)
.claude/
└── commands/          # Skills do Claude Code usadas no repositório
```

---

## Como usar este repositório

Cada projeto é independente. Para executar qualquer exemplo:

1. Acesse o diretório do projeto
2. Leia o `README.md` local — ele contém pré-requisitos, setup e comandos
3. Siga a seção **Como executar**

Nenhum projeto exige que outro esteja rodando em paralelo.
