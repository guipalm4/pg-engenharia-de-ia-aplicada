# Exemplo 003 — Agentes de Desenvolvimento com GitHub Copilot Custom Agents

> Definição de agentes especializados de IA para fluxos de desenvolvimento usando GitHub Copilot Agent Mode e instruções estruturadas em `.github/agents/`

## Contexto

- **Disciplina:** 03 — Model Context Protocol (MCPs)
- **Autor:** guipalm4

## Descrição

Este projeto demonstra como estruturar agentes de IA especializados para pipelines de desenvolvimento de software, usando o formato de **GitHub Copilot Custom Agents** (`.github/agents/*.agent.md`). Cada arquivo define um agente com identidade, missão, ferramentas autorizadas e modelo LLM, criando personas reutilizáveis dentro de um repositório.

O projeto define quatro agentes complementares que cobrem o ciclo completo de qualidade de software: um agente de desenvolvimento TypeScript com disciplina TDD, um planejador de testes que navega a aplicação real para criar cenários, um gerador que transforma o plano em código Playwright executável, e um healer que diagnostica e corrige testes quebrados de forma autônoma.

O conceito central é que **instruções bem escritas são o prompt de sistema do agente** — definindo escopo, princípios de design, ferramentas disponíveis e critérios de sucesso em um único arquivo versionado com o código. Isso elimina a necessidade de repetir contexto a cada sessão e garante consistência entre diferentes desenvolvedores e IAs.

A integração com MCP aparece diretamente nos agentes de Playwright: os agentes `playwright-test-planner` e `playwright-test-healer` declaram um servidor MCP `playwright-test` (`npx playwright run-test-mcp-server`) nas suas definições, conectando o agente LLM a um browser real via protocolo MCP.

## Tecnologias e Ferramentas

- [x] **GitHub Copilot Custom Agent Mode** — agentes definidos via `.github/agents/*.agent.md` com frontmatter YAML
- [x] **MCP (Model Context Protocol)** — servidor `playwright-test` embutido nas definições dos agentes de Playwright
- [x] **Playwright MCP** — `npx playwright run-test-mcp-server` como MCP server para controle de browser real
- [x] **LangChain Context7 MCP** — ferramenta `context7/*` disponível para o agente `developer`
- [x] **Claude Sonnet 4** — modelo declarado nos agentes de planejamento e cura de testes

## Como funciona

### Estrutura de um agente

Cada arquivo `.github/agents/*.agent.md` segue o formato:

```yaml
---
name: nome-do-agente
description: quando usar este agente (usado pelo orchestrator para roteamento)
tools:
  - search
  - edit
  - playwright-test/browser_navigate   # tool de MCP server
model: Claude Sonnet 4
mcp-servers:
  playwright-test:
    type: stdio
    command: npx
    args: [playwright, run-test-mcp-server]
---

# Instruções do agente em markdown
```

### Os quatro agentes

```
developer.agent.md
  ├── Missão: edições mínimas provadas por testes
  ├── Ferramentas: vscode, execute, edit, search, context7/*, todo
  └── Princípios: SOLID, DI, imutabilidade, prompts em arquivos

playwright-test-planner.agent.md
  ├── Missão: criar plano de testes navegando a aplicação real
  ├── Ferramentas: playwright-test/browser_*, planner_setup_page, planner_save_plan
  └── Fluxo: setup → explorar → mapear fluxos → salvar plano markdown

playwright-test-generator.agent.md
  ├── Missão: converter itens do plano em código Playwright executável
  ├── Ferramentas: playwright-test/browser_*, generator_setup_page, generator_write_test
  └── Fluxo: setup → executar passo a passo → ler log → gerar arquivo .spec.ts

playwright-test-healer.agent.md
  ├── Missão: depurar e corrigir testes quebrados autonomamente
  ├── Ferramentas: playwright-test/test_run, test_debug, browser_snapshot, edit
  └── Fluxo: run → debug → analisar erro → editar → verificar → iterar
```

### Pipeline completo de qualidade

```
Aplicação em desenvolvimento
        │
        ▼
playwright-test-planner  ─── navega o browser → salva specs/plan.md
        │
        ▼
playwright-test-generator ── executa cada passo → gera tests/*.spec.ts
        │
        ▼
playwright-test-healer   ─── roda testes → depura falhas → corrige código
        │
        ▼
developer                ─── implementa features/fixes com TDD
```

## Conceitos trabalhados

- [x] **Custom Agent Mode** — definição de agentes especializados com escopo, missão e ferramentas restritas via frontmatter YAML
- [x] **MCP integrado na definição do agente** — servidor `playwright-test` declarado inline com `type: stdio` e `command: npx playwright run-test-mcp-server`
- [x] **Roteamento por description** — o campo `description` funciona como critério de seleção do agente pelo orchestrator, similar a `@playwright-test-planner`
- [x] **Restrição de ferramentas por agente** — cada agente tem acesso apenas às ferramentas necessárias, evitando side effects indesejados
- [x] **Agente autônomo não-interativo** — `playwright-test-healer` explicita "do not ask user questions" e itera até o teste passar
- [x] **Critérios de sucesso explícitos** — `developer.agent.md` define "task is done when" com checklist objetiva (tipos, testes, suite completa, critérios do usuário)

## Aprendizados

- [x] Agentes com instruções bem delimitadas ("Won't do") são mais confiáveis que agentes generalistas — o escopo restrito reduz alucinações e desvios
- [x] O campo `description` em `.github/agents/` é o seletor de roteamento — uma boa description é mais importante que o nome do arquivo
- [x] MCP servers podem ser declarados inline na definição do agente, acoplando o protocolo ao contexto sem configuração global
- [x] O padrão planner → generator → healer separa responsabilidades de forma que cada agente pode ser invocado e melhorado independentemente
- [x] Versionar instruções de agente com o código garante que o comportamento da IA evolui junto com o projeto, não de forma ad-hoc por prompt no chat

## Referências

- [GitHub Copilot Custom Agent Mode](https://docs.github.com/en/copilot/customizing-copilot/using-github-copilot-agents)
- [Playwright MCP Server](https://playwright.dev/docs/mcp)
- [Model Context Protocol](https://modelcontextprotocol.io)
