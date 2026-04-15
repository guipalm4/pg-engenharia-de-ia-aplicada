# Exemplo 010 — Modelos Locais com Ollama: Censura, Alinhamento e Chain-of-Thought

> Demonstra como rodar LLMs localmente via Ollama e compara o comportamento de um modelo sem censura com um modelo alinhado — incluindo o raciocínio interno visível via campo `thinking`.

## Contexto

- Disciplina: Fundamentos de IA e LLMs
- Período: Abril/2026
- Autor: guipalm4

## Descrição

Este exemplo usa o **Ollama** para servir dois modelos de linguagem inteiramente na máquina local, sem nenhuma API key ou chamada à nuvem. O objetivo é comparar como modelos com diferentes políticas de alinhamento respondem ao mesmo prompt potencialmente sensível.

O modelo `llama2-uncensored:7b` responde sem qualquer filtro — útil para entender o comportamento base de um LLM treinado sem RLHF restritivo. Já o `gpt-oss:20b` recusa a solicitação e, por meio do campo `thinking` da API nativa do Ollama, expõe o raciocínio interno que levou à recusa, tornando o processo de alinhamento observável.

Além da comparação de comportamento, o exemplo explora as duas APIs do Ollama lado a lado: a `/v1/chat/completions` (compatível com OpenAI) e a `/api/generate` (nativa), incluindo uma chamada em modo streaming.

## Tecnologias e Ferramentas

- [x] **Ollama** — runtime para modelos locais (LLaMA, Gemma, etc.)
- [x] **llama2-uncensored:7b** — modelo sem guardrails de segurança
- [x] **gpt-oss:20b** — modelo com alinhamento e raciocínio interno exposto
- [x] **curl** + **jq** — cliente HTTP e formatação de JSON
- [x] Ollama REST API: `/v1/chat/completions` (OpenAI-compat) e `/api/generate` (nativa)

## Pré-requisitos

- [Ollama](https://ollama.com) instalado e rodando localmente (`ollama serve` ou via app)
- `jq` instalado (`brew install jq`)
- Modelos baixados (veja **Como executar**)

## Como executar

```bash
# 1. Verificar modelos disponíveis localmente
ollama list

# 2. Baixar os modelos (só na primeira vez)
ollama pull llama2-uncensored:7b
ollama pull gpt-oss:20b

# 3. Rodar as requisições do exemplo
bash request.sh
```

> O Ollama deve estar rodando em `http://localhost:11434`. Por padrão, o app inicia automaticamente ao fazer `ollama pull` ou `ollama run`.

## Estrutura do Projeto

```
exemplo-010-ollama/
└── request.sh    # Todas as chamadas de API com saídas comentadas
```

## Como funciona

O script `request.sh` executa três blocos em sequência:

```
1. [OpenAI-compat] POST /v1/chat/completions
      model: llama2-uncensored:7b
      → responde sem filtros, fornece instruções detalhadas

2. [Nativa] POST /api/generate  (stream: false)
      model: gpt-oss:20b
      → recusa; campo "thinking" expõe o raciocínio interno da recusa

3. [Nativa] POST /api/generate  (stream: true)
      model: gpt-oss:20b
      → mesma requisição, mas tokens chegam incrementalmente via SSE
```

A saída de cada chamada está comentada no próprio script para referência sem precisar executar.

## Conceitos trabalhados

- [x] **Alinhamento de modelos (RLHF / safety guardrails)** — como políticas de treinamento afetam respostas a prompts sensíveis
- [x] **Chain-of-thought observável** — o campo `thinking` revela o raciocínio interno antes da resposta final
- [x] **Inferência local** — rodar LLMs sem internet, sem API key, com latência e custo zero por token
- [x] **Compatibilidade OpenAI** — o endpoint `/v1/chat/completions` do Ollama aceita o mesmo schema da OpenAI API
- [x] **Streaming vs batch** — diferença entre `stream: true` (SSE incremental) e `stream: false` (resposta completa)

## Aprendizados

- [x] Modelos "uncensored" não são mais capazes — apenas têm políticas de recusa removidas; a qualidade base é a mesma
- [x] O campo `thinking` do `gpt-oss:20b` torna o alinhamento auditável: é possível ver exatamente por que o modelo recusou
- [x] A API OpenAI-compatível do Ollama permite trocar modelos locais em aplicações que já usam o SDK da OpenAI sem alterar o código
- [x] Streaming via `/api/generate` entrega chunks como JSON lines — cada linha é um objeto com `response` parcial e `done: false/true`

## Referências

- [Ollama — Documentação oficial](https://ollama.com/docs)
- [Ollama REST API Reference](https://github.com/ollama/ollama/blob/main/docs/api.md)
- [llama2-uncensored no Ollama Hub](https://ollama.com/library/llama2-uncensored)
- [Anthropic — Constitutional AI (alinhamento)](https://www.anthropic.com/research/constitutional-ai-harmlessness-from-ai-feedback)
