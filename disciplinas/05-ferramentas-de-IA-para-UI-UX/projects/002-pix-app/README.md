# Exemplo 002 — PixApp: Figma/Stitch to Code com Design Tokens em Angular 21

> Aplicação Angular 21 (Standalone Components) de transferência Pix onde cada tela nasce de um prompt estruturado que converte briefing de branding, spec do Figma Dev Mode ou HTML bruto do Google Stitch em componentes que consomem exclusivamente CSS Custom Properties — nunca cor ou espaçamento hardcoded.

## Contexto
- Disciplina / Período / Autor: guipalm4

## Descrição
Este projeto demonstra um pipeline de **handoff design-to-code assistido por IA**, onde a consistência visual é garantida não por revisão manual, mas por uma regra explícita repetida em todo prompt: é proibido usar cor hexadecimal ou espaçamento absoluto no CSS gerado — tudo deve consumir os tokens nativos definidos em `src/styles.css` via `var(--nome-do-token)`.

O fluxo começa em `briefing/branding-briefing.txt`, um texto solto de branding (paleta, tipografia, escala de espaçamento em múltiplos de 4px) que o `prompts/design-tokens-generator.md` converte em CSS puro (`:root { --color-primary: ... }`). A partir daí, três fontes de UI diferentes alimentam o mesmo sistema de tokens:

1. **Figma Dev Mode → Angular** (`prompts/figma-to-angular.md` + `componente-figma.txt`): a imagem de alta fidelidade do Figma e a spec estrutural (`briefing/figma-specs.txt`, com Auto Layout, gaps e cores em hex) geram o `PixHistoryComponent` — um Standalone Component com `signal` de transações mockadas e `@for` do control flow moderno do Angular, substituindo cada valor hexadecimal da spec por um token.
2. **Google Stitch → Angular** (`prompts/stitch-code-refactor.md` + `refatoracao-stich.txt`): um protótipo gerado pelo Google Stitch (`stitch/comprovante_stitch.html`, Tailwind + cores Tailwind arbitrárias) é refatorado para o `PixReceiptComponent`, trocando as classes utilitárias por CSS que consome os mesmos tokens do `PixHistoryComponent`.
3. **Acessibilidade como contrato** (`prompts/a11y-component-generator.md`): o `ErrorModal` é gerado com marcação WAI-ARIA obrigatória (`role="alertdialog"`, `aria-modal`, foco automático no botão de fechar via `ngAfterViewInit`, fechamento por tecla ESC via `@HostListener`) — regras de acessibilidade tratadas como requisito de prompt, não afterthought.

O fluxo de negócio (`prompts/adicionar-fluxo-comprovante.txt`) integra os três: `PixTransfer` alterna entre formulário e `PixReceiptComponent` via `@if/@else` quando o valor é válido, ou exibe o `ErrorModal` quando a transferência excede R$ 5.000,00. Ajustes finos de responsividade e contraste (`prompts/correcao_css.md`) — menu lateral colapsável em mobile via signal `isMenuOpen`, correção de cor de texto no recibo — também partem de prompt, não de edição direta.

## Tecnologias e Ferramentas
- [x] Angular 21 (Standalone Components, Signals, `input`/`output`, novo control flow `@if`/`@for`)
- [x] Google Gemini (geração de componentes a partir de imagem + spec textual)
- [x] Google Stitch (protótipo HTML/Tailwind como ponto de partida)
- [x] Figma Dev Mode (spec estrutural para fidelidade de layout)
- [x] CSS Custom Properties como Design Tokens
- [x] WAI-ARIA / WCAG (acessibilidade via prompt)
- [x] Vitest (test runner do Angular CLI)

## Pré-requisitos
- Node.js compatível com Angular CLI 21 (`^20.19.0 || ^22.12.0 || ^24.0.0`)
- Nenhuma API key necessária — a geração de código via IA (Gemini/Stitch) acontece fora do runtime da aplicação, os prompts em `prompts/` são artefatos de documentação do processo

## Como executar
```bash
npm install
npm start        # ng serve, http://localhost:4200/
npm test         # ng test (Vitest)
npm run build    # ng build, saída em dist/
```

