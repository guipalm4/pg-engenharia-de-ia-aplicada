---
versao: v3
prompt: backlog-scorer-v3.md
input: backlog-routewise-input.md
modelo: claude-opus-5
gerado_em: 03/09/2026
execucao: subagente de contexto limpo
---

### 1. Tabela RICE

| Item | Reach | Impact | Confidence | Effort (pm) | RICE Score |
| ---- | ----- | ------ | ---------- | ----------- | ---------- |
| US01 — Alertas de Velocidade em Tempo Real | 140 veículos/mês | 3 | 80% | 2 | 168,0 |
| US03 — Score de Comportamento do Motorista | 140 motoristas/mês (suposição) | 2 | 50% | 3 | 46,7 |
| US04 — Sensor de Abertura de Baú | 140 veículos/mês (suposição) | 1 | 50% | 4 | 17,5 |
| US09 — Sensor de Baú — Controle de Temperatura | 28 veículos refrigerados/mês | 3 | 80% | 4 | 16,8 |
| US02 — Manutenção Preditiva por Telemetria | 140 veículos/mês | 1 | 50% | 5 | 14,0 |
| US05 — Dashboard Base — Visão Operacional (HiPPO) | 10 usuários/mês (suposição) | 0,5 | 50% | 3 | 0,8 |

### 2. Tabela WSJF

| Item | BV  | TC  | RR  | CoD | Job Size | WSJF |
| ---- | --- | --- | --- | --- | -------- | ---- |
| US01 — Alertas de Velocidade em Tempo Real | 9 | 8 | 7 | 24 | 2 | 12,00 |
| US09 — Sensor de Baú — Controle de Temperatura | 9 | 10 | 9 | 28 | 6 | 4,67 |
| US03 — Score de Comportamento do Motorista | 6 | 5 | 4 | 15 | 5 | 3,00 |
| US04 — Sensor de Abertura de Baú | 2 | 2 | 3 | 7 | 6 | 1,17 |
| US02 — Manutenção Preditiva por Telemetria | 2 | 3 | 3 | 8 | 8 | 1,00 |
| US05 — Dashboard Base — Visão Operacional (HiPPO) | 1 | 1 | 1 | 3 | 4 | 0,75 |

### 3. Ranking Combinado

Método: posição média entre os dois rankings. Quando a diferença de posição média entre dois itens é de até 0,5, aplica-se o desempate por maior Cost of Delay.

| # | Item | Posição RICE | Posição WSJF | Média | CoD |
| - | ---- | ------------ | ------------ | ----- | --- |
| 1 | **US01 — Alertas de Velocidade em Tempo Real** | 1 | 1 | 1,0 | 24 |
| 2 | **US09 — Sensor de Baú — Controle de Temperatura** | 4 | 2 | 3,0 | 28 |
| 3 | **US03 — Score de Comportamento do Motorista** | 2 | 3 | 2,5 | 15 |
| 4 | **US04 — Sensor de Abertura de Baú** | 3 | 4 | 3,5 | 7 |
| 5 | **US02 — Manutenção Preditiva por Telemetria** | 5 | 5 | 5,0 | 8 |
| 6 | **US05 — Dashboard Base — Visão Operacional (HiPPO)** | 6 | 6 | 6,0 | 3 |

Nota de desempate: US03 (média 2,5) e US09 (média 3,0) ficam dentro da faixa de 0,5 de diferença. O desempate por Cost of Delay coloca US09 (CoD 28) acima de US03 (CoD 15). A divergência entre os dois frameworks nesse par tem causa identificável: o Reach de US09 é limitado a 28 veículos refrigerados — 20% da frota —, o que rebaixa seu RICE, enquanto o WSJF captura a exposição de R$ 280.000 e a data dura de 01/01/2027, que o RICE não modela.

### 4. Justificativas

**US01 — Alertas de Velocidade em Tempo Real**

