# Tabelas comparativas — três rodadas do Backlog Scorer

Valores extraídos de [`outputs/backlog-priorizado-v1.md`](../../outputs/backlog-priorizado-v1.md),
[`-v2`](../../outputs/backlog-priorizado-v2.md) e [`-v3`](../../outputs/backlog-priorizado-v3.md).
Nenhuma User Story mudou de escopo entre as rodadas: o insumo
[`inputs/backlog-routewise-input.md`](../../inputs/backlog-routewise-input.md) é o mesmo nas três.

A análise que interpreta estes números está no [README da entrega](./README.md).

---

## 1. RICE, variável por variável

| Item | Reach V1 → V2 → V3 | Impact | Confidence | Effort (pm) | RICE |
| --- | --- | --- | --- | --- | --- |
| US01 — Alertas de Velocidade | 140 → 140 → 140 | 3 → 3 → 3 | 80% → 80% → 80% | 1,5 → 2,0 → 2 | 224,0 → 168,0 → 168,0 |
| US03 — Score de Comportamento | 140 → 140 → 140 *(sup.)* | 2 → 2 → 2 | 50% → 50% → 50% | 2,5 → 4,0 → 3 | 56,0 → 35,0 → 46,7 |
| US04 — Sensor de Abertura de Baú | 140 → 140 → 140 *(sup.)* | 1 → 1 → 1 | 50% → 50% → 50% | 3,0 → 3,0 → 4 | 23,3 → 23,3 → 17,5 |
| US09 — Sensor de Temperatura | 28 *(est.)* → 28 → 28 | 2 → **3** → 3 | 50% → **100%** → **80%** | 3,0 → 3,0 → 4 | 9,3 → 28,0 → 16,8 |
| US02 — Manutenção Preditiva | 140 → 140 → 140 | 1 → 1 → 1 | 50% → 50% → 50% | 4,0 → 6,0 → 5 | 17,5 → 11,7 → 14,0 |
| US05 — Dashboard Base (HiPPO) | 5 → 5 → **10** *(sup.)* | 0,5 → 0,5 → 0,5 | 50% → 50% → 50% | 2,0 → 2,5 → 3 | 0,6 → 0,5 → 0,8 |

*(sup.)* / *(est.)* = o próprio modelo marcou o número como suposição na célula da tabela de output.

**Leitura por variável, contando quantos dos 6 itens se moveram entre V1 e V3:**

| Variável | Itens que mudaram | Rastreável a dado ou regra nomeada? |
| --- | --- | --- |
| Confidence | 1 de 6 (US09) | sim — é o único item que recebeu dado novo |
| Impact | 1 de 6 (US09) | sim — mesma origem |
| Reach (valor) | 1 de 6 (US05) | não — o único Reach sem lastro no contexto |
| Effort | **6 de 6** | não |

## 2. WSJF, variável por variável

| Item | BV V1 → V2 → V3 | TC | RR | CoD | Job Size | WSJF |
| --- | --- | --- | --- | --- | --- | --- |
| US01 — Alertas de Velocidade | 10 → 10 → 9 | 9 → 8 → 8 | 8 → 6 → 7 | 27 → 24 → 24 | 3 → 3 → **2** | 9,00 → 8,00 → **12,00** |
| US09 — Sensor de Temperatura | 3 → **8** → **9** | 7 → **10** → 10 | 8 → 10 → 9 | 18 → **28** → 28 | 6 → 5 → 6 | 3,00 → 5,60 → 4,67 |
| US03 — Score de Comportamento | 7 → 7 → 6 | 5 → 4 → 5 | 5 → 5 → 4 | 17 → 16 → 15 | 5 → 6 → 5 | 3,40 → 2,67 → 3,00 |
| US04 — Sensor de Abertura de Baú | 2 → 3 → 2 | 4 → 3 → 2 | 5 → 3 → 3 | 11 → 9 → 7 | 6 → 5 → 6 | 1,80 → 1,80 → 1,17 |
| US02 — Manutenção Preditiva | 3 → 3 → 2 | 4 → 3 → 3 | 6 → 4 → 3 | 13 → 10 → 8 | 8 → 8 → 8 | 1,60 → 1,25 → 1,00 |
| US05 — Dashboard Base (HiPPO) | 2 → 2 → 1 | 2 → 2 → 1 | 2 → 1 → 1 | 6 → 5 → 3 | 4 → 4 → 4 | 1,50 → 1,25 → 0,75 |