## Estrutura do Projeto
```
002-pix-app/
├── briefing/
│   ├── branding-briefing.txt      # Paleta, tipografia e espaçamento em texto solto (input do gerador de tokens)
│   ├── figma-specs.txt            # Spec estrutural do Figma Dev Mode (Auto Layout, cores hex, tipografia)
│   └── google-stitch.txt          # Prompt usado no Google Stitch para gerar o protótipo do recibo
├── imagem/
│   └── extrato-pix.png            # Imagem de alta fidelidade do Figma (input visual do PixHistoryComponent)
├── stitch/
│   └── comprovante_stitch.html    # Protótipo bruto do Google Stitch (Tailwind), ponto de partida do recibo
├── prompts/
│   ├── design-tokens-generator.md     # Papel: Design System Engineer — briefing → CSS tokens
│   ├── figma-to-angular.md            # Papel: Front-end Sênior — imagem Figma + spec → PixHistoryComponent
│   ├── componente-figma.txt           # Invocação do prompt acima com os arquivos reais anexados
│   ├── stitch-code-refactor.md        # Papel: Front-end Sênior — HTML/CSS Stitch → PixReceiptComponent
│   ├── refatoracao-stich.txt          # Invocação do prompt acima
│   ├── a11y-component-generator.md    # Papel: Especialista A11y — regras WAI-ARIA obrigatórias
│   ├── adicionar-fluxo-comprovante.txt # Integração do recibo ao fluxo de transferência
│   ├── criacao-menu-extrato.txt       # Rota /extrato + link no menu lateral
│   └── correcao_css.md                # Responsividade mobile + correção de contraste
└── src/
    ├── styles.css                  # :root com os design tokens (cores, fontes, espaçamento)
    └── app/
        ├── app.ts / app.html / app.css        # Shell com menu lateral e router-outlet
        ├── pix-transfer/                      # Formulário + orquestração recibo/erro
        ├── pix-receipt/                       # Comprovante de transferência (origem: Google Stitch)
        ├── pix-history/                       # Extrato de transações (origem: Figma Dev Mode)
        └── components/error-modal/            # Modal de erro acessível (origem: prompt A11y)
```

## Como funciona
```
branding-briefing.txt ──(design-tokens-generator.md)──> styles.css (:root tokens)
                                                              │
        ┌─────────────────────────────────────────────────────┼─────────────────────────────┐
        v                                                      v                             v
imagem/extrato-pix.png +                              stitch/comprovante_stitch.html   a11y-component-generator.md
figma-specs.txt                                        (Google Stitch, Tailwind)              │
        │ (figma-to-angular.md)                          │ (stitch-code-refactor.md)          │ (regras WAI-ARIA)
        v                                                 v                                    v
PixHistoryComponent (@for, tokens)              PixReceiptComponent (tokens)              ErrorModal (aria-modal, foco, ESC)
        │                                                 │                                    │
        └──────────────────────(adicionar-fluxo-comprovante.txt)───────────────────────────────┘
                                              v
                        PixTransfer: @if(valor <= 5000) → recibo | @else → modal de erro
```
Todo componente gerado é obrigado, pelo próprio prompt, a não introduzir nenhuma cor ou espaçamento fora dos tokens de `styles.css` — a spec do Figma ou o HTML do Stitch fornecem apenas fidelidade estrutural, nunca valores de estilo finais.

## Conceitos trabalhados
- [x] **Design Tokens como camada de tradução** — um briefing textual de branding vira CSS Custom Properties semânticas (`--color-primary`, não `--color-blue`), permitindo suporte nativo a dark mode via `@media (prefers-color-scheme: dark)` sem tocar nos componentes (`src/styles.css`).
- [x] **Prompt como contrato de estilo** — cada prompt de geração de componente (`figma-to-angular.md`, `stitch-code-refactor.md`) proíbe explicitamente cor/espaçamento absoluto, forçando a IA a mapear qualquer valor visual (hex do Figma, classe Tailwind do Stitch) para um token existente.
- [x] **Duas origens, um sistema** — Figma Dev Mode (spec estruturada) e Google Stitch (protótipo solto gerado por IA) alimentam o mesmo design system, provando que a origem do design não importa se o prompt de conversão for rigoroso.
- [x] **Acessibilidade especificada, não assumida** — `ErrorModal` implementa `role="alertdialog"`, `aria-modal`, gerenciamento de foco (`ViewChild` + `ngAfterViewInit`) e fechamento por ESC (`@HostListener`) porque o prompt de geração (`a11y-component-generator.md`) exige essas marcações como requisito de saída, não como revisão posterior.
- [x] **Control flow e Signals do Angular 21** — `@if/@else` para alternar formulário/recibo/erro em `PixTransfer`, `@for` com `track` para a lista de transações em `PixHistoryComponent`, `input`/`output` como Signals em vez de decorators clássicos.

## Aprendizados
- [x] Proibir explicitamente valores absolutos no prompt ("PROIBIDO usar cores hexadecimais") é mais eficaz do que apenas fornecer a lista de tokens disponíveis — a IA segue a restrição negativa com mais consistência do que uma sugestão positiva.
- [x] Refatorar um protótipo de IA-para-IA (Google Stitch → Angular) exige um prompt diferente de gerar a partir de spec de design (Figma) — o primeiro precisa de instrução de "tradução" (Tailwind → tokens), o segundo de instrução de "interpretação" (imagem → estrutura).
- [x] Tratar acessibilidade como seção dedicada do prompt (marcações ARIA, navegação por teclado, gerenciamento de foco) produz componentes acessíveis desde a primeira geração, evitando retrabalho de auditoria a11y depois do fato.

## Documento Original
> Conteúdo original do README (scaffold gerado pelo Angular CLI) preservado em [`README.original.md`](./README.original.md).

## Referências
- [Angular CLI](https://angular.dev/tools/cli)
- [Angular — Signals](https://angular.dev/guide/signals)
- [Figma Dev Mode](https://www.figma.com/dev-mode/)
- [Google Stitch](https://stitch.withgoogle.com/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
