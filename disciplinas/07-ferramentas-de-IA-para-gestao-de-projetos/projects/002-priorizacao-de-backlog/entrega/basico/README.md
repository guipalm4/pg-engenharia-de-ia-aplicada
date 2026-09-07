# Missão #02 — Priorização de Backlog com IA · nível Básico

| Item | Valor |
| --- | --- |
| Prompt V2 | [`backlog-scorer-v2`](../../prompts/backlog-scorer-v2.md) — contexto de negócio ampliado com os OKRs do stakeholder |
| Modelo | `claude-opus-5`, subagente de contexto limpo (o material pede Gemini a 0.3; `temperature` não existe nos modelos Claude atuais) |
| Output completo | [`outputs/backlog-priorizado-v2.md`](../../outputs/backlog-priorizado-v2.md) — 6 User Stories |

---

## Calibração — dados acrescentados na 2ª rodada

| Dado | Valor | Tipo de fonte | O que calibra |
| --- | --- | --- | --- |
| Frequência de sinistros | 2/mês | dado financeiro da operação | US01 — Impact |
| Custo por sinistro | R$ 40.000 | dado financeiro da operação | US01 — Impact |
| Frota refrigerada | 20% de 140 = 28 veículos | dado operacional da frota | US09 — Reach |
| Multa por caminhão sem sensor | R$ 10.000 | exigência regulatória (ANVISA) | US09 — Impact |
| Prazo de conformidade | 01/01/2027 | exigência regulatória (ANVISA) | US09 — Time Criticality |

---

### 1. Tabela RICE

| Item | Reach | Impact | Confidence | Effort (pm) | RICE Score |
| --- | --- | --- | --- | --- | --- |
| US01 — Alertas de Velocidade em Tempo Real | 140 veículos/mês | 3 | 80% | 2,0 | **168,0** |
| US03 — Score de Comportamento do Motorista | 140 motoristas/mês | 2 | 50% | 4,0 | **35,0** |
| US09 — Sensor de Baú — Controle de Temperatura | 28 veículos refrigerados/mês | 3 | 100% | 3,0 | **28,0** |
| US04 — Sensor de Abertura de Baú | 140 veículos/mês | 1 | 50% | 3,0 | **23,3** |
| US02 — Manutenção Preditiva por Telemetria | 140 veículos/mês | 1 | 50% | 6,0 | **11,7** |
| US05 — Dashboard Base — Visão Operacional (HiPPO) | 5 usuários/mês | 0,5 | 50% | 2,5 | **0,5** |

Base de Reach: 140 veículos na frota; 20% refrigerados = 28 veículos para a US09; a US05 alcança apenas
o círculo executivo/TI (Carlos, Priya e ~3 gestores), não a frota.

### 2. Tabela WSJF

| Item | BV | TC | RR | CoD | Job Size | WSJF |
| --- | --- | --- | --- | --- | --- | --- |
| US01 — Alertas de Velocidade em Tempo Real | 10 | 8 | 6 | 24 | 3 | **8,00** |
| US09 — Sensor de Baú — Controle de Temperatura | 8 | 10 | 10 | 28 | 5 | **5,60** |
| US03 — Score de Comportamento do Motorista | 7 | 4 | 5 | 16 | 6 | **2,67** |
| US04 — Sensor de Abertura de Baú | 3 | 3 | 3 | 9 | 5 | **1,80** |
| US02 — Manutenção Preditiva por Telemetria | 3 | 3 | 4 | 10 | 8 | **1,25** |
| US05 — Dashboard Base — Visão Operacional (HiPPO) | 2 | 2 | 1 | 5 | 4 | **1,25** |

### 3. Ranking Combinado