**Cost of Delay dos itens sem vínculo com OKR cai monotonicamente nas três rodadas:**
US04 11 → 9 → 7 · US02 13 → 10 → 8 · US05 6 → 5 → 3 · US03 17 → 16 → 15.
Os dois itens ancorados em OKR não seguem esse padrão: US01 27 → 24 → 24, US09 18 → 28 → 28.

## 3. Posição de cada item nos rankings isolados

| Item | RICE V1 → V2 → V3 | WSJF V1 → V2 → V3 | Combinado V1 → V2 → V3 |
| --- | --- | --- | --- |
| US01 — Alertas de Velocidade | 1º → 1º → 1º | 1º → 1º → 1º | **1º → 1º → 1º** |
| US09 — Sensor de Temperatura | 5º → 3º → 4º | 3º → 2º → 2º | **4º → 2º → 2º** |
| US03 — Score de Comportamento | 2º → 2º → 2º | 2º → 3º → 3º | **2º → 3º → 3º** |
| US04 — Sensor de Abertura de Baú | 3º → 4º → 3º | 4º → 4º → 4º | **3º → 4º → 4º** |
| US02 — Manutenção Preditiva | 4º → 5º → 5º | 5º → 5º → 5º | **5º → 5º → 5º** |
| US05 — Dashboard Base (HiPPO) | 6º → 6º → 6º | 6º → 6º → 6º | **6º → 6º → 6º** |

O ranking combinado de V2 e V3 é idêntico, apesar de metade das variáveis de entrada ter mudado
de valor entre as duas rodadas: 24 das 48 células (8 variáveis × 6 itens) — contagem feita célula a
célula sobre as tabelas 1 e 2 acima.

## 4. Suposições marcadas pelo próprio modelo na tabela RICE

| Rodada | Células marcadas | Quais |
| --- | --- | --- |
| V1 | 1 | US09 — "28 veículos/mês (estimado)" |
| V2 | 0 | — |
| V3 | 3 | US03, US04, US05 |

Em V1 e V2 o Reach de US03 (140 motoristas), US04 (140 baús) e US05 (5 usuários) é apresentado
como número firme; nenhum deles consta do contexto em nenhuma das três versões do prompt.

## 5. Flags por rodada

| Flag | V1 | V2 | V3 |
| --- | --- | --- | --- |
| US02 — Confidence 50% e Effort subestimado | ⚠️ | ⚠️ | ⚠️ |
| US03 — dependência dos rastreadores v2 | ⚠️ | ⚠️ | ⚠️ |
| US04 — Confidence 50% e Reach não verificado | ⚠️ | ⚠️ | ⚠️ |
| US05 — HiPPO sem evidência de uso | ⚠️ | ⚠️ | ⚠️ |
| US09 — Reach estimado sem dado | ⚠️ | — | — |
| US09 — compra do sensor é o caminho crítico | — | ⚠️ | ⚠️ |
| Dependência de hardware comum a US02/US04/US09 | ⚠️ | prosa | ⚠️ |
| Dependência US03 → US01 | — | prosa | ⚠️ |
| Dependência US01/US03 ↔ US05 (superfície de visualização) | ⚠️ | — | — |
| Capacidade versus escopo (21 pm para 6 devs) | — | — | ⚠️ |

"prosa" = o V2 registrou a dependência num bloco de texto ao final, fora da seção 5 e sem a
marcação ⚠️ que o formato de output pede.
