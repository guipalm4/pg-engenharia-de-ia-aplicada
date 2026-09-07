---
versao: v1
prompt: backlog-scorer-v1.md
input: backlog-routewise-input.md
modelo: claude-opus-5
gerado_em: 03/09/2026
execucao: subagente de contexto limpo
---

### 1. Tabela RICE

Unidade de Reach: veículos da frota afetados por mês (140 = frota inteira), exceto US05, cuja unidade é usuários distintos do painel por mês.

| Item | Reach | Impact | Confidence | Effort (pm) | RICE Score |
| ---- | ----- | ------ | ---------- | ----------- | ---------- |
| US01 — Alertas de Velocidade em Tempo Real | 140 veículos/mês | 3 | 80% | 1,5 | **224,0** |
| US03 — Score de Comportamento do Motorista | 140 motoristas/mês | 2 | 50% | 2,5 | **56,0** |
| US04 — Sensor de Abertura de Baú | 140 veículos/mês | 1 | 50% | 3,0 | **23,3** |
| US02 — Manutenção Preditiva por Telemetria | 140 veículos/mês | 1 | 50% | 4,0 | **17,5** |
| US09 — Sensor de Baú — Controle de Temperatura | 28 veículos/mês (estimado) | 2 | 50% | 3,0 | **9,3** |
| US05 — Dashboard Base (HiPPO) | 5 usuários/mês | 0,5 | 50% | 2,0 | **0,6** |

### 2. Tabela WSJF

| Item | BV  | TC  | RR  | CoD | Job Size | WSJF |
| ---- | --- | --- | --- | --- | -------- | ---- |
| US01 — Alertas de Velocidade em Tempo Real | 10 | 9 | 8 | 27 | 3 | **9,0** |
| US03 — Score de Comportamento do Motorista | 7 | 5 | 5 | 17 | 5 | **3,4** |
| US09 — Sensor de Baú — Controle de Temperatura | 3 | 7 | 8 | 18 | 6 | **3,0** |
| US04 — Sensor de Abertura de Baú | 2 | 4 | 5 | 11 | 6 | **1,8** |
| US02 — Manutenção Preditiva por Telemetria | 3 | 4 | 6 | 13 | 8 | **1,6** |
| US05 — Dashboard Base (HiPPO) | 2 | 2 | 2 | 6 | 4 | **1,5** |

### 3. Ranking Combinado

Método: média das posições de cada item nas duas tabelas (RICE e WSJF). Desempate por maior Cost of Delay.

| # | Item | Posição RICE | Posição WSJF | Média | RICE | WSJF | CoD |
| - | ---- | ------------ | ------------ | ----- | ---- | ---- | --- |
| 1 | **US01 — Alertas de Velocidade em Tempo Real** | 1 | 1 | 1,0 | 224,0 | 9,0 | 27 |
| 2 | **US03 — Score de Comportamento do Motorista** | 2 | 2 | 2,0 | 56,0 | 3,4 | 17 |
| 3 | **US04 — Sensor de Abertura de Baú** | 3 | 4 | 3,5 | 23,3 | 1,8 | 11 |
| 4 | **US09 — Sensor de Baú — Controle de Temperatura** | 5 | 3 | 4,0 | 9,3 | 3,0 | 18 |
| 5 | **US02 — Manutenção Preditiva por Telemetria** | 4 | 5 | 4,5 | 17,5 | 1,6 | 13 |
| 6 | **US05 — Dashboard Base (HiPPO)** | 6 | 6 | 6,0 | 0,6 | 1,5 | 6 |

Observação sobre a posição 3 e 4: US04 e US09 divergem entre os frameworks. US04 vence no RICE por alcance (toda a frota tem baú; apenas parte é refrigerada) e US09 vence no WSJF por Cost of Delay (18 contra 11), puxado por compliance ANVISA. A média posicional coloca US04 à frente por 0,5 ponto — margem menor que a incerteza da estimativa de Reach do US09. Se a contagem real de veículos refrigerados for superior a ~65, o RICE do US09 ultrapassa o do US04 e as posições se invertem. Ver Flags.

### 4. Justificativas

**US01 — Alertas de Velocidade em Tempo Real**
- **Impact justificado: 3 (massivo).** É o único item do backlog cuja saída é a própria métrica do OKR do Carlos — sinistros por excesso de velocidade, de 7 para 5 até setembro de 2026. Os demais itens atacam custo de manutenção (US02), desvio de carga (US04), conformidade de temperatura (US09) ou visibilidade (US05), que são objetivos distintos do OKR declarado. O alerta age no momento do evento, sobre os 140 veículos, sem depender de ciclo de treinamento ou de relatório semanal.
- **Confidence justificada: 80% (indicadores razoáveis).** Sustentam esse nível: (a) o dado de velocidade já é capturado pelos rastreadores atuais — a US03 declara que o "MVP parcial por velocidade" está disponível antes do hardware v2, o que confirma que velocidade não depende do lead time de 60 dias; (b) o baseline do OKR é conhecido e quantificado (7 sinistros). Não há benchmark público de mercado para a redução percentual de sinistros atribuível a alerta em tempo real em frota logística brasileira — sem referência disponível para esse efeito. Para subir a 100%: rodar 30 dias de coleta e medir a taxa de eventos de excesso por veículo/mês, hoje estimada e não medida.

