# Missão #03 — Arquiteturas Multi-Agent

> Caso: <!-- VOCÊ: nome do projeto, de CASO.md -->. Padrões de orquestração por dependência, falha e
> compensação por agente, e comunicação assíncrona entre agentes.

## Passo 1 — Padrões mapeados

<!-- VOCÊ: o processo em que várias partes precisam concordar sobre o mesmo estado, e os agentes.
Depois, uma linha por dependência. O /arq-entrega converte em Mermaid. -->

| Dependência (de → para) | Padrão | Justificativa |
|---|---|---|
| | | |

## Passo 2 — Falha e compensação por agente

<!-- VOCÊ: uma linha por agente. -->

| Agente | Timeout | Máx. tentativas | Espera ou segue sem? (CAP) | Idempotente? |
|---|---|---|---|---|
| | | | | |

<!-- VOCÊ: uma linha por etapa sequencial. -->

| Etapa sequencial | Ação compensatória específica |
|---|---|
| | |

## Passo 3 — Comunicação assíncrona

<!-- VOCÊ: o contrato de cada evento, antes do código. -->

| Evento | Dado carregado | Quem emite | Quem escuta |
|---|---|---|---|
| | | | |

<!-- /arq-entrega: trecho de src/ com o EventEmitter e os handlers -->
<!-- /arq-entrega: log da execução, de outputs/<script>-NN.md -->

## Reflexão final — um sinal de mudança

<!-- VOCÊ: uma frase. Que sinal em produção indicaria que um padrão ou uma decisão de falha estava
errada (timeout frequente, compensação disparando toda hora, agente virando gargalo). -->
