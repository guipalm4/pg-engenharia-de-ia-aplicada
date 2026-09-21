# Missão #04 — Estimativas e Previsões Probabilísticas com IA · nível Intermediário

> As três histórias de maior variância do MVP do RouteWise, o risco técnico de cada uma e a ação
> para reduzir a incerteza antes do desenvolvimento.

## Configuração

| Item | Valor |
| --- | --- |
| Prompt | [`probability-forecast-v1`](../../prompts/probability-forecast-v1.md) — Probability Forecast Prompt preenchido com as histórias do MVP |
| Script | [`monte-carlo-routewise.py`](../../scripts/monte-carlo-routewise.py) — script do material, só com os três pontos trocados |
| Outputs | [PERT do modelo](../../outputs/forecast-pert-v1.md) · [Monte Carlo](../../outputs/monte-carlo-v1.md) |
| Modelo | `claude-opus-5`, subagente de contexto limpo |
| Data | 15/09/2026 |

A tabela de três pontos, o PERT, o P50/P85/P95 e a decisão de prazo — os itens da rubrica Básica —
estão em [`entrega/basico/`](../basico/README.md).

## Parte 2 — Histórias com maior variância

| História | Variância | σ (sem) |
| --- | --- | --- |
| US-01 Alertas de Velocidade | 0,69 | 0,83 |
| US-09 Controle de Temperatura | 0,69 | 0,83 |
| US-04 Sensor de Abertura de Baú | 0,25 | 0,50 |
| US-03 Score de Comportamento | 0,25 | 0,50 |

US-04 e US-03 empatam no terceiro lugar. Fico com **US-04** porque o risco dela, o firmware do
gateway do baú, é compartilhado com US-09 (dependência D1 do Módulo 3): um defeito ali atrasa as
duas histórias ao mesmo tempo, e as duas estão na trilha de hardware que define a data.

- **US-09 Controle de Temperatura:** risco de a calibração do sensor falhar na primeira
  integração. Ação: pedir ao fornecedor 1 ou 2 unidades antecipadas e fazer uma prova de calibração
  em bancada antes da semana 9, com critério de aceite definido.
- **US-01 Alertas de Velocidade:** risco de o rollout nos 140 veículos exigir hardening além do
  Sprint 2. Ação: simular a telemetria dos 140 veículos (volume, perda de conexão, mensagens fora de
  ordem) antes do rollout.
- **US-04 Sensor de Abertura de Baú:** risco de defeito de firmware no gateway do baú. Ação: levantar
  com o fornecedor a versão do firmware e os bugs conhecidos, e testar a comunicação ponta a ponta
  na mesma unidade antecipada de US-09, antes da semana 9.
