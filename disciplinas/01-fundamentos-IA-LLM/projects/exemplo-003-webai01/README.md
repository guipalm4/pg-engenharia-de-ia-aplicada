# Web AI 01 — LLM Local no Navegador com Chrome AI API

> Demonstração mínima de inferência com LLM rodando inteiramente no navegador, sem servidor e sem chamadas a APIs externas, usando a `LanguageModel` API nativa do Chrome.

## Contexto
- Disciplina: Fundamentos de IA e LLMs
- Período: Abril/2026
- Autor: guipalm4

## Descrição
O projeto consiste em um único arquivo `index.html` que acessa o modelo de linguagem embutido no Chrome via `LanguageModel` (Chrome Built-in AI / Prompt API). Ao abrir a página, o agente inicializa uma sessão com um system prompt em português, envia a pergunta *"Quem inventou o JavaScript?"* e exibe a resposta em streaming com renderização Markdown — tudo processado localmente na GPU/NPU do dispositivo, sem tráfego de rede para um modelo externo.

## Tecnologias e Ferramentas
- [x] HTML5 + JavaScript (ES2022 — `async/await`, `for await...of`)
- [x] **Chrome Built-in AI — Prompt API** (`LanguageModel` global): acesso ao modelo Gemini Nano embutido no Chrome
- [x] **markdown.js** (via CDN jsDelivr): conversão de Markdown para HTML no cliente
- [x] Sem dependências instaladas, sem bundler, sem build step

## Pré-requisitos

Este exemplo requer o **Google Chrome** com suporte à Prompt API habilitado:

1. Chrome versão 127 ou superior (Canary/Dev/Beta recomendado para maior compatibilidade)
2. Acessar `chrome://flags` e habilitar:
   - `#prompt-api-for-gemini-nano` → **Enabled**
   - `#optimization-guide-on-device-model` → **Enabled BypassPerfRequirement**
3. Reiniciar o Chrome e aguardar o download do modelo Gemini Nano (pode levar alguns minutos)
4. Verificar disponibilidade no DevTools: `await LanguageModel.availability()` deve retornar `"available"`

## Como executar

Por ser um arquivo HTML puro, basta abri-lo diretamente no Chrome:

```bash
# Opção 1 — abrir direto no Chrome (macOS)
open -a "Google Chrome" index.html

# Opção 2 — servir via servidor local simples (evita restrições de CORS em alguns contextos)
npx serve .
# ou
python3 -m http.server 8080
```

Acesse `http://localhost:8080` e a resposta será gerada e exibida em streaming automaticamente.

## Estrutura do Projeto
```
exemplo-003-webai01/
└── index.html   # Toda a lógica em um único arquivo (HTML + JS inline)
```

## Como funciona

```
LanguageModel.params()          → lê temperature e topK padrão do modelo local
LanguageModel.create({ ... })   → abre sessão com system prompt em pt-BR
session.promptStreaming([...])  → envia mensagem e retorna AsyncIterable de tokens
for await (token of stream)     → acumula tokens e re-renderiza o Markdown em tempo real
```

## Conceitos trabalhados
- [x] **Inferência on-device** — o modelo roda na máquina do usuário (GPU/NPU via WebGPU/WebNN), sem latência de rede e com privacidade total dos dados
- [x] **Streaming de tokens** — `promptStreaming` retorna um `AsyncIterable`, demonstrando geração autorregressiva token a token
- [x] **Session API e system prompts** — controle de contexto inicial (`initialPrompts`) e parâmetros de amostragem (`temperature`, `topK`)
- [x] **Web AI vs. Cloud AI** — contraste com o modelo de APIs externas (exemplo-000/001): mesma interface de usuário, mas execução completamente local
- [x] **Renderização de saída estruturada** — uso de markdown.js para tratar a saída do modelo como texto estruturado

## Aprendizados
- [x] A `LanguageModel` API segue o padrão `AsyncIterable` do JS moderno — o mesmo padrão usado por SDKs de cloud (Anthropic, OpenAI) para streaming, facilitando a migração entre ambientes
- [x] Modelos locais (Gemini Nano) têm restrições de capacidade em relação a modelos de cloud, mas eliminam latência de rede e custo por token — trade-off relevante para aplicações embarcadas e offline
- [x] Um único arquivo HTML pode ser um ambiente completo de IA: sem build, sem backend, sem dependências instaladas

## Referências
- [Chrome Built-in AI — Prompt API (documentação oficial)](https://developer.chrome.com/docs/ai/built-in)
- [LanguageModel API — explainer no GitHub](https://github.com/webmachinelearning/prompt-api)
- [Gemini Nano no Chrome — visão geral](https://developer.chrome.com/docs/ai/get-started)
- [markdown.js no jsDelivr](https://www.jsdelivr.com/package/npm/markdown)
- [Web Neural Network API (WebNN)](https://www.w3.org/TR/webnn/)

---
