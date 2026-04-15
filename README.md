# Engenharia de IA Aplicada — Pós-Graduação UniPDS

> Repositório de projetos práticos desenvolvidos ao longo da pós-graduação em Engenharia de IA Aplicada.
> Cada exemplo é autocontido, documentado e executável localmente.

**Autor:** guipalm4 · **Instituição:** UniPDS · **Início:** 2026

---

## Disciplinas

| # | Disciplina | Projetos |
|---|-----------|---------|
| 01 | [Fundamentos de IA e LLMs](#01--fundamentos-de-ia-e-llms) | 10 exemplos |

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
