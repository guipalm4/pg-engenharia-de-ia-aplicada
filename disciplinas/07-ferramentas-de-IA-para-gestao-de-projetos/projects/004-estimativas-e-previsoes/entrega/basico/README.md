# Missão #04 — Estimativas e Previsões Probabilísticas com IA · nível Básico

> Três pontos e PERT das histórias do MVP do RouteWise, P50/P85/P95 pelo script Monte Carlo e a
> decisão de prazo contra o cronograma do Módulo 3.

## Configuração

| Item | Valor |
| --- | --- |
| Prompt | [`probability-forecast-v1`](../../prompts/probability-forecast-v1.md) — Probability Forecast Prompt preenchido com as histórias do MVP |
| Script | [`monte-carlo-routewise.py`](../../scripts/monte-carlo-routewise.py) — script do material, só com os três pontos trocados |
| Outputs | [PERT do modelo](../../outputs/forecast-pert-v1.md) · [Monte Carlo](../../outputs/monte-carlo-v1.md) |
| Modelo | `claude-opus-5`, subagente de contexto limpo |
| Data | 15/09/2026 |

## Parte 1 — Tabela de três pontos

As histórias são as do MVP no cronograma do Módulo 3; US-02 ficou fora porque está fora do MVP
lá. M é a duração da história naquele cronograma, O = M − 1 e P = 2 × M, pelo critério do
pessimista técnico. Em US-04 e US-09 a estimativa cobre só a integração depois que o hardware
chega, porque o software contra mock já estava no Sprint 4.

| História | O | M | P | Risco que leva ao P | PERT (sem) | σ |
| --- | --- | --- | --- | --- | --- | --- |
| US-01 Alertas de Velocidade | 3 | 4 | 8 | Rollout nos 140 veículos exigir hardening além do Sprint 2 | 4,50 | 0,83 |
| US-03 Score de Comportamento (MVP parcial) | 1 | 2 | 4 | Mudança de esquema no pipeline de US-01 obrigar a refazer a ingestão do score | 2,17 | 0,50 |
| US-04 Sensor de Abertura de Baú | 1 | 2 | 4 | Defeito de firmware no gateway do baú, compartilhado com US-09 | 2,17 | 0,50 |
| US-09 Controle de Temperatura | 3 | 4 | 8 | Calibração do sensor de temperatura falhar na primeira integração | 4,50 | 0,83 |

PERT calculado pelo modelo com (O + 4M + P) / 6. Esforço sequencial agregado: **13,33 semanas**.

## Parte 2 — Monte Carlo

Script rodado localmente, 10.000 simulações. A trilha de US-04 e US-09 começa depois de 9 semanas
decorridas (`HARDWARE_SEMANA = 9`, valor do material).

| Percentil | Prazo |
| --- | --- |
| P50 | 13,8 semanas |
| P85 | 14,8 semanas |
| P95 | 15,4 semanas |

Uso o **P85** como compromisso externo: o P50 atrasa em metade das simulações, e o P85 cobre 85%
delas sem prometer o pior caso.

## Parte 3 — Comparação com o cronograma do Módulo 3

O cronograma do Módulo 3 comprometeu o MVP em 12 semanas. O P85 é 14,8 semanas: um gap de 2,8
semanas.

**Decisão: negociar o prazo para 15 semanas.** Quem define a data é a trilha de hardware, que só
começa na semana 9, então aumentar a capacidade do time não encurta o prazo.

## Parte 4 — Comunicação ao stakeholder

> Carlos, a previsão probabilística do MVP do RouteWise indica 15 semanas como prazo de
> compromisso, com cerca de 85% de confiança — três semanas além das 12 do cronograma atual. O
> principal risco de atraso é a integração dos sensores de baú, que só começa quando o hardware
> chega, na semana 9, e depende de a calibração do sensor de temperatura funcionar na primeira
> tentativa. Para reduzir esse risco, vamos pedir ao fornecedor um lote piloto de sensores antes da
> semana 9 e testar firmware e calibração nele, para que a integração não comece do zero quando o
> lote completo chegar.