**US03 — Score de Comportamento do Motorista**
- **Impact justificado: 2 (significativo).** Contribui para o mesmo OKR do US01, mas por via indireta e mais lenta: o score muda comportamento por ciclo semanal de relatório e treinamento, não no instante do evento. O item também não é totalmente entregável no MVP — a própria nota do input diz que o score completo (frenagem brusca, aceleração) está bloqueado pelos rastreadores v2 com acelerômetro, restando um score parcial baseado só em velocidade, ou seja, uma fração dos três eventos de telemetria descritos na história.
- **Confidence justificada: 50% (intuição).** Duas lacunas específicas: (a) não há dado, no contexto, sobre correlação entre score de motorista e sinistros na Conecta Cargas, nem benchmark de domínio disponível para o efeito de gamificação sobre sinistralidade — sem referência disponível; (b) a fatia entregável no MVP depende de uma decisão ainda não tomada (lançar score parcial só com velocidade ou aguardar o hardware v2). Para subir a 80%: definir o escopo do MVP parcial e medir a dispersão de eventos de velocidade por motorista nos dados atuais, que dirá se o ranking separa motoristas de fato.

**US04 — Sensor de Abertura de Baú**
- **Impact justificado: 1 (médio).** Endereça desvio de carga e não conformidade de entrega — problemas reais de logística, porém fora do OKR declarado do Carlos. Não há no contexto nenhum número de ocorrências, perda financeira ou meta associada a desvio de carga, então não há base para atribuir "significativo" ou acima. O alcance é a frota inteira, o que sustenta o valor médio em vez de baixo.
- **Confidence justificada: 50% (intuição).** Nenhum dado de frequência ou custo de desvio de carga na Conecta Cargas foi fornecido, e não há benchmark de domínio disponível para taxa de desvio em frota de 140 veículos — sem referência disponível. Soma-se a dependência de hardware IoT com lead time de 60 dias, cujo custo de integração ainda não foi validado com o fornecedor. Para subir a 80%: levantar o histórico de 12 meses de ocorrências de desvio e não conformidade de entrega, e confirmar quantos dos 140 veículos possuem baú compatível com o sensor.

**US02 — Manutenção Preditiva por Telemetria**
- **Impact justificado: 1 (médio).** O ganho é redução de custo de manutenção reativa, não redução de sinistros por velocidade — não move o OKR. Atinge os 140 veículos, mas o efeito por veículo é diluído: só se materializa nos veículos que efetivamente entrariam em falha no período. Além disso, o critério de aceitação exige accuracy de 80% medida em produção após 60 dias, ou seja, o valor declarado não é verificável dentro do MVP.
- **Confidence justificada: 50% (intuição).** Três evidências ausentes: (a) não existe histórico de manutenção estruturado citado no contexto para treinar o modelo preditivo; (b) a meta de 80% de accuracy não tem base — não há benchmark disponível para predição de falha em frota com esse volume de dados, sem referência disponível; (c) a integração com a agenda da oficina parceira é dependência de terceiro não avaliada. Para subir a 80%: auditar a base histórica de manutenção (volume, qualidade e rótulos de falha) e obter compromisso técnico da oficina sobre a API de agenda.

**US09 — Sensor de Baú — Controle de Temperatura da Carga**
- **Impact justificado: 2 (significativo).** Compliance ANVISA é risco binário: uma não conformidade pode gerar autuação e perda integral da carga refrigerada, o que é um dano de magnitude maior por veículo afetado do que os itens de eficiência operacional. O valor 2 e não 3 porque atinge apenas o subconjunto refrigerado da frota, e não o OKR do Carlos.
- **Confidence justificada: 50% (intuição).** O contexto não informa quantos dos 140 veículos possuem baú refrigerado — a estimativa de 28 (20% da frota) é uma suposição declarada, não um dado, e é a variável que mais move o RICE deste item. Também não há histórico de perda de carga por desvio de temperatura nem de autuações prévias, e não há benchmark de domínio disponível — sem referência disponível. Para subir a 80%: obter a contagem exata de veículos refrigerados, o histórico de ocorrências de temperatura e o texto da exigência ANVISA aplicável, que pode impor prazo externo.

**US05 — Dashboard Base — Visão Operacional da Frota (HiPPO)**
- **Impact justificado: 0,5 (baixo).** É visibilidade, não ação: o painel não altera o comportamento do motorista nem dispara intervenção automática, portanto não move a métrica de sinistros. O input marca o item explicitamente como HiPPO — pedido verbal em reunião, sem evidência de uso operacional real — e identifica Priya (TI) como usuária mais provável, não Carlos. Um painel consultado por poucas pessoas para reunião executiva e export em PDF tem alcance e efeito operacional pequenos comparados a qualquer item que atua sobre os 140 veículos.
- **Confidence justificada: 50% (intuição).** A única evidência que sustenta o item é um pedido verbal do stakeholder, o que é intuição por definição. O próprio input registra a ausência de evidência de uso e a divergência entre quem pediu (Carlos) e quem usaria (Priya) — isso rebaixa em vez de sustentar a confiança. Para subir a 80%: entrevistar Priya, definir qual decisão operacional o painel destrava e com que frequência, e verificar se a informação já não é obtida por outro sistema.