| # | Item | RICE | WSJF | Razão da posição |
| --- | --- | --- | --- | --- |
| 1 | **US01 — Alertas de Velocidade em Tempo Real** | 168,0 (1º) | 8,00 (1º) | Primeiro nos dois frameworks. Único item que ataca diretamente o OKR de sinistros (7 → 5 até set/2026) e o único sem dependência de hardware externo — pode entrar na próxima sprint. |
| 2 | **US09 — Sensor de Baú — Controle de Temperatura** | 28,0 (3º) | 5,60 (2º) | Perde para a US03 no RICE por Reach (28 vs. 140 veículos), mas ganha na combinação: CoD 28 é o maior do backlog. Prazo externo duro (01/01/2027) e multa de R$ 280.000 (28 caminhões × R$ 10.000) que não decai — o que decai a zero é o valor de entregar depois. Com lead time de 60 dias para o sensor, o pedido de hardware precisa sair antes de o desenvolvimento começar. |
| 3 | **US03 — Score de Comportamento do Motorista** | 35,0 (2º) | 2,67 (3º) | RICE alto por Reach de 140 motoristas, mas WSJF baixo: sem prazo externo e bloqueado pelos rastreadores v2. O MVP parcial (score só por velocidade) reaproveita o pipeline de eventos da US01 e pode ser entregue logo depois dele; o score completo espera hardware. |
| 4 | **US04 — Sensor de Abertura de Baú** | 23,3 (4º) | 1,80 (4º) | Consistente em 4º nos dois frameworks. Reach da frota inteira, mas Impact 1 — desvio de carga não aparece em nenhum OKR do Carlos e não há baseline de perdas no contexto. |
| 5 | **US02 — Manutenção Preditiva por Telemetria** | 11,7 (5º) | 1,25 (5º, empate) | Maior Job Size do backlog (modelo preditivo + integração com oficina + hardware) contra Impact 1. Empata em WSJF com a US05; o desempate por Cost of Delay (10 vs. 5) coloca a US02 acima. |
| 6 | **US05 — Dashboard Base — Visão Operacional (HiPPO)** | 0,5 (6º) | 1,25 (5º, empate) | Último. RICE de 0,5 é duas ordens de grandeza abaixo do penúltimo — efeito de Reach 5 e Impact 0,5. Pedido verbal sem evidência de uso operacional; perde o desempate de WSJF pelo menor CoD do backlog. |

### 4. Flags e planos de resolução

⚠️ **US09 — Sensor de Baú — Controle de Temperatura:** dependência de hardware com lead time de 60 dias
e prazo regulatório em 01/01/2027, sem nenhum item de aquisição de sensores no backlog. Considerando 28
caminhões, os 60 dias de lead time e a instalação em campo, o desenvolvimento não é o caminho crítico —
a compra é. → Antes de priorizar o desenvolvimento, abrir e datar o pedido de compra dos 28 sensores,
confirmar a especificação exigida em fiscalização (faixa, periodicidade, formato do log) e travar a
janela de instalação na frota.

**Plano:** abrir o pedido de compra dos 28 sensores com a equipe de Compras ainda nesta sprint — os 60
dias de lead time correm fora da capacidade do time e não competem com o desenvolvimento. Em paralelo,
solicitar a documentação do fabricante e desenvolver contra um mock do sensor, para não travar a
implementação. Quando o hardware chegar, entra uma atividade de teste com sensor real.
**Efeito no sprint:** o desenvolvimento pode começar na Sprint 2 sem esperar o hardware; o prazo de
01/01/2027 só é atingível se a compra sair antes do fim desta sprint.

⚠️ **US03 — Score de Comportamento do Motorista:** Confidence 50% e dependência técnica não resolvida —
os rastreadores v2 com acelerômetro não existem na frota e não há item de aquisição correspondente no
backlog; o item como escrito não é entregável. → Antes de priorizar: quebrar em duas histórias (MVP
parcial por velocidade, entregável sobre os eventos da US01, e score completo, bloqueado por hardware)
e confirmar o escopo da integração com o RH, que envolve equipe externa não dimensionada no Effort.

**Plano:** marcar uma reunião de refinamento com os stakeholders para definir os critérios de composição
do score do motorista. Decisão a fechar na reunião: se o MVP é o score parcial (só velocidade), os
critérios de aceitação atuais precisam ser reescritos, porque descrevem o score completo.
**Efeito no sprint:** com o score parcial, o item entra logo depois de a US01 estar em produção e o
Effort cai; com o score completo, fica bloqueado pelos rastreadores v2 e sai do horizonte das próximas
sprints.

> As demais flags do output (US02, US04, US05) estão em
> [`outputs/backlog-priorizado-v2.md`](../../outputs/backlog-priorizado-v2.md). Para este estudo,
> desenvolvi o plano de resolução das duas de maior prioridade no ranking.

**Dependências entre itens que afetam o ranking:**

- **US03 depende da US01** (o pipeline de eventos de velocidade que alimenta o score). A US01 está em 1º
  e a US03 em 3º — a ordem é válida; o MVP parcial da US03 só pode começar depois de a US01 estar em
  produção.
- **US02, US04 e US09 dependem de um item de aquisição de sensores IoT que não existe no backlog.** Isso
  não inverte o ranking entre os itens listados, mas invalida qualquer cronograma derivado dele: os três
  estão rankeados como se o hardware fosse um custo de desenvolvimento, quando é um lead time de 60 dias
  em série com a implementação. O caso mais grave é a US09, em 2º lugar e com prazo externo.
