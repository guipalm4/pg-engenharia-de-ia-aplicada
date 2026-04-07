# Web AI 02 — Explorando Temperature e Top-K no Navegador

> Interface interativa para conversar com o Gemini Nano local (Chrome Built-in AI), com controle em tempo real dos parâmetros de amostragem **Temperature** e **Top-K** — e suporte a cancelamento de geração via AbortController.

## Contexto
- Disciplina: Fundamentos de IA e LLMs
- Período: Abril/2026
- Autor: guipalm4

## Descrição
Evolução do exemplo-003, saindo de um script estático para uma aplicação completa com formulário, CSS e módulo JS separado. O diferencial é a exposição dos parâmetros `temperature` e `topK` para o usuário ajustar antes de cada envio, tornando visível como esses valores afetam o comportamento do modelo. Inclui também gerenciamento do ciclo de vida da sessão (criação e destruição por request) e cancelamento de geração em andamento com `AbortController`.

## Tecnologias e Ferramentas
- [x] HTML5 + CSS3 (dark theme, grid responsivo)
- [x] JavaScript ES Modules (`type="module"`)
- [x] **Chrome Built-in AI — Prompt API** (`LanguageModel` global): Gemini Nano on-device
- [x] **AbortController** + `AbortSignal`: cancelamento de streams em andamento
- [x] **http-server** (devDependency): servidor local simples via `npm start`

## Pré-requisitos

Requer **Google Chrome** com a Prompt API habilitada:

1. Chrome 127+ (Canary/Dev/Beta recomendado)
2. Acessar `chrome://flags` e habilitar:
   - `#prompt-api-for-gemini-nano` → **Enabled**
   - `#optimization-guide-on-device-model` → **Enabled BypassPerfRequirement**
3. Reiniciar o Chrome
4. Na primeira execução, o app detecta automaticamente os estados `downloadable` / `downloading` e inicia o download do modelo Gemini Nano, exibindo progresso no console

## Como executar

```bash
# Instalar dependência de desenvolvimento
npm install

# Iniciar servidor local (disponível em http://localhost:8080)
npm start
```

Abra `http://localhost:8080` no Chrome. O app verifica os requisitos automaticamente e, se tudo estiver ok, carrega os parâmetros padrão do modelo nos controles.

## Estrutura do Projeto
```
exemplo-004-webai02-temperature-and-topK/
├── index.html      # Markup: form com sliders de temperature/topK e área de output
├── index.js        # Lógica principal (ES Module)
├── style.css       # Dark theme com grid responsivo
└── package.json    # Script start com http-server
```

## Como funciona

```
checkRequirements()             → valida Chrome + LanguageModel API + disponibilidade do modelo
                                  estados tratados: available | unavailable | downloading | downloadable

LanguageModel.params()          → lê defaultTemperature, defaultTopK, maxTemperature, maxTopK
                                  e popula os controles do formulário com os valores reais do modelo

onSubmitQuestion()              → lê temperature e topK do form, chama askAI(), stream p/ output

askAI(question, temp, topK)     → async generator:
  session.destroy()             → descarta sessão anterior (evita vazamento de memória)
  LanguageModel.create({...})   → nova sessão com os parâmetros escolhidos
  session.promptStreaming(...)  → stream com AbortSignal para suporte a cancelamento
  yield chunk                   → emite tokens um a um para o caller

toggleSendOrStopButton()        → alterna botão Enviar ↔ Parar + gerencia isGenerating flag
```

## Parâmetros de amostragem

| Parâmetro | O que controla | Valor baixo | Valor alto |
|-----------|---------------|-------------|------------|
| **Temperature** | Criatividade / aleatoriedade | Respostas focadas e determinísticas | Respostas criativas e variadas |
| **Top-K** | Vocabulário candidato por token | Mais previsível (menos palavras candidatas) | Mais diverso (mais palavras candidatas) |

Valores padrão do Gemini Nano: `temperature=1`, `topK=3`, `maxTemperature=2`, `maxTopK=128`.

## Conceitos trabalhados
- [x] **Temperature e Top-K como hiperparâmetros de inferência** — controle direto sobre a distribuição de probabilidade do próximo token
- [x] **Ciclo de vida de sessão** — cada request cria uma sessão nova com `LanguageModel.create()` e destrói a anterior com `session.destroy()`, evitando acúmulo de contexto indesejado
- [x] **Cancelamento com AbortController** — `AbortSignal` passado ao `promptStreaming` permite interromper a geração a qualquer momento sem travar a interface
- [x] **Verificação de disponibilidade robusta** — `LanguageModel.availability()` retorna 4 estados possíveis; o app trata todos eles, inclusive iniciando o download automático quando necessário
- [x] **ES Modules no browser** — `type="module"` para escopo isolado e importações nativas, sem bundler
- [x] **Separação de responsabilidades** — HTML (estrutura), CSS (apresentação) e JS (lógica) em arquivos distintos, contrastando com o arquivo único do exemplo-003

## Aprendizados
- [x] Temperature e Top-K são os principais knobs para controlar o trade-off criatividade × consistência — ajustá-los em tempo real torna o efeito tangível e intuitivo
- [x] Destruir e recriar a sessão por request é necessário para aplicar novos parâmetros, já que a `LanguageModel` API não permite alterar `temperature`/`topK` em uma sessão existente
- [x] `AbortController` é o mecanismo padrão do browser para cancelamento de operações assíncronas — o mesmo padrão funciona em `fetch`, `promptStreaming` e outros streams

## Referências
- [Chrome Built-in AI — Prompt API](https://developer.chrome.com/docs/ai/built-in)
- [LanguageModel.create() — parâmetros de sessão](https://github.com/webmachinelearning/prompt-api#creating-a-session)
- [AbortController — MDN Web Docs](https://developer.mozilla.org/en-US/docs/Web/API/AbortController)
- [Temperature e Top-K em LLMs — Google ML Glossary](https://developers.google.com/machine-learning/glossary#temperature)
- [http-server — npm](https://www.npmjs.com/package/http-server)

---
> Gerado automaticamente por agente IA. Atualize conforme necessário.
