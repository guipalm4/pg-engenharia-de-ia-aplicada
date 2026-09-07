---
versao: v2
prompt: backlog-scorer-v2.md
input: backlog-routewise-input.md
modelo: claude-opus-5
gerado_em: 03/09/2026
execucao: subagente de contexto limpo
---

### 1. Tabela RICE

| Item | Reach | Impact | Confidence | Effort (pm) | RICE Score |
| ---- | ----- | ------ | ---------- | ----------- | ---------- |
| US01 — Alertas de Velocidade em Tempo Real | 140 veículos/mês | 3 | 80% | 2,0 | **168,0** |
| US03 — Score de Comportamento do Motorista | 140 motoristas/mês | 2 | 50% | 4,0 | **35,0** |
| US09 — Sensor de Baú — Controle de Temperatura | 28 veículos refrigerados/mês | 3 | 100% | 3,0 | **28,0** |
| US04 — Sensor de Abertura de Baú | 140 veículos/mês | 1 | 50% | 3,0 | **23,3** |
| US02 — Manutenção Preditiva por Telemetria | 140 veículos/mês | 1 | 50% | 6,0 | **11,7** |
| US05 — Dashboard Base — Visão Operacional (HiPPO) | 5 usuários/mês | 0,5 | 50% | 2,5 | **0,5** |

Base de Reach: 140 veículos na frota; 20% refrigerados = 28 veículos para US09; US05 alcança apenas o círculo executivo/TI (Carlos, Priya e ~3 gestores), não a frota.

### 2. Tabela WSJF

| Item | BV  | TC  | RR  | CoD | Job Size | WSJF |
| ---- | --- | --- | --- | --- | -------- | ---- |
| US01 — Alertas de Velocidade em Tempo Real | 10 | 8 | 6 | 24 | 3 | **8,00** |
| US09 — Sensor de Baú — Controle de Temperatura | 8 | 10 | 10 | 28 | 5 | **5,60** |
| US03 — Score de Comportamento do Motorista | 7 | 4 | 5 | 16 | 6 | **2,67** |
| US04 — Sensor de Abertura de Baú | 3 | 3 | 3 | 9 | 5 | **1,80** |
| US02 — Manutenção Preditiva por Telemetria | 3 | 3 | 4 | 10 | 8 | **1,25** |
| US05 — Dashboard Base — Visão Operacional (HiPPO) | 2 | 2 | 1 | 5 | 4 | **1,25** |

### 3. Ranking Combinado

| # | Item | RICE | WSJF | Razão da posição |
| - | ---- | ---- | ---- | ---------------- |
| 1 | **US01 — Alertas de Velocidade em Tempo Real** | 168,0 (1º) | 8,00 (1º) | Primeiro nos dois frameworks. Único item que ataca diretamente o OKR de sinistros (7 → 5 até set/2026) e o único sem dependência de hardware externo — pode entrar na próxima sprint. |
| 2 | **US09 — Sensor de Baú — Controle de Temperatura** | 28,0 (3º) | 5,60 (2º) | Perde para US03 no RICE por Reach (28 vs. 140 veículos), mas ganha na combinação: CoD 28 é o maior do backlog. Prazo externo duro (01/01/2027) e multa de R$ 280.000 (28 caminhões × R$ 10.000) que não decai — decai a zero o valor de entregar depois. Com lead time de 60 dias para o sensor, o pedido de hardware precisa sair antes de o desenvolvimento começar. |
| 3 | **US03 — Score de Comportamento do Motorista** | 35,0 (2º) | 2,67 (3º) | RICE alto por Reach de 140 motoristas, mas WSJF baixo: sem prazo externo e bloqueado por rastreadores v2. O MVP parcial (score só por velocidade) reaproveita o pipeline de eventos de US01 e pode ser entregue logo depois dele; o score completo espera hardware. |
| 4 | **US04 — Sensor de Abertura de Baú** | 23,3 (4º) | 1,80 (4º) | Consistente em 4º nos dois frameworks. Reach da frota inteira, mas Impact 1 — desvio de carga não aparece em nenhum OKR do Carlos e não há baseline de perdas no contexto. |
| 5 | **US02 — Manutenção Preditiva por Telemetria** | 11,7 (5º) | 1,25 (5º, empate) | Maior Job Size do backlog (modelo preditivo + integração com oficina + hardware) contra Impact 1. Empata em WSJF com US05; desempate por Cost of Delay (10 vs. 5) coloca US02 acima. |
| 6 | **US05 — Dashboard Base — Visão Operacional (HiPPO)** | 0,5 (6º) | 1,25 (5º, empate) | Último. RICE de 0,5 é duas ordens de grandeza abaixo do penúltimo — efeito de Reach 5 e Impact 0,5. Pedido verbal sem evidência de uso operacional; perde o desempate de WSJF pelo menor CoD do backlog. |

