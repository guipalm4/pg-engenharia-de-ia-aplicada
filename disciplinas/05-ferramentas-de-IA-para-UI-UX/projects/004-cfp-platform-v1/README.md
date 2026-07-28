# Exemplo 004 — CFP Platform v1: E2E com Cypress Tradicional e Cypress AI
> Evolução do CFP Platform (Nx Monorepo, NestJS + Angular 21) com suíte de testes end-to-end em Cypress, comparando asserções tradicionais por seletor com testes semânticos via `cy.prompt` (Cypress AI).

## Contexto
- Disciplina / Período / Autor: guipalm4

## Descrição
O `004-cfp-platform-v1` é uma iteração do `003-cfp-platform`: mesmo monorepo Nx (API NestJS + frontend Angular 21 com Signals) para submissão de talks, dashboard de CFP e cadastro de locais de evento, agora com uma suíte de testes end-to-end em Cypress cobrindo o fluxo de **Cadastro de Evento** (`/event/new`). A mudança foi conduzida pelo mesmo workflow spec-driven via OpenSpec já usado no projeto base — a proposta `create-event-tests` (`openspec/changes/create-event-tests/`) documenta por que e como os testes foram adicionados antes de escrever qualquer `.cy.ts`.

O diferencial deste exemplo é comparar duas abordagens de teste E2E lado a lado, no mesmo fluxo de negócio:
- **`event-registration.cy.ts`** — testes Cypress tradicionais, com seletores explícitos (`#nome`, `#endereco`, `#capacidade`, `#data`, `.submit-btn`, `.error-text`) e asserções `cy.get(...).should(...)`, cobrindo o cenário de sucesso e o cenário de formulário vazio (4 mensagens de validação nativa do Angular Reactive Forms).
- **`event-registration-ai.cy.ts`** — o mesmo fluxo de sucesso reescrito com `cy.prompt([...])`, o comando de IA nativo do Cypress 15, que recebe instruções em linguagem natural ("Type 'Auditório Oracle' in the event name field", "Click the button that submits or saves the event") e resolve os elementos e ações sem depender de seletores CSS fixos — a verificação final também é semântica ("Verify that a success message is visible").

Antes de escrever os testes, o fluxo real do frontend foi explorado com o **Playwright MCP** (evidenciado pelas capturas de estado de página em `.playwright-mcp/`), servindo como reconhecimento da árvore de acessibilidade da aplicação (links de navegação, formulário, mensagens de feedback) que embasou tanto os seletores dos testes tradicionais quanto os prompts em linguagem natural dos testes de IA.

## Tecnologias e Ferramentas
- [x] Nx 22 (monorepo, geração de projetos, cache de build)
- [x] NestJS 11 (API REST)
- [x] Angular 21 (standalone components, Angular Signals, Reactive Forms)
- [x] Cypress 15 (`@nx/cypress`) — testes E2E tradicionais e `cy.prompt` (Cypress AI)
- [x] Playwright MCP — exploração/reconhecimento da UI antes de escrever os testes
- [x] class-validator / class-transformer (validação de DTOs no backend)
- [x] Jest (testes unitários de API e frontend)
- [x] OpenSpec (workflow spec-driven: proposal → design → specs → tasks)

## Pré-requisitos
- Node.js compatível com Angular 21 / Nx 22 (recomendado LTS mais recente)
- npm (o projeto usa `package-lock.json`)
- Para os testes `cy.prompt` (Cypress AI): configuração de IA do Cypress Cloud/Cypress Studio ativa no ambiente local (fora do escopo deste README)

## Como executar
```bash
# instalar dependências (na raiz do projeto 004-cfp-platform-v1)
npm install

# subir a API (NestJS) em http://localhost:3000/api
npx nx serve api

# em outro terminal, subir o frontend (Angular) em http://localhost:4200
npx nx serve frontend

# rodar os testes E2E com Cypress (API e frontend precisam estar no ar)
npx nx e2e frontend-e2e

# rodar apenas os testes unitários
npx nx test api
npx nx test frontend
npx nx test shared-types
```