- **Impact justificado: 3 (massivo).** É o único item que ataca diretamente o mecanismo do OKR 1 — o excesso de velocidade é a causa nomeada dos 7 sinistros dos últimos 12 meses. A meta de ir de 7 para 5 significa evitar 2 sinistros, o que a R$ 40.000 cada equivale a R$ 80.000 evitados no período. Reach de 140 veículos/mês vem direto da frota total; o alerta atua sobre todo veículo em circulação, não sobre um subconjunto.
- **Confidence justificada: 80% (indicadores razoáveis).** Os dois números que sustentam o Impact — 7 ocorrências e R$ 40.000 de custo médio — são fatos medidos da operação, não estimativas. O que impede 100% é que a relação causal entre "gestor recebe alerta em 60s" e "motorista reduz velocidade" não está medida na Conecta Cargas: não há histórico de quantos dos 7 sinistros teriam sido evitáveis por alerta em tempo real. Para subir a 100%: cruzar os 7 sinistros com os logs de telemetria existentes e medir quantos tiveram evento de excesso registrado antes da ocorrência.

**US02 — Manutenção Preditiva por Telemetria**

- **Impact justificado: 1 (médio).** O item não move nenhum dos dois OKRs do Carlos: não trata de excesso de velocidade nem de cadeia de temperatura. Pela regra de ancoragem, Impact fica limitado a 1. O benefício declarado — eliminar manutenção reativa e reduzir custos — é plausível, mas não existe no contexto nenhum número de custo de manutenção reativa, frequência de falhas ou downtime que permita dimensioná-lo. Reach de 140 veículos/mês é a frota total, já que o modelo preditivo cobriria todos.
- **Confidence justificada: 50% (intuição).** Suposição declarada: não há no contexto nenhum dado de custo de manutenção, taxa de falha histórica ou tempo de parada, e o item exige todos os três para ser dimensionado. Soma-se a isso o critério de accuracy de 80% medida só após 60 dias em produção — sem histórico de manutenção rotulado, não há como afirmar hoje que o modelo atinge esse patamar. Sem referência disponível de benchmark de manutenção preditiva para frotas desse porte. Para subir: levantar 12 meses de ordens de serviço com custo e causa, e verificar se o hodômetro e a temperatura do motor já são coletados pelo hardware atual.

**US03 — Score de Comportamento do Motorista**

- **Impact justificado: 2 (significativo).** O item move o OKR 1, mas por via indireta: age sobre o comportamento do motorista (treinamento preventivo, ranking, registro em RH), não sobre o evento de risco no momento em que ele acontece. Por isso fica abaixo de US01, que intercepta o mesmo OKR em tempo real. O efeito é diferido — o score da semana influencia a direção da semana seguinte —, enquanto a meta tem data em setembro de 2026.
- **Confidence justificada: 50% (intuição).** Suposição declarada: o Reach de 140 motoristas/mês assume um motorista por veículo, número que não está nas tabelas do contexto — não há dado de quantos motoristas a Conecta Cargas emprega, nem se há revezamento por veículo. Segunda lacuna: não há medição interna de quanto um programa de score reduz eventos de velocidade, e sem referência disponível de benchmark do setor. Para subir: obter o efetivo de motoristas do RH e rodar o MVP parcial (só velocidade) por 8 semanas medindo a variação de eventos por motorista.

**US04 — Sensor de Abertura de Baú**

- **Impact justificado: 1 (médio).** Desvio de carga e não conformidade de entrega não aparecem em nenhum dos dois OKRs, o que trava o Impact em 1 pela regra de ancoragem. Diferente de US09, este item não tem exposição financeira declarada no contexto: não há valor de perda por desvio nem contagem de ocorrências para dimensionar o benefício.
- **Confidence justificada: 50% (intuição).** Suposição declarada: o Reach de 140 veículos/mês assume que toda a frota tem baú monitorável, o que não consta das tabelas — o contexto só discrimina os 28 refrigerados. Não há também nenhum registro de ocorrências de desvio de carga que justifique a estimativa de benefício. Para subir: obter a contagem de veículos com baú fechado e o histórico de ocorrências de desvio dos últimos 12 meses com valor de carga envolvido.

**US05 — Dashboard Base — Visão Operacional da Frota (HiPPO)**

- **Impact justificado: 0,5 (baixo).** Não move nenhum dos dois OKRs — é visibilidade, não redução de sinistro nem comprovação de temperatura —, então o teto é 1. Fica abaixo do teto por dois fatos registrados na própria nota do item: o pedido é verbal, sem evidência de uso operacional, e o usuário provável é Priya (TI), não o stakeholder cujos OKRs ancoram a priorização. O valor é de conveniência executiva, e os dados que ele exibe são produzidos por outros itens do backlog.
- **Confidence justificada: 50% (intuição).** Suposição declarada: o Reach de 10 usuários/mês é estimativa própria — o contexto não informa quantos gestores, executivos ou usuários de TI acessariam o painel. É a única fonte de Reach possível, já que o item não afeta veículos e sim pessoas consultando o sistema. Para subir: identificar nominalmente os usuários do painel e medir a frequência com que hoje consultam os múltiplos sistemas que ele substituiria.

