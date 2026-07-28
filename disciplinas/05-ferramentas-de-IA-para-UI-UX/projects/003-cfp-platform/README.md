# Exemplo 003 — CFP Platform (Nx Monorepo: NestJS + Angular 21)
> Plataforma de Call for Papers com submissão de talks, dashboard administrativo e cadastro de locais, construída com workflow spec-driven (OpenSpec) em um monorepo Nx.

## Contexto
- Disciplina / Período / Autor: guipalm4

## Descrição
O `cfp-platform` é um monorepo Nx que implementa o fluxo essencial de uma plataforma de Call for Papers (CFP): permitir que palestrantes submetam propostas de talk e que administradores visualizem todas as submissões em um dashboard. O projeto foi desenvolvido seguindo um workflow spec-driven via OpenSpec (`.agent/skills` e `openspec/`), com propostas, designs e specs versionados antes da implementação — os artefatos arquivados em `openspec/changes/archive/` documentam as decisões de cada mudança (`add-cfp-feature` e `add-cfp-dashboard`).

A API (`api/`, NestJS 11) expõe endpoints REST para palestrantes (`/api/speakers`) e locais de evento (`/api/events`), com validação estrita de payload via `class-validator`. O frontend (`frontend/`, Angular 21) consome esses endpoints com componentes standalone que usam Angular Signals para gerenciamento de estado reativo, incluindo formulário de submissão de talks (`CfpSubmissionComponent`), dashboard de listagem (`CfpDashboardComponent`) e cadastro de locais (`EventRegistrationComponent`). Os contratos de dados (`SpeakerDTO`, `EventDTO`) vivem na biblioteca compartilhada `shared-types/`, consumida tanto pela API (nos DTOs de validação) quanto pelo frontend, garantindo consistência de tipos ponta a ponta.

O armazenamento é em memória (arrays em serviços NestJS) — decisão explícita documentada no `design.md` para priorizar velocidade de implementação nesta fase, sem persistência em banco de dados nem autenticação.

## Tecnologias e Ferramentas
- [x] Nx 22 (monorepo, geração de projetos, cache de build)
- [x] NestJS 11 (API REST)
- [x] Angular 21 (standalone components, Angular Signals, Reactive Forms)
- [x] class-validator / class-transformer (validação de DTOs no backend)
- [x] TypeScript (biblioteca `shared-types` compartilhada entre API e frontend)
- [x] Jest (testes unitários de API e frontend) e Playwright (e2e do frontend)
- [x] OpenSpec (workflow spec-driven: proposal → design → specs → tasks)

## Pré-requisitos
- Node.js compatível com Angular 21 / Nx 22 (recomendado LTS mais recente)
- npm (o projeto usa `package-lock.json`)

## Como executar
```bash
# instalar dependências (na raiz do projeto 003-cfp-platform)
npm install

# subir a API (NestJS) em http://localhost:3000/api
npx nx serve api

# em outro terminal, subir o frontend (Angular) — proxy configurado para /api → localhost:3000
npx nx serve frontend

# rodar os testes
npx nx test api
npx nx test frontend
npx nx test shared-types

# rodar e2e
npx nx e2e api-e2e
npx nx e2e frontend-e2e
```

## Estrutura do Projeto
```
003-cfp-platform/
├── api/                        # NestJS: controllers, services e DTOs (speakers, events)
├── api-e2e/                    # Testes e2e da API
├── frontend/                   # Angular 21: submissão de talks, dashboard, cadastro de evento
│   └── src/app/
│       ├── cfp-submission/     # Formulário de submissão de talk (Signals + ngModel)
│       ├── cfp-dashboard/      # Listagem de submissões (Signals + tabela)
│       └── event-registration/ # Cadastro de local do evento (Reactive Forms)
├── frontend-e2e/                # Testes e2e do frontend (Playwright)
├── shared-types/                # SpeakerDTO / EventDTO — contrato único entre API e UI
└── openspec/                    # Propostas, designs e specs (workflow spec-driven)
    ├── changes/archive/          # Mudanças já implementadas e arquivadas
    └── specs/                    # Specs vigentes por capability (cfp-submission, cfp-dashboard)
```

## Como funciona
```
[CfpSubmissionComponent] --POST /api/speakers--> [SpeakerController] --> [SpeakerService] (array em memória)
        │ signals: name, email, talkTitle, isGDE, submissionStatus                │
        │ valida via ValidationPipe + CreateSpeakerDto (class-validator)          │
        ▼                                                                         │
   status: idle → loading → success/error (feedback via role="alert")             │
                                                                                   │
[CfpDashboardComponent] --GET /api/speakers----------------------------------------┘
        │ signals: submissions, isLoading, error
        ▼
   renderiza tabela com nome, email, talk title e badge de status GDE

[EventRegistrationComponent] --POST /api/events--> [EventController] --> [EventService] (array em memória)
        │ Reactive Forms (FormBuilder) com validators required/min
```

## Conceitos trabalhados
- [x] **Workflow spec-driven (OpenSpec)** — cada feature nasceu de um `proposal.md` + `design.md` + `spec.md` antes de virar código, com specs formais em Given/When/Then (`openspec/specs/cfp-submission`, `cfp-dashboard`)
- [x] **Standalone Components (Angular 21)** — todos os componentes do frontend dispensam `NgModule`, importando diretamente o que precisam
- [x] **Angular Signals** — estado de formulário e requisições (`submissionStatus`, `submissions`, `isLoading`, `error`) gerenciado com `signal()` em vez de `BehaviorSubject`/variáveis simples
- [x] **Validação de contrato via DTO compartilhado** — `SpeakerDTO`/`EventDTO` definidos uma única vez em `shared-types` e reaproveitados nos `class-validator` DTOs da API
- [x] **Acessibilidade (WAI-ARIA)** — `aria-labelledby`, `aria-required`, `role="alert"` e `aria-live="polite"` nos formulários e mensagens de feedback
- [x] **Monorepo Nx** — `api`, `frontend`, `shared-types` e seus respectivos projetos `-e2e` gerenciados com cache e grafo de dependências do Nx

## Aprendizados
- [x] Formalizar proposal/design/spec antes de implementar (OpenSpec) tornou explícitas decisões que normalmente ficam implícitas no código, como a escolha consciente de armazenamento em memória e a ausência de autenticação nesta fase
- [x] Compartilhar DTOs via uma lib (`shared-types`) elimina duplicação de contrato entre backend e frontend, mas exige disciplina para manter o DTO de validação (`CreateSpeakerDto`) sincronizado com a interface compartilhada
- [x] Signals simplificam o rastreio de estados de UI (idle/loading/success/error) em comparação a lidar manualmente com múltiplas variáveis booleanas de controle

## Documento Original
> Conteúdo original do README (scaffold gerado pelo Nx) preservado em [`README.original.md`](./README.original.md).

## Referências
- [Nx Documentation](https://nx.dev)
- [NestJS Documentation](https://docs.nestjs.com)
- [Angular Signals](https://angular.dev/guide/signals)