### 4. Justificativas

**US01 — Alertas de Velocidade em Tempo Real**
- **Impact justificado (3 — massivo):** é o único item cujo mecanismo age sobre a variável do OKR nº 1 do Carlos — excesso de velocidade. A baseline do contexto é quantificada: 2 sinistros/mês a R$ 40.000, e a meta é cortar de 7 para 5 (~28%) até set/2026. Nenhum outro item do backlog intervém no comportamento em tempo real, no momento em que o excesso ocorre.
- **Confidence justificada (80% — indicadores razoáveis):** a baseline interna é sólida (frequência e custo de sinistro conhecidos) e o dado de velocidade já está disponível — a nota do US03 confirma que só o acelerômetro depende do rastreador v2. O que impede 100%: sem referência disponível para o percentual de redução de sinistros atribuível a alerta em tempo real neste domínio, ou seja, sabe-se o custo do problema mas não a eficácia da intervenção. Para subir a 100%: piloto de 30 dias em um subconjunto da frota medindo eventos de excesso antes/depois.

**US02 — Manutenção Preditiva por Telemetria**
- **Impact justificado (1 — médio):** reduz custo de manutenção reativa, que não aparece em nenhum dos três OKRs do Carlos e não tem valor quantificado no contexto. Alcança os 140 veículos, mas o efeito por veículo é uma economia operacional difusa, não a remoção de um risco declarado.
- **Confidence justificada (50% — intuição):** o critério de accuracy mínima de 80% pressupõe volume e qualidade de histórico de manutenção que o contexto não declara existir, e sem referência disponível para accuracy de modelos preditivos de falha em frota deste porte. Para subir a 80%: auditar o histórico de manutenção existente (quantos veículos, quantos meses, quantas falhas rotuladas) e rodar um baseline offline antes de comprometer o critério de aceitação.

**US03 — Score de Comportamento do Motorista**
- **Impact justificado (2 — significativo):** atua sobre o mesmo OKR de sinistros que US01, mas por via indireta e de efeito diferido — treinamento e cultura, não intervenção no momento do evento. O contexto não oferece baseline de quantos sinistros vêm de comportamento recorrente identificável, o que impede sustentar Impact 3.
- **Confidence justificada (50% — intuição):** dois componentes do score (frenagem brusca e aceleração) dependem de rastreadores v2 que ainda não existem na frota, e o elo score → redução de sinistro não foi medido na Conecta Cargas. Para subir a 80%: entregar o MVP parcial por velocidade sobre os eventos de US01 e medir, em 8 semanas de histórico, se motoristas com score baixo concentram os eventos de excesso.

**US04 — Sensor de Abertura de Baú**
- **Impact justificado (1 — médio):** desvio de carga e não conformidade de entrega não constam de nenhum OKR do Carlos, e o contexto não traz frequência nem custo de ocorrências — diferente de US01 (R$ 40.000/sinistro) e US09 (R$ 10.000/caminhão de multa). Sem valor de referência, o item não pode reivindicar impacto acima de médio.
- **Confidence justificada (50% — intuição):** não há baseline de desvios de carga na operação e sem referência disponível para taxa de incidentes em frota logística deste porte; a estimativa apoia-se apenas na plausibilidade do problema. Para subir a 80%: levantar com a operação o número de ocorrências de não conformidade dos últimos 6 meses e seu custo.

**US05 — Dashboard Base — Visão Operacional da Frota (HiPPO)**
- **Impact justificado (0,5 — baixo):** entrega visibilidade, não muda nenhuma das três variáveis dos OKRs — sinistros, cobertura de sensores em refrigerados e comprovação de cadeia de temperatura. A própria nota registra ausência de uso operacional real e aponta Priya (TI) como usuária mais provável, não o stakeholder que define a prioridade.
- **Confidence justificada (50% — intuição):** a única evidência é um pedido verbal em reunião; não há dado de uso, nem usuário confirmado, nem tarefa operacional que hoje falhe por falta do painel. Para subir a 80%: identificar qual decisão operacional concreta depende do painel e quem a toma, com frequência semanal declarada.