**US09 — Sensor de Baú — Controle de Temperatura da Carga**

- **Impact justificado: 3 (massivo).** Único item que atende o OKR 2 — comprovar em fiscalização a cadeia de temperatura de toda viagem refrigerada. O critério de aceitação "log completo para auditoria e comprovação de conformidade" é literalmente o objeto do OKR. Reach de 28 veículos/mês é o dado medido da frota refrigerada (20% de 140), usado sem arredondamento; é baixo em termos absolutos, mas é 100% da população que o OKR 2 cobre. A multa de R$ 10.000 por veículo não entra aqui — como exposição financeira, foi alocada ao Business Value do WSJF.
- **Confidence justificada: 80% (indicadores razoáveis).** Os números que sustentam a priorização são medidos e datados: 28 veículos refrigerados, R$ 10.000 por autuação, corte em 01/01/2027 e lead time de 60 dias. O que falta para 100% é a especificação técnica da conformidade: a faixa de 2°C–8°C aparece no critério como exemplo, e os requisitos exatos da ANVISA quanto a frequência de leitura, retenção de log e formato de comprovação não estão no contexto. Para subir: validar a norma aplicável com a área regulatória e confirmar que o sensor escolhido atende a granularidade exigida.

**Justificativa dos Cost of Delay (WSJF)**

- **US01 — BV 9 / TC 8 / RR 7.** BV alto pela exposição de R$ 80.000 (2 sinistros × R$ 40.000) implicada pela meta do OKR 1. TC 8 porque o OKR tem data definida — setembro de 2026 — e o efeito depende de tempo em operação para se materializar. RR 7 porque o pipeline de eventos de velocidade que este item constrói é pré-requisito do MVP parcial de US03.
- **US09 — BV 9 / TC 10 / RR 9.** BV pela exposição de R$ 280.000 (28 veículos × R$ 10.000 por autuação). TC 10 é o máximo da tabela: prazo externo regulatório com data dura em 01/01/2027, e o lead time de 60 dias do hardware significa que o pedido de sensores precisa estar colocado por volta de 01/11/2026 — o valor não decai gradualmente, ele cai a zero na virada do ano. RR 9 pela eliminação de risco de compliance.
- **US03 — BV 6 / TC 5 / RR 4.** BV pela contribuição indireta ao OKR 1. TC 5 porque compartilha a data de setembro de 2026, mas o efeito comportamental é retardado e parte do escopo está bloqueada por hardware. RR 4 porque o MVP parcial por velocidade reduz o risco de esperar os rastreadores v2.
- **US04 — BV 2 / TC 2 / RR 3.** Sem vínculo com OKR e sem exposição financeira declarada. RR 3 pelo aproveitamento da mesma janela de compra de hardware de US09.
- **US02 — BV 2 / TC 3 / RR 3.** Sem vínculo com OKR. TC 3 apenas pelo lead time de hardware, que é dependência de execução e não prazo externo de negócio. RR 3 líquido: reduz risco operacional de quebra, mas adiciona risco técnico de modelo preditivo.
- **US05 — BV 1 / TC 1 / RR 1.** Sem vínculo com OKR, sem prazo, sem desbloqueio — ao contrário, é consumidor dos dados produzidos pelos demais itens.

### 5. Flags ⚠️

⚠️ **US02 — MANUTENÇÃO PREDITIVA POR TELEMETRIA:** Confidence 50% e Effort provavelmente subestimado. Três problemas somados: (a) nenhum dado de custo de manutenção reativa no contexto, o que torna o benefício não dimensionável; (b) dependência de sensor IoT com lead time de 60 dias; (c) o critério de accuracy de 80% pressupõe histórico de manutenção rotulado que não se sabe existir, e os 5 pessoa-mês estimados não incluem retreino do modelo nem o período de 60 dias de medição em produção. → Antes de priorizar: levantar 12 meses de ordens de serviço com custo e causa, confirmar que hodômetro e temperatura do motor já são coletados pelo hardware atual, e refazer a estimativa de Effort separando coleta de dados, modelo e integração com a oficina.