### 5. Flags ⚠️

⚠️ **US02 — MANUTENÇÃO PREDITIVA POR TELEMETRIA:** Confidence 50%, dependência de hardware IoT não resolvida (lead time de 60 dias), dependência de terceiro (agenda da oficina parceira) e Effort de 4 pm provavelmente subestimado — a estimativa não inclui coleta e rotulagem do histórico de manutenção nem os 60 dias de observação em produção exigidos pelo critério de accuracy de 80%. → Antes de priorizar: auditar a base histórica de manutenção, confirmar a API da oficina e emitir o pedido de compra dos sensores; sem base histórica, o modelo preditivo não é estimável e o item deve sair do ranking até haver dados.

⚠️ **US03 — SCORE DE COMPORTAMENTO DO MOTORISTA:** Confidence 50% e dependência técnica não resolvida — o score completo está bloqueado pelos rastreadores v2 com acelerômetro; sem eles só existe o MVP parcial por velocidade. O Effort de 2,5 pm cobre apenas o MVP parcial mais a integração com RH; o score completo exigirá reestimativa. → Antes de priorizar: decidir formalmente se o entregável do MVP é o score parcial (só velocidade) e, em caso afirmativo, reescrever os critérios de aceitação, que hoje descrevem o score completo e não seriam atendidos pela entrega.

⚠️ **US04 — SENSOR DE ABERTURA DE BAÚ:** Confidence 50%, dependência de hardware IoT não resolvida (lead time de 60 dias) e Reach não verificado — assumiu-se que os 140 veículos possuem baú compatível, o que não está no contexto. → Antes de priorizar: levantar o histórico de ocorrências de desvio de carga (hoje inexistente como dado) e confirmar a contagem de veículos elegíveis; o item está na 3ª posição sustentado por um Reach assumido.

⚠️ **US05 — DASHBOARD BASE (HiPPO):** Confidence 50% e origem HiPPO declarada no próprio input — pedido verbal de Carlos, sem evidência de uso operacional, com usuária provável (Priya, TI) diferente do solicitante. É o item de menor RICE e menor WSJF do backlog. → Antes de priorizar: validar com Priya qual decisão o painel destrava; se não houver decisão operacional identificável, o item não deve entrar no MVP, independentemente da origem do pedido.

⚠️ **US09 — SENSOR DE BAÚ — CONTROLE DE TEMPERATURA:** Confidence 50%, dependência de hardware IoT não resolvida (lead time de 60 dias) e Reach estimado sem dado — os 28 veículos refrigerados são uma suposição de 20% da frota, não uma informação do contexto. Esta é a variável mais sensível do ranking: acima de ~65 veículos refrigerados, o item ultrapassa US04 no RICE e sobe para a 3ª posição. Há ainda risco de prazo externo não capturado — exigência ANVISA pode ter data-limite regulatória, o que elevaria o Time Criticality de 7 para 10 e o WSJF de 3,0 para 3,5. → Antes de priorizar: obter a contagem real de baús refrigerados e o texto da exigência ANVISA aplicável, com sua data de vigência.

⚠️ **DEPENDÊNCIA DE HARDWARE COMUM A US02, US04 E US09:** os três dependem do mesmo lead time de 60 dias para sensores IoT, e nenhum item do backlog cobre a aquisição, homologação e instalação desse hardware nos 140 veículos. Não é uma dependência entre itens rankeados, é uma dependência ausente do backlog — o trabalho existe, mas não está estimado em nenhum Effort. → Antes de priorizar qualquer um dos três: criar o item de aquisição e instalação de hardware, estimá-lo, e disparar o pedido de compra imediatamente, já que os 60 dias correm em paralelo ao desenvolvimento e não competem por capacidade do time.

⚠️ **DEPENDÊNCIA POSSÍVEL ENTRE US01/US03 E US05 (rankeado por último):** US01 exige "log de eventos com motorista, hora, localização e velocidade registrada" e US03 exige "relatório semanal por motorista e ranking da frota" — ambos precisam de uma superfície de visualização que o backlog só descreve em US05, que está na 6ª e última posição. Se a decisão for reaproveitar o painel do US05 como essa superfície, o ranking se torna inconsistente: US01 (1º) dependeria de um item em 6º. → Antes de iniciar US01: decidir se log e relatório serão entregues como telas próprias dentro do escopo de US01/US03 (caso em que o Effort de ambos sobe e US05 permanece em último) ou como parte do US05 (caso em que um subconjunto mínimo do painel precisa subir junto com US01). O ranking acima assume a primeira opção.
