# Missão #04 — Padrões de Design AI-Específicos

> Caso: <!-- VOCÊ: nome do projeto, de CASO.md -->. Gateway que combina RAG, roteamento, cache
> semântico e Approval Gate, com limiar calibrado por medição.

## Passo 1 — Padrões mapeados

<!-- VOCÊ: a tarefa (perguntas ou requisições repetidas), em 1 a 2 frases. -->

| Padrão | Decisão no meu contexto | Por quê |
|---|---|---|
| RAG | | |
| Intent-Based Routing | | |
| Model Router | | |
| Semantic Cache (cacheável / nunca cache) | | |
| Approval Gate | | |

## Passo 2 — Calibração com dado real

<!-- VOCÊ: modelo de embedding escolhido e os pares de teste (parecidas e diferentes). -->

| Par | Pergunta A | Pergunta B | Esperado |
|---|---|---|---|
| | | | parecida / diferente |

<!-- /arq-entrega: tabela de similaridades medidas, de outputs/calibra-limiar-NN.md -->

<!-- VOCÊ: o limiar escolhido e por que ele separa os dois grupos com folga. -->

## Passo 3 — Log de execução (4 casos)

<!-- /arq-entrega: um trecho de log por caso, de outputs/gateway-NN.md:
cache miss · cache hit · Approval Gate por síntese obrigatória · Approval Gate por confiança baixa -->