⚠️ **US03 — SCORE DE COMPORTAMENTO DO MOTORISTA:** Confidence 50% e dependência técnica não resolvida. O Reach de 140 assume um motorista por veículo, número ausente do contexto. O score completo está bloqueado por hardware — rastreadores v2 com acelerômetro — cuja compra não aparece como item do backlog nem tem prazo associado. → Antes de priorizar: obter o efetivo real de motoristas do RH, criar um item explícito de aquisição dos rastreadores v2 com prazo, e delimitar o escopo do MVP parcial (somente velocidade) como entrega independente.

⚠️ **US04 — SENSOR DE ABERTURA DE BAÚ:** Confidence 50% e dependência de hardware. O Reach de 140 assume que toda a frota tem baú monitorável, o que o contexto não confirma — ele só discrimina os 28 refrigerados. Não há histórico de desvios de carga que sustente o benefício. Depende do mesmo sensor IoT com lead time de 60 dias. → Antes de priorizar: obter a contagem de veículos com baú fechado e o histórico de ocorrências de desvio com valor de carga envolvido.

⚠️ **US05 — DASHBOARD BASE — VISÃO OPERACIONAL DA FROTA (HiPPO):** Confidence 50% e demanda sem lastro. O Reach de 10 usuários é suposição própria; o pedido é verbal, sem evidência de uso operacional, e o usuário provável é Priya (TI), não o stakeholder cujos OKRs ancoram esta priorização. → Antes de priorizar: identificar nominalmente os usuários e medir a frequência atual de consulta aos sistemas que o painel substituiria. Enquanto isso não existir, tratar como pedido de HiPPO e manter no fim da fila.

⚠️ **US09 — SENSOR DE BAÚ — CONTROLE DE TEMPERATURA DA CARGA:** Dependência técnica não resolvida com prazo crítico, apesar de Confidence 80%. O lead time de 60 dias para o hardware e a data dura de 01/01/2027 implicam data-limite de pedido em torno de 01/11/2026 — a compra dos 28 sensores é caminho crítico e precede o desenvolvimento. Effort de 4 pessoa-mês cobre software; não cobre aquisição, instalação em 28 veículos nem homologação. → Antes de priorizar: colocar a ordem de compra dos sensores como tarefa independente do desenvolvimento, com data-limite explícita, e validar os requisitos da ANVISA quanto a frequência de leitura, retenção de log e formato de comprovação.

⚠️ **DEPENDÊNCIA ENTRE ITENS — US03 → US01:** O MVP parcial de US03 consome os eventos de velocidade produzidos pelo pipeline de US01. US01 está rankeado em 1º e US03 em 3º, então a ordem é consistente e o ranking não é invalidado; a dependência é registrada para que US03 não seja puxado para a sprint antes da conclusão do pipeline de eventos de US01.

⚠️ **DEPENDÊNCIA COMPARTILHADA DE HARDWARE — US09, US04 e US02:** Os três dependem de sensor IoT com o mesmo lead time de 60 dias, e US09 é o único com data regulatória dura. Se as compras forem tratadas como três aquisições independentes, o pedido de US09 pode ser atrasado por concorrência interna com itens de prioridade menor. → Antes de priorizar: consolidar a especificação e o pedido de hardware numa única aquisição, dimensionada primeiro pelos 28 baús refrigerados de US09, e verificar se os sensores de temperatura e de abertura de baú podem ser o mesmo dispositivo.

⚠️ **CAPACIDADE VERSUS ESCOPO:** A soma dos Efforts é de 21 pessoa-mês para um time de 6 devs — cerca de 3,5 meses de calendário se todo o time trabalhasse exclusivamente neste backlog e sem nenhuma perda. Com a data-limite de pedido de hardware de US09 em torno de 01/11/2026 e a meta do OKR 1 em setembro de 2026, os dois itens de topo do ranking (US01 e US09) não cabem na janela junto com os demais. → Antes de priorizar: converter os Efforts em pessoa-mês para story points contra a capacidade de ~35 SP por sprint e confirmar com Carlos que US02, US04 e US05 ficam fora do MVP.
