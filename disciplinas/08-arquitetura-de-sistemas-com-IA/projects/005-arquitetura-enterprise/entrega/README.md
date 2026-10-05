# Missão #05 — Arquitetura Enterprise

> Caso: <!-- VOCÊ: nome do projeto, de CASO.md -->. O Gateway do Módulo 4 estendido com cascata de
> model tiering e orçamento por tenant.

## Passo 1 — Tiers definidos

<!-- VOCÊ: um modelo por tier, com o custo estimado. -->

| Tier | Modelo (OpenRouter) | Quando entra | Custo estimado |
|---|---|---|---|
| 1 — barato | | sempre, primeiro | |
| 2 — caro | | só se o Tier 1 não convencer | |

## Passo 2 — Calibração com dado real

<!-- VOCÊ: o sinal de confiança que decide a escalação e as três perguntas de teste. -->

| Pergunta | Tipo | Esperado |
|---|---|---|
| | simples, resposta claramente certa | bastou |
| | ambígua, resposta duvidosa | duvidoso |
| | fora do domínio | duvidoso |

<!-- /arq-entrega: valores medidos, de outputs/calibra-limiar-NN.md -->

<!-- VOCÊ: o limiar escolhido e a folga em relação aos valores medidos. -->

## Passo 3 — Orçamento por tenant

<!-- VOCÊ: o que é tenant no seu caso, o limite de cada um, e a regra fixa (fora da cascata) para a
tarefa de erro caro e irreversível. -->

<!-- /arq-entrega: trecho de src/ com a checagem de orçamento ANTES da chamada e a regra fixa -->
<!-- /arq-entrega: uma linha da trilha com tier, escalou, gasto acumulado e limite do tenant -->

## Passo 4 — Log de execução (três comportamentos)

<!-- /arq-entrega: um trecho de log por caso, de outputs/gateway-NN.md:
Tier 1 resolve sozinho · escala para o Tier 2 · bloqueado por orçamento antes da chamada -->

## Passo 5 — Reflexão final

<!-- VOCÊ: uma frase. Com base no volume de escalação observado, que sinal indicaria que a cascata de
dois tiers precisa virar três. -->