**US09 — Sensor de Baú — Controle de Temperatura da Carga**
- **Impact justificado (3 — massivo):** cobre o OKR de compliance com prazo declarado (comprovar cadeia de temperatura antes de 01/01/2027) e a exposição é quantificada no contexto: R$ 10.000 por caminhão sem sensor × 28 refrigerados (20% de 140) = R$ 280.000, além da perda de carga em caso de excursão térmica. É o único item do backlog cuja ausência gera penalidade financeira direta.
- **Confidence justificada (100% — evidências sólidas):** o requisito não é uma hipótese de valor, é uma obrigação com prazo e multa nominal informados no contexto; o resultado — log auditável de temperatura por viagem — é binário e verificável, não depende de mudança de comportamento de terceiros. A Confidence alta refere-se ao valor do item, não ao seu cronograma, que é o objeto da flag abaixo.

### 5. Flags ⚠️

⚠️ **US09 — Sensor de Baú — Controle de Temperatura:** dependência de hardware com lead time de 60 dias e prazo regulatório em 01/01/2027, sem nenhum item de aquisição de sensores no backlog. Considerando 28 caminhões, os 60 dias de lead time e a instalação em campo, o desenvolvimento não é o caminho crítico — a compra é. → Antes de priorizar o desenvolvimento, abrir e datar o pedido de compra dos 28 sensores, confirmar a especificação exigida em fiscalização (faixa, periodicidade, formato do log) e travar a janela de instalação na frota.

⚠️ **US02 — Manutenção Preditiva por Telemetria:** Confidence 50%, dependência de sensor IoT (lead time de 60 dias) e Effort provavelmente subestimado — os 6 pessoa-mês cobrem desenvolvimento, mas o critério "accuracy mínima de 80% medida em produção após 60 dias" adiciona 2 meses de janela de validação e retrabalho que não estão na estimativa, e o histórico de manutenção necessário para treinar o modelo não está confirmado como existente. → Antes de priorizar: auditar o histórico disponível, separar a entrega em duas (alerta determinístico por km/tempo, que não precisa de modelo, e o preditivo) e renegociar o critério de accuracy como meta e não como aceite.

⚠️ **US03 — Score de Comportamento do Motorista:** Confidence 50% e dependência técnica não resolvida — os rastreadores v2 com acelerômetro não existem na frota e não há item de aquisição correspondente no backlog; o item como escrito não é entregável. → Antes de priorizar: quebrar em duas histórias (MVP parcial por velocidade, entregável sobre os eventos de US01, e score completo, bloqueado por hardware) e confirmar o escopo da integração com o RH, que envolve equipe externa não dimensionada no Effort.

⚠️ **US04 — Sensor de Abertura de Baú:** Confidence 50% e dependência de sensor IoT com lead time de 60 dias. Não há baseline de desvios de carga que sustente Impact ou Reach — a estimativa de Reach 140 assume que todos os veículos receberiam o sensor, o que não foi decidido. → Antes de priorizar: levantar ocorrências e custo dos últimos 6 meses e definir se o rollout é da frota inteira ou de um subconjunto de rotas.

⚠️ **US05 — Dashboard Base — Visão Operacional da Frota:** Confidence 50%, item HiPPO — solicitado verbalmente pelo stakeholder mais sênior, sem evidência de uso, com usuária mais provável (Priya/TI) distinta do solicitante. Consome 2,5 pessoa-mês de uma capacidade de ~35 SP por sprint que está comprometida com o OKR de sinistros e com o prazo regulatório. → Antes de priorizar: validar com Priya qual decisão o painel suporta e com que frequência; se não houver, manter fora do MVP ou reduzir a um recorte mínimo (mapa ao vivo, sem export PDF nem filtros).

**Dependências entre itens que afetam o ranking:**

- **US03 depende de US01** (o pipeline de eventos de velocidade que alimenta o score). US01 está em 1º e US03 em 3º — a ordem é válida, o MVP parcial de US03 só pode começar depois de US01 estar em produção.
- **US02, US04 e US09 dependem de um item de aquisição de sensores IoT que não existe no backlog.** Isso não inverte o ranking entre os itens listados, mas invalida qualquer cronograma derivado dele: os três estão rankeados como se o hardware fosse um custo de desenvolvimento, quando é um lead time de 60 dias em série com a implementação. O caso mais grave é US09, em 2º lugar e com prazo externo.
