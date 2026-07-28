# Exemplo 005 — Brag-Bot: Gerador de Brag Documents com Genkit + Gemini
> App Angular 21 SSR que transforma um relato informal de conquista profissional em um "Brag Document" estruturado, via fluxo Genkit com output JSON tipado (Zod) rodando sobre o Gemini 2.5 Flash.

## Contexto
- Disciplina / Período / Autor: guipalm4

## Descrição
O `brag-bot` resolve um problema comum de carreira: engenheiros raramente registram suas conquistas técnicas em um formato que sirva para PDI, avaliação de desempenho ou promoção. A aplicação recebe um rascunho informal ("Eu otimizei a API ontem e ficou 10x mais rápida porque coloquei redis, a diretoria gostou...") e devolve um **Brag Document** estruturado — título, contexto, ação tomada, impacto de negócio, métricas e tecnologias usadas — pronto para ser reaproveitado em um currículo ou 1:1 com o gestor.

A extração estruturada é feita por um fluxo Genkit (`src/flows.ts`) que injeta uma persona de "Senior Career Consultant" no prompt e força a saída a respeitar um schema Zod (`BragSchema`) via `output: { format: 'json', schema: BragSchema }`, eliminando parsing manual de texto livre. O fluxo roda sobre `gemini-2.5-flash` (`@genkit-ai/google-genai`) e pode ser testado isoladamente com a Genkit Developer UI (`npm run genkit:ui`), fora do ciclo completo da aplicação.

O frontend é um Angular 21 standalone com SSR (Angular SSR + Express), Tailwind CSS 4 e Signals para estado: um dashboard (`DashboardComponent`) lista os Brags gerados e permite submeter um novo relato, e uma tela de detalhe (`DetailComponent`) exibe contexto/impacto/métricas de um Brag específico via rota `/detail/:id`. O servidor Express (`src/server.ts`) expõe `POST /api/brag`, que invoca o `bragGeneratorFlow` diretamente no processo Node — sem uma API separada — e serve o Angular renderizado no servidor para as demais rotas.

## Tecnologias e Ferramentas
- [x] Angular 21 (standalone components, Signals, SSR com hidratação e event replay)
- [x] Angular SSR + Express (servidor único: API REST + renderização SSR)
- [x] Genkit (`genkit`, `@genkit-ai/google-genai`) — definição de flow com schema de entrada/saída tipado
- [x] Zod — validação e tipagem do schema `BragSchema` consumido pela IA
- [x] Gemini 2.5 Flash (`gemini-2.5-flash`) — geração do Brag Document estruturado
- [x] Tailwind CSS 4 (via `@tailwindcss/postcss`)
- [x] Vitest (testes unitários do Angular CLI)
- [x] `.gemini/GEMINI.md` — guia de convenções Angular/TypeScript/acessibilidade para agentes de IA que editam este repositório

## Pré-requisitos
- Node.js compatível com Angular 21
- Variável de ambiente com credenciais do Google AI (Gemini) exigida pelo plugin `googleAI()` do Genkit — configurada localmente em `.env` (não versionado)

## Como executar
```bash
npm install

# subir o app completo (SSR + API /api/brag) em http://localhost:4200
npm start

# alternativa: build de produção + servidor Express standalone
npm run build
node dist/brag-bot/server/server.mjs   # porta 4000 por padrão

# explorar/testar o flow de IA isoladamente na Genkit Developer UI
npm run genkit:ui

# rodar os testes unitários (Vitest)
npm test
```

## Estrutura do Projeto
```
005-brag-bot/
├── src/
│   ├── flows.ts                        # Flow Genkit: prompt + schema Zod + chamada ao Gemini
│   ├── server.ts                       # Express: POST /api/brag + SSR do Angular para as demais rotas
│   └── app/
│       ├── dashboard/                  # Formulário de submissão + lista de Brags gerados
│       ├── detail/                     # Tela de detalhe de um Brag (contexto/impacto/métricas)
│       └── services/brag.service.ts    # Estado em Signals + chamada HTTP a /api/brag
└── .gemini/GEMINI.md                   # Convenções de código para agentes de IA (Angular/TS/a11y)
```

## Como funciona
```
[DashboardComponent] --textarea + submit--> [BragService.generateBrag(prompt)]
        │
        ▼
POST /api/brag { definition } --------> [Express server.ts]
                                              │
                                              ▼
                                   bragGeneratorFlow({ definition })  (src/flows.ts)
                                              │
                             prompt com persona "Career Consultant"
                             + BragSchema (Zod): title, context, actionTaken,
                               businessImpact, metrics[], technologiesUsed[]
                                              │
                                              ▼
                              ai.generate({ output: { format: 'json', schema } })
                                              │
                                              ▼
                              JSON validado + id (uuid) <-- resposta ao frontend
                                              │
                                              ▼
[BragService] adiciona ao signal `brags` --> [DashboardComponent] renderiza card
                                          --> [DetailComponent] via /detail/:id exibe o Brag completo
```

## Conceitos trabalhados
- [x] **Structured output com Zod + Genkit** — em vez de pedir texto livre à IA e fazer parsing manual, o schema `BragSchema` é passado direto como contrato de saída (`output.schema`), garantindo um JSON no formato esperado pelo frontend
- [x] **Prompt engineering orientado a persona e regras explícitas** — o prompt do `bragGeneratorFlow` define persona ("Senior Career Consultant"), tom, regra de inferência de métricas ausentes e regra de idioma, tudo dentro do próprio flow versionado no código
- [x] **SSR com Angular 21 + Express único processo** — o mesmo servidor Express que renderiza o Angular no servidor também expõe a rota de API (`/api/brag`), sem necessidade de um backend separado
- [x] **Estado reativo com Signals** — `BragService` expõe `brags` e `loading` como `WritableSignal`, consumidos diretamente nos templates via `bragService.brags()`/`bragService.loading()`
- [x] **Guia de convenções para agentes de IA (`.gemini/GEMINI.md`)** — regras explícitas de Angular moderno (standalone por padrão, `input()`/`output()`, `OnPush`, controle de fluxo nativo `@if`/`@for`) e de acessibilidade (AXE, WCAG AA) para orientar qualquer agente que edite este código

## Aprendizados
- [x] Forçar o schema de saída da IA (Zod) no próprio flow elimina uma classe inteira de bugs de parsing e deixa o contrato entre IA e frontend explícito no código, não implícito no prompt
- [x] Rodar a API de IA no mesmo processo Express do SSR simplifica o deploy (um único servidor), mas acopla a latência da chamada ao Gemini ao tempo de resposta da rota — um ponto a observar se o volume de geração crescer
- [x] A Genkit Developer UI (`genkit:ui`) permite iterar no prompt e no schema do flow isoladamente, sem precisar navegar pela UI do Angular a cada ajuste

## Documento Original
> Conteúdo original do README (scaffold gerado pelo Angular CLI) preservado em [`README.original.md`](./README.original.md).

## Referências
- [Angular Documentation](https://angular.dev)
- [Genkit Documentation](https://genkit.dev)
- [Gemini API](https://ai.google.dev/gemini-api/docs)
