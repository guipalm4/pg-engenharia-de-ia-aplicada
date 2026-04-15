# Exemplo 011 — Acesso Unificado a LLMs com OpenRouter

> Demonstra como usar o OpenRouter como gateway de API para acessar múltiplos provedores de LLMs com uma interface OpenAI-compatível e modelos gratuitos.

## Contexto

- Disciplina: Fundamentos de IA e LLMs
- Período: Abril/2026
- Autor: guipalm4

## Descrição

O **OpenRouter** é um agregador de APIs de LLMs que expõe uma interface unificada (compatível com o schema OpenAI) para dezenas de modelos de diferentes provedores — OpenAI, Anthropic, Google, Meta, Mistral e outros. Em vez de integrar cada API separadamente, basta trocar o `base_url` e o nome do modelo.

Este exemplo faz uma única chamada ao endpoint `/v1/chat/completions` do OpenRouter usando o modelo `google/gemma-3-27b-it:free` — o sufixo `:free` indica que o modelo está disponível sem custo no tier gratuito da plataforma. A resposta inclui metadados de roteamento (`provider: "Google AI Studio"`) que revelam por qual backend o request foi servido, além de campos de custo e contagem de tokens.

O exemplo também documenta um detalhe prático relevante: a resposta retornou `completion_tokens: 0` mesmo com conteúdo gerado — comportamento observado em alguns modelos gratuitos que não reportam o consumo real de tokens de saída.

## Tecnologias e Ferramentas

- [x] **OpenRouter** — gateway unificado para múltiplos provedores de LLMs
- [x] **google/gemma-3-27b-it:free** — Gemma 3 27B (Google AI Studio, tier gratuito)
- [x] **curl** + **jq** — cliente HTTP e formatação de JSON
- [x] API OpenAI-compatível (`/v1/chat/completions`)

## Pré-requisitos

- Conta no [OpenRouter](https://openrouter.ai) com API key gerada
- Arquivo `.env` na raiz do projeto com:
  ```
  OPENROUTER_API_KEY=sk-or-...
  ```
- `jq` instalado (`brew install jq`)

## Como executar

```bash
# Na raiz do projeto, com .env configurado:
bash request.sh
```

## Como funciona

```
1. source .env          → carrega OPENROUTER_API_KEY

2. POST https://openrouter.ai/api/v1/chat/completions
   Headers:
     Authorization: Bearer $OPENROUTER_API_KEY
     HTTP-Referer: http://localhost:3000    ← identifica a aplicação para o OpenRouter
     X-Title: "My Example"                 ← nome exibido no dashboard
   Body:
     model: "google/gemma-3-27b-it:free"
     messages: [{ role: "user", content: "Me conte uma curiosidade sobre LLMs" }]
     temperature: 0.3
     max_tokens: 1000

3. OpenRouter roteia para Google AI Studio
   → response.provider: "Google AI Studio"
   → response.choices[0].message.content: texto gerado pelo Gemma 3 27B
   → response.usage.cost: 0   (modelo gratuito)
```

## Conceitos trabalhados

- [x] **API Gateway para LLMs** — como o OpenRouter abstrai múltiplos provedores atrás de uma única interface
- [x] **Compatibilidade OpenAI** — o mesmo schema funciona para trocar de modelo/provedor sem alterar o código
- [x] **Roteamento transparente** — o campo `provider` na resposta revela qual backend serviu o request
- [x] **Modelos gratuitos** — o sufixo `:free` e o campo `cost: 0` na resposta; diferença de tier afeta reportagem de tokens
- [x] **Headers de identificação** — `HTTP-Referer` e `X-Title` são usados pelo OpenRouter para rastreamento e rate limiting por aplicação
- [x] **Parâmetros de sampling** — `temperature` e `max_tokens` passados diretamente pelo body, idêntico à OpenAI API

## Aprendizados

- [x] Modelos com sufixo `:free` no OpenRouter podem ter comportamentos diferentes dos pagos — neste caso, `completion_tokens` retornou `0` mesmo com resposta gerada
- [x] O campo `provider` na resposta é útil para auditoria e entender de onde veio a latência
- [x] O OpenRouter permite comparar modelos apenas trocando o campo `model` no body — ideal para benchmarks rápidos
- [x] Os headers `HTTP-Referer` e `X-Title` não são obrigatórios tecnicamente, mas são boas práticas para gestão de uso no dashboard

## Referências

- [OpenRouter — Documentação oficial](https://openrouter.ai/docs)
- [OpenRouter — Lista de modelos gratuitos](https://openrouter.ai/models?order=newest&supported_parameters=free)
- [Gemma 3 no OpenRouter](https://openrouter.ai/google/gemma-3-27b-it:free)
- [OpenAI Chat Completions API — schema de referência](https://platform.openai.com/docs/api-reference/chat)
