# Playwright + MCP — Geração de Testes com IA Agentiva

> Demonstra como usar o Playwright MCP para que um agente de IA navegue em uma aplicação real, observe o comportamento da interface e gere testes Playwright TypeScript automaticamente, iterando até que passem.

## Contexto
- Disciplina: Fundamentos de IA e LLMs
- Período: Abril/2026
- Autor: guipalm4

## Descrição
Este exemplo explora a geração agentiva de testes end-to-end: em vez de escrever testes manualmente, um agente de IA (Claude ou Copilot) recebe um cenário em linguagem natural, usa as ferramentas do Playwright MCP para navegar de verdade no navegador, observa a UI e só então emite o código de teste TypeScript — baseado no que realmente viu, não em suposições.

A aplicação-alvo é uma [web app Vanilla JS](https://erickwendel.github.io/vanilla-js-web-app-example/) com um formulário e uma lista dinâmica. O agente deve gerar testes para dois cenários: envio do formulário (verificando que o item aparece na lista) e validação de campos obrigatórios.

O fluxo é totalmente agentico: o agente executa cada passo com as ferramentas do MCP, acumula o histórico de interações com o browser, e só emite o teste ao final. Depois salva o arquivo, roda `npx playwright test` e itera caso algum assertion falhe. O arquivo `.prompt.md` configura esse comportamento como um prompt customizável reutilizável no VS Code Copilot Chat.

A integração contínua está prevista via GitHub Actions, rodando apenas o browser Chromium para manter a pipeline leve e rápida.

## Tecnologias e Ferramentas
- [x] **Playwright Test** (`@playwright/test`): runner de testes E2E com suporte a TypeScript
- [x] **Playwright MCP** (`@playwright/mcp`): servidor MCP que expõe ferramentas de automação de browser para agentes de IA
- [x] **`.prompt.md`** (VS Code Copilot): arquivo de prompt reutilizável que instrui o agente a agir como gerador de testes
- [x] **`example.mcp.json`**: configuração do servidor MCP para o editor (token de extensão Playwright)
- [x] **GitHub Actions**: CI com Chromium para execução dos testes gerados

## Pré-requisitos

O Playwright MCP requer um token de extensão para autenticar o agente no browser:

1. Obtenha seu `PLAYWRIGHT_MCP_EXTENSION_TOKEN` na configuração da extensão Playwright para VS Code
2. Substitua `YOUR_TOKEN_HERE` no arquivo `example.mcp.json`:
   ```json
   {
     "servers": {
       "playwright": {
         "command": "npx",
         "args": ["@playwright/mcp@latest", "--extension"],
         "env": {
           "PLAYWRIGHT_MCP_EXTENSION_TOKEN": "SEU_TOKEN_AQUI"
         }
       }
     }
   }
   ```
3. Configure o MCP server no seu editor apontando para este `example.mcp.json`

## Como executar

```bash
# 1. Instalar dependência de teste
npm i -D @playwright/test

# 2. Instalar apenas o Chromium (menor e mais rápido)
npx playwright install --with-deps chromium

# 3. Abrir o VS Code Copilot Chat com o prompt de geração
#    Selecione o arquivo prompts/generate_test.prompt.md como base do chat
#    Envie o cenário do arquivo prompts/generate-tests.md

# 4. Após o agente gerar e salvar o arquivo de teste, rodar:
npm test
# ou diretamente:
npx playwright test
```

## Estrutura do Projeto

```
exemplo-006-playwright-testes/
├── example.mcp.json                    # Configuração do servidor Playwright MCP (token de extensão)
├── tests/                              # Diretório onde o agente salva os testes gerados
└── prompts/
    ├── project-scaffolding.md          # Prompt de setup: instala Playwright, configura baseURL e CI
    ├── generate-tests.md               # Cenários em linguagem natural para o agente testar
    └── generate_test.prompt.md         # Prompt customizado (.prompt.md) do VS Code Copilot Chat
```

## Como funciona

```
Configuração
  example.mcp.json                     → registra @playwright/mcp como servidor MCP no editor
  generate_test.prompt.md              → define o papel do agente: playwright test generator

Loop agentivo (por cenário em generate-tests.md)
  agente recebe cenário em texto       → ex: "submeter formulário e checar lista"
  mcp.navigate(url)                    → abre https://erickwendel.github.io/vanilla-js-web-app-example/
  mcp.snapshot() / mcp.screenshot()   → observa a UI real (não assume seletores)
  mcp.click() / mcp.fill()            → interage com os elementos do formulário
  mcp.snapshot()                       → verifica estado da lista após a ação
  (repete para validação de campos)

Geração e validação
  agente emite TypeScript              → test usa @playwright/test + getByRole (seletores semânticos)
  agente salva em tests/              → grava o arquivo gerado
  npx playwright test                  → executa; agente itera se algum teste falhar

CI (GitHub Actions)
  npm ci                               → instala dependências
  npx playwright install --with-deps chromium
  npm test                             → executa suite; HTML report salvo como artifact em falha
```

## Conceitos trabalhados
- [x] **Playwright MCP como ferramenta agentiva** — o servidor MCP expõe `navigate`, `click`, `fill`, `snapshot` e `screenshot` como ferramentas que o agente usa no loop de raciocínio, transformando o browser em um ambiente observável
- [x] **Prompt files (`.prompt.md`)** — arquivos de instrução reutilizáveis do VS Code Copilot Chat que definem o comportamento do agente sem precisar reescrever o sistema prompt a cada sessão
- [x] **Geração de testes baseada em observação** — o agente não infere seletores do código-fonte; ele navega, faz snapshot da acessibility tree e usa `getByRole` + nomes semânticos, resultando em testes mais robustos
- [x] **Loop de geração iterativa** — o agente executa o teste após gerar e corrige assertion errors autonomamente antes de entregar o resultado final
- [x] **CI minimalista com Chromium** — instalar apenas um browser reduz o tempo de setup de CI em ~60% comparado ao download completo dos três browsers padrão do Playwright

## Aprendizados
- [x] Separar o prompt de scaffolding (`project-scaffolding.md`) do prompt de geração (`generate_test.prompt.md`) permite reutilizar a instrução do agente em qualquer aplicação, trocando apenas o cenário
- [x] O Playwright MCP com `--extension` requer token porque acessa o browser real do usuário (não headless), o que permite testar fluxos que dependem de autenticação ou estado local já existente
- [x] Instruir o agente a **não gerar código antes de completar todos os passos** (`DO NOT generate test code based on the scenario alone`) é crítico: sem isso, o agente tende a inventar seletores que não existem na página
- [x] `getByRole` + nome acessível é preferível a seletores CSS/XPath porque sobrevive a mudanças de classe e estrutura de markup, tornando o teste gerado mais estável a longo prazo

## Referências
- [Playwright MCP — npm](https://www.npmjs.com/package/@playwright/mcp)
- [Playwright Test — documentação oficial](https://playwright.dev/docs/intro)
- [Model Context Protocol (MCP) — spec](https://modelcontextprotocol.io/)
- [VS Code Copilot — Prompt Files (.prompt.md)](https://code.visualstudio.com/docs/copilot/copilot-customization#_prompt-files-experimental)
- [Aplicação-alvo — vanilla-js-web-app-example](https://erickwendel.github.io/vanilla-js-web-app-example/)
- [GitHub Actions — Playwright workflow](https://playwright.dev/docs/ci-intro)

---
> Gerado automaticamente por agente IA. Atualize conforme necessário.