## Estrutura do Projeto
```
004-cfp-platform-v1/
├── api/                              # NestJS: controllers, services e DTOs (speakers, events)
├── frontend/                         # Angular 21: submissão de talks, dashboard, cadastro de evento
│   └── src/app/
│       ├── cfp-submission/           # Formulário de submissão de talk (Signals)
│       ├── cfp-dashboard/            # Listagem de submissões (Signals)
│       └── event-registration/       # Cadastro de local do evento (Reactive Forms)
├── frontend-e2e/
│   └── cypress/
│       └── e2e/
│           ├── event-registration.cy.ts      # E2E tradicional (seletores CSS)
│           └── event-registration-ai.cy.ts   # E2E com cy.prompt (Cypress AI)
├── .playwright-mcp/                  # Capturas da árvore de acessibilidade via Playwright MCP (reconhecimento)
├── shared-types/                     # SpeakerDTO / EventDTO — contrato único entre API e UI
└── openspec/
    ├── changes/archive/               # Mudanças já implementadas do projeto base (submissão, dashboard)
    ├── changes/create-event-tests/    # Proposta/design/spec/tasks dos testes E2E deste exemplo
    └── specs/                         # Specs vigentes por capability
```

## Como funciona
```
1. Reconhecimento (Playwright MCP)
   navega em /event/new, /talks/new, /dashboard e captura a árvore de acessibilidade
   → informa quais seletores/textos existem para os dois estilos de teste

2. Teste tradicional (event-registration.cy.ts)
   cy.visit('/event/new')
     → cy.get('#nome').type(...) / '#endereco' / '#capacidade' / '#data'
     → cy.get('.submit-btn').click()
     → cy.get('.success-msg').should('contain', 'Evento cadastrado com sucesso!')
   cenário vazio → cy.get('.error-text') deve ter 4 mensagens (uma por campo obrigatório)

3. Teste com IA (event-registration-ai.cy.ts)
   cy.visit('/event/new')
     → cy.prompt(['Type "..." in the event name field', ..., 'Click the button that submits or saves the event'])
     → cy.prompt(['Verify that a success message is visible'])
   sem seletores CSS: a IA resolve os elementos a partir da instrução em linguagem natural
```

## Conceitos trabalhados
- [x] **Testes E2E tradicionais vs. IA-driven** — mesmo cenário de negócio implementado com `cy.get`/`should` e com `cy.prompt`, evidenciando o trade-off entre controle explícito (seletor quebra se o CSS mudar) e resiliência semântica (prompt sobrevive a refactors de classe/id, mas depende de um provedor de IA)
- [x] **Reconhecimento de UI via Playwright MCP** — uso de um agente com MCP para explorar a aplicação real antes de escrever testes, capturando a árvore de acessibilidade como fonte de verdade para seletores e textos
- [x] **Workflow spec-driven (OpenSpec)** — a mudança `create-event-tests` segue o mesmo padrão proposal/design/spec/tasks do projeto base, incluindo uma seção explícita de "Rule of Gold Compliance" nas tasks para garantir que os testes tradicionais usem apenas comandos Cypress convencionais
- [x] **Validação de formulário Angular Reactive Forms** — os testes tradicionais exercitam as 4 mensagens de erro (`Validators.required`, `Validators.min`) do `EventRegistrationComponent` herdado do projeto base

## Aprendizados
- [x] Testes com `cy.prompt` reduzem o acoplamento a seletores CSS, mas trocam previsibilidade determinística por dependência de um provedor de IA — trade-off relevante para decidir onde vale a pena usá-los (fluxos críticos e estáveis vs. fluxos voláteis de UI)
- [x] Explorar a aplicação com Playwright MCP antes de escrever testes tornou explícitos os seletores e textos exatos (evitando "quase certo" nas asserções), tanto para os testes tradicionais quanto para os prompts em linguagem natural
- [x] Formalizar a proposta de teste no OpenSpec antes de implementar (`create-event-tests`) tornou explícita a decisão de não usar bibliotecas de teste baseadas em IA no arquivo tradicional, evitando mistura de estilos no mesmo arquivo

## Documento Original
> Conteúdo original do README (scaffold gerado pelo Nx) preservado em [`README.original.md`](./README.original.md).

## Referências
- [Nx Documentation](https://nx.dev)
- [Cypress Documentation](https://docs.cypress.io)
- [Playwright MCP](https://github.com/microsoft/playwright-mcp)
- [Angular Signals](https://angular.dev/guide/signals)
