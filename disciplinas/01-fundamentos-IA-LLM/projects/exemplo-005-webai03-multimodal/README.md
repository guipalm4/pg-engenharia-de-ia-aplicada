# Web AI 03 — Entrada Multimodal com Tradução Automática no Navegador

> Interface que combina Gemini Nano on-device com as APIs nativas de Tradução e Detecção de Idioma do Chrome, permitindo enviar texto, imagem ou áudio e receber a resposta traduzida automaticamente para o português.

## Contexto
- Disciplina: Fundamentos de IA e LLMs
- Período: Abril/2026
- Autor: guipalm4

## Descrição
Evolução do exemplo-004, introduzindo duas novidades principais: entrada multimodal e tradução automática on-device. O usuário pode anexar uma imagem ou um arquivo de áudio junto com a pergunta em texto; o Gemini Nano processa os três tipos de conteúdo em uma única chamada. A resposta, gerada em inglês (idioma esperado pelo modelo), é automaticamente detectada e traduzida para o português usando a Translation API e a Language Detection API do Chrome — todas rodando localmente, sem chamadas a servidores externos.

A arquitetura foi refatorada para o padrão MVC, separando claramente as responsabilidades em `AIService` (inferência e streaming), `TranslationService` (tradução e detecção de idioma), `FormController` (orquestração dos eventos de formulário) e `View` (manipulação do DOM e previews de arquivo). Isso contrasta com o arquivo único dos exemplos anteriores e torna o fluxo assíncrono mais legível.

## Tecnologias e Ferramentas
- [x] HTML5 + CSS3 (dark theme)
- [x] JavaScript ES Modules (`type="module"`)
- [x] **Chrome Built-in AI — Prompt API** (`LanguageModel`): Gemini Nano on-device com entradas multimodais (`text`, `image`, `audio`)
- [x] **Chrome Translation API** (`Translator`): tradução streaming en→pt, on-device
- [x] **Chrome Language Detection API** (`LanguageDetector`): detecta o idioma antes de traduzir
- [x] **AbortController** + `AbortSignal`: cancelamento de geração em andamento
- [x] **http-server** (devDependency): servidor local via `npm start`

## Pré-requisitos

Requer **Google Chrome** com três flags habilitadas em `chrome://flags`:

1. Chrome 127+ (Canary/Dev/Beta recomendado)
2. Habilitar as flags:
   - `#prompt-api-for-gemini-nano` → **Enabled**
   - `#translation-api` → **Enabled**
   - `#language-detector-api` → **Enabled**
   - `#optimization-guide-on-device-model` → **Enabled BypassPerfRequirement**
3. Reiniciar o Chrome
4. Na primeira execução, o app verifica a disponibilidade do modelo Gemini Nano e do tradutor en→pt, iniciando os downloads automaticamente quando necessário

## Como executar

```bash
# Instalar dependência de desenvolvimento
npm install

# Iniciar servidor local (disponível em http://localhost:8080)
npm start
```

Abra `http://localhost:8080` no Chrome. O app valida todos os requisitos na inicialização e exibe mensagens de erro específicas para cada flag ausente.

## Estrutura do Projeto

```
exemplo-005-webai03-multimodal/
├── index.html                    # Markup: formulário com sliders, file input e área de output
├── index.js                      # Entry point: inicializa serviços, view e controller
├── style.css                     # Dark theme com preview de imagem/áudio
├── package.json                  # Script start com http-server
├── controllers/
│   └── formController.js         # Orquestra eventos de form, AI e tradução
├── services/
│   ├── aiService.js              # LanguageModel: sessão multimodal + streaming + abort
│   └── translationService.js     # Translator + LanguageDetector: tradução en→pt
└── views/
    └── view.js                   # DOM: parâmetros, preview de arquivo, output, botões
```

## Como funciona

```
main()
  aiService.checkRequirements()     → valida Chrome, LanguageModel, Translator, LanguageDetector
                                      inicia downloads automáticos se necessário
  translationService.initialize()   → Translator.create({ en→pt }) + LanguageDetector.create()
  aiService.getParams()             → lê defaultTemperature/topK/maxTemperature/maxTopK
  view.initializeParameters(params) → popula sliders com valores reais do modelo
  controller.setupEventListeners()  → registra handlers de form, file input e sliders

onFormSubmit()
  view.getFile()                    → recupera File object (imagem ou áudio)
  aiService.createSession(q, t, k, file):
    abortController.abort()         → cancela geração anterior
    session.destroy()               → libera sessão anterior
    LanguageModel.create({          → nova sessão multimodal
      expectedInputs: [text, audio, image],
      temperature, topK,
      initialPrompts: [system]
    })
    contentArray = [text, (image|audio blob)]
    session.promptStreaming(contentArray, { signal })
    yield chunk                     → tokens em streaming para o controller

  for await chunk → view.setOutput(fullResponse)

  translationService.translateToPortuguese(fullResponse):
    languageDetector.detect(text)   → pula tradução se já for português
    translator.translateStreaming()  → tradução incremental en→pt
    view.setOutput(translated)      → exibe resposta final em português
```

## Conceitos trabalhados
- [x] **Multimodalidade** — `LanguageModel.create()` recebe `expectedInputs` com `text`, `image` e `audio`; o conteúdo do prompt é um array de objetos tipados (`{ type, value }`) ao invés de uma string simples
- [x] **Translation API on-device** — `Translator.create({ sourceLanguage, targetLanguage })` + `translateStreaming()` rodam localmente sem depender de APIs externas
- [x] **Language Detection API** — `LanguageDetector.detect()` retorna probabilidades por idioma; o app usa o resultado para evitar retraduzir texto já em português
- [x] **Padrão MVC em ES Modules** — responsabilidades divididas em quatro classes independentes, com dependências injetadas via construtor; nenhum estado global
- [x] **Pipeline assíncrono encadeado** — geração streaming → acumulação do texto completo → detecção de idioma → tradução streaming; cada etapa aguarda a anterior sem bloquear a UI
- [x] **Verificação de múltiplas APIs** — `checkRequirements()` valida independentemente LanguageModel, Translator e LanguageDetector, retornando mensagens de erro específicas por flag ausente

## Aprendizados
- [x] A Prompt API multimodal exige que o conteúdo seja um array de objetos tipados (`[{ type: "text", value: "..." }, { type: "image", value: blob }]`), não uma string — a serialização correta do `Blob` é crítica para o modelo processar o arquivo
- [x] A Translation API também suporta streaming (`translateStreaming`), mas cada chunk é o texto traduzido completo até aquele ponto (não um delta), então o padrão de acumulação é diferente do streaming do LLM
- [x] Detectar o idioma antes de traduzir evita uma chamada desnecessária e um possível loop de tradução quando o modelo já responde em português
- [x] Injetar dependências no construtor (`new FormController(aiService, translationService, view)`) facilita o teste isolado de cada módulo e torna o fluxo de dados explícito

## Referências
- [Chrome Built-in AI — Prompt API](https://developer.chrome.com/docs/ai/built-in)
- [LanguageModel multimodal inputs — Prompt API spec](https://github.com/webmachinelearning/prompt-api#multimodal-inputs)
- [Translation API — Chrome for Developers](https://developer.chrome.com/docs/ai/translator-api)
- [Language Detection API — Chrome for Developers](https://developer.chrome.com/docs/ai/language-detection)
- [AbortController — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [http-server — npm](https://www.npmjs.com/package/http-server)

---
