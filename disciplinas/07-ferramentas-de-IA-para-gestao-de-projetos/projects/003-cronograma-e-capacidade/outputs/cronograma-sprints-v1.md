---
versao: v1
prompt: scheduling-v1.md
input: scheduling-routewise-input.md
escopo: cronograma de sprints
modelo: claude-opus-5
gerado_em: 07/09/2026
execucao: subagente de contexto limpo
---

### 1. Cronograma por Sprint

**Base de capacidade usada em todo o cronograma:**
- Capacidade nominal: 35 SP/sprint (6 pessoas × 26h = 156h/sprint ≈ 4,5h por SP).
- Capacidade real a 65%: **22 SP/sprint** (35 × 0,65 = 22,75) ≈ **3,8 SP por pessoa por sprint**.
- Feriados: os 2 dias do período foram alocados no Sprint 4 (10 dias úteis → 8), que opera com **18 SP** (22,75 × 0,8 = 18,2) ≈ 3,0 SP por pessoa.
- Itens `EN-xx` são trabalho habilitador (não constam do backlog priorizado): rollout, mocks, pipeline de dados, homologação. Eles consomem capacidade e por isso aparecem no cronograma.

**Sprint 0 (Pré-Sprint — Semana 0):**
- História: EN-00 Configuração do ambiente de staging (pré-requisito obrigatório do Sprint 1) — Responsável: Dev Pleno Fullstack 2 + Dev Júnior QA — Effort: 5 SP
- Capacidade utilizada: 5/35 SP (5/22 SP na capacidade real)

**Sprint 1 (Semanas 1-2):**
- História: US-01 Alertas de Velocidade em Tempo Real (entrega em staging) — Responsável: Dev Sênior Backend (principal, ingestão GPS e motor de regras) + Dev Pleno Fullstack 1 (serviços de dados) + Dev Pleno Frontend (push no app) + Dev Júnior QA (testes) — Effort: 13 SP
- História: EN-01 Pedido de compra do hardware IoT na semana 1 + fechamento do contrato de interface dos sensores — Responsável: Dev Pleno Fullstack 2 — Effort: 3 SP
- História: EN-02 Mock/simulador dos sensores IoT (temperatura e abertura) — Responsável: Dev Pleno Backend 2 — Effort: 4 SP
- Capacidade utilizada: 20/35 SP (20/22 SP na capacidade real)
- Verificação de alocação: US-01 dividida entre 4 pessoas = 3,25 SP/pessoa, abaixo do teto de 3,8 SP/pessoa. Ninguém está em duas histórias.

**Sprint 2 (Semanas 3-4):**
- História: EN-03 Rollout de US-01 em produção nos 140 veículos + hardening (inicia a janela de 30 dias de telemetria exigida por US-02) — Responsável: Dev Sênior Backend + Dev Júnior QA — Effort: 6 SP
- História: EN-04 Pipeline de histórico de telemetria (base de dados de velocidade para US-03 e US-02) — Responsável: Dev Pleno Fullstack 1 + Dev Pleno Backend 2 — Effort: 7 SP
- História: EN-05 Camada de ingestão de sensores contra mock (componente comum de US-04 e US-09) — Responsável: Dev Pleno Fullstack 2 + Dev Pleno Frontend — Effort: 7 SP
- Capacidade utilizada: 20/35 SP (20/22 SP na capacidade real)
- Marco atingido: **US-01 em produção na semana 4** — cumpre a restrição de não deslizar além do Sprint 2.

**Sprint 3 (Semanas 5-6):**
- História: US-03 Score de Comportamento do Motorista (MVP parcial, apenas por velocidade) — Responsável: Dev Pleno Backend 2 (principal) + Dev Pleno Fullstack 1 + Dev Pleno Frontend — Effort: 8 SP
- História: EN-06 Preparação e execução da demo operacional de US-01 para Carlos (semana 6) — Responsável: Dev Sênior Backend + Dev Júnior QA — Effort: 5 SP
- História: EN-07 Contrato de integração e plano de homologação de campo dos sensores IoT — Responsável: Dev Pleno Fullstack 2 — Effort: 3 SP
- Capacidade utilizada: 16/35 SP (16/22 SP na capacidade real)
- **Marco obrigatório cumprido: demo operacional de US-01 na semana 6.** A folga de 6 SP é proposital: a demo usa dados reais de 2 semanas de produção e qualquer ajuste pedido por Carlos precisa caber na própria sprint.
- **Alocação em sprint posterior por dependência:** US-03 só entra aqui porque depende de US-01 **em produção** (concluído no Sprint 2). Não é limitação de capacidade — havia espaço no Sprint 2.

**Sprint 4 (Semanas 7-8) — sprint com os 2 feriados, capacidade 18 SP:**
- História: EN-08 Camada de software de US-04 desenvolvida contra mock (reduz o resíduo de US-04 de 13 → 8 SP) — Responsável: Dev Pleno Fullstack 2 + Dev Pleno Frontend — Effort: 5 SP
- História: EN-09 Camada de software de US-09 desenvolvida contra mock (reduz o resíduo de US-09 de 21 → 15 SP) — Responsável: Dev Sênior Backend + Dev Pleno Fullstack 1 — Effort: 6 SP
- História: EN-10 Spike de viabilidade de US-02 sobre a telemetria acumulada (baseline de acurácia do modelo) — Responsável: Dev Pleno Backend 2 — Effort: 3 SP
- História: EN-11 Automação dos testes de integração IoT contra mock + documentação — Responsável: Dev Júnior QA — Effort: 3 SP
- Capacidade utilizada: 17/35 SP (17/18 SP na capacidade real desta sprint)
- **Nenhuma história do backlog priorizado é alocável aqui:** US-09, US-02 e US-04 estão bloqueadas por hardware até a semana 9. Toda a sprint é antecipação de risco.

**Sprint 5 (Semanas 9-10) — hardware IoT recebido na semana 9:**
- História: US-04 Sensor de Abertura de Baú (8 SP residuais dos 13 originais; 5 SP antecipados no Sprint 4) — Responsável: Dev Pleno Fullstack 2 (principal) + Dev Pleno Frontend + Dev Júnior QA — Effort: 8 SP
- História: US-09 Sensor de Baú — Controle de Temperatura da Carga, parte 1: integração física, ingestão e calibração (11 dos 15 SP residuais) — Responsável: Dev Sênior Backend (principal) + Dev Pleno Fullstack 1 + Dev Pleno Backend 2 — Effort: 11 SP
- Capacidade utilizada: 19/35 SP (19/22 SP na capacidade real)
- **Alocadas em sprint posterior por dependência:** US-04 e US-09 estavam prontas do lado de software desde o Sprint 4 e só esperavam a chegada física do hardware (lead time de 60 dias a partir da semana 1).
- Verificação de alocação: nenhuma pessoa está nas duas histórias; a carga máxima individual é 3,7 SP, abaixo dos 3,8 SP.

**Sprint 6 (Semanas 11-12):**
- História: US-09 Sensor de Baú — Temperatura, parte 2: alertas, app e relatórios (4 SP residuais) — Responsável: Dev Sênior Backend + Dev Pleno Frontend + Dev Pleno Fullstack 1 — Effort: 4 SP
- História: EN-12 Homologação de campo de US-04 e US-09 em lote piloto de 20 veículos + treinamento da operação — Responsável: Dev Júnior QA + Dev Pleno Fullstack 2 — Effort: 8 SP
- História: EN-13 Buffer reservado para retrabalho de integração física (não alocável a escopo novo) — Responsável: Dev Pleno Backend 2 + folga do time — Effort: 6 SP
- Capacidade utilizada: 18/35 SP (18/22 SP na capacidade real)

**Fora do escopo do MVP:**

- **US-02 Manutenção Preditiva por Telemetria (34 SP) — Fora do escopo do MVP.** Três motivos somados, não um só:
  1. 34 SP excedem a capacidade real de qualquer sprint isolada (22 SP), então exigiria no mínimo duas sprints inteiras dedicadas.
  2. Só pode iniciar na semana 9 (mesmo bloqueio de hardware de US-09/US-04). Restam os Sprints 5 e 6, com 44 SP de capacidade real, dos quais 34 SP já estão comprometidos com US-04 (13) e US-09 (21) — ambos com prioridade RICE/WSJF superior. Sobrariam 10 SP para uma história de 34.
  3. O requisito de acurácia mínima de 80% é risco técnico aberto, sem baseline conhecido. Comprometer data com um item cuja viabilidade não foi provada contamina o marco do Sprint 3 e a homologação do Sprint 6.
  Contorno já embutido no cronograma: EN-04 acumula o histórico de telemetria e EN-10 mede o baseline de acurácia, de modo que US-02 entre na fase 2 já com dado, não com hipótese.

- **US-03 score completo (frenagem e aceleração) — Fora do escopo do MVP.** Depende de acelerômetro, hardware que **não consta do pedido de compra da semana 1** (o pedido cobre sensores de temperatura e de abertura de baú, do mesmo fornecedor). Mesmo que o pedido fosse feito hoje, o lead time de 60 dias colocaria a entrega além da semana 12. Entregue no MVP apenas o score parcial por velocidade (US-03, 8 SP).

---

### 2. Dependências Mapeadas

**Dependências explícitas (declaradas no input):**
- [US-03] depende de [US-01] porque reutiliza o pipeline de dados de velocidade e o motor de ingestão GPS; exige US-01 **em produção**, não apenas em staging — por isso só entra no Sprint 3 (US-01 sobe em produção na semana 4).
- [US-09] depende de [entrega do sensor IoT de temperatura] com data estimada de resolução na **semana 9** (lead time de 60 dias a partir do pedido na semana 1).
- [US-04] depende de [entrega do sensor IoT de abertura de baú — mesmo fornecedor de US-09] com data estimada de resolução na **semana 9**.
- [US-02] depende de [entrega do sensor IoT — mesmo fornecedor de US-09] com data estimada de resolução na **semana 9**.
- [US-02] depende de [US-01 em produção + 30 dias corridos de telemetria acumulada] porque o modelo preditivo precisa de série histórica para treino; com US-01 em produção na semana 4, o dado só fica disponível na **semana 8**.
- [US-03 score completo] depende de [acelerômetro] — hardware não pedido; sem data de resolução.
- [Sprint 1] depende de [ambiente de staging configurado] com data estimada de resolução na **semana 0** (pré-sprint).
- [Cadeia inteira de hardware] depende de [pedido de compra emitido na semana 1] — atraso de 1 semana no pedido desloca a semana 9 em 1 semana.

**Dependências implícitas inferidas do backlog (componentes técnicos compartilhados):**
- [US-04] e [US-09] são **dependência candidata mútua** porque compartilham o mesmo componente físico e lógico: gateway do baú, firmware, protocolo de ingestão e rotina de calibração. Consequência de cronograma: a primeira das duas a ser integrada paga o custo de estabilizar o gateway; a segunda herda esse trabalho. Por isso US-04 (13 SP, mais simples) foi alocada antes de US-09 (21 SP) no Sprint 5 — inverter a ordem colocaria o aprendizado de integração dentro do item maior e mais tardio.
- [US-02] depende do mesmo pipeline de telemetria de [US-01] — **dependência candidata**: qualquer mudança de esquema no pipeline de US-01 durante o rollout do Sprint 2 propaga para o treino do modelo.
- [US-02], [US-09] e [US-04] dependem do **mesmo fornecedor**: ponto único de falha. Não são três riscos independentes, é um risco só com três consequências — é isso que torna o cenário de atraso do fornecedor tão caro.
- [US-09] e [US-04] dependem da mesma camada de ingestão de sensores (EN-05/EN-08/EN-09), construída uma única vez contra mock.
- [US-02] e [US-03] dependem da mesma pessoa: **Dev Pleno Backend 2** é o único perfil de modelo preditivo/analytics do time. Dependência de pessoa, não de código.
- [US-01], [US-09] e a integração IoT dependem do **Dev Sênior Backend** — segunda concentração de pessoa-chave, na trilha crítica de telemetria.

---

### 3. Caminho Crítico

Existem duas cadeias no projeto, e a que define a data final **não** é a do OKR:

**Cadeia A — valor de OKR (folgada):**
Staging (semana 0) → US-01 em staging (Sprint 1, semana 2) → US-01 em produção (Sprint 2, semana 4) → demo para Carlos (Sprint 3, semana 6) → US-03 MVP parcial (Sprint 3, semana 6).
Folga: 6 semanas até o fim do projeto. US-01 termina 8 semanas antes do fim do MVP.

**Cadeia B — CAMINHO CRÍTICO (define a data final do MVP):**
**Pedido de compra do hardware (semana 1) → lead time de 60 dias (semanas 1-8) → recebimento (semana 9) → integração física e calibração do gateway do baú, US-04 (Sprint 5, semanas 9-10) → US-09 partes 1 e 2 (Sprints 5-6, semanas 9-12) → homologação de campo em 20 veículos (Sprint 6, semana 12).**

Consequências práticas:
- **Zero folga entre a semana 9 e a semana 12.** Qualquer dia perdido nessa janela empurra a data final dia a dia, porque não há sprint depois do 6 para absorver.
- O elo mais frágil da cadeia não está no time: 8 das 12 semanas do caminho crítico são lead time de fornecedor, sobre o qual o projeto não tem controle de execução, apenas de contrato.
- Atrasar US-01 **não** atrasa o MVP (6 semanas de folga), mas viola o marco contratado com Carlos e o OKR. São dois tipos de dano diferentes: US-01 é crítico de compromisso, US-09 é crítico de data.
- A antecipação de software feita nos Sprints 2 e 4 (EN-05, EN-08, EN-09) retirou 11 SP do caminho crítico, encurtando-o de 34 SP pós-hardware para 23 SP. Sem essa antecipação, o MVP não fecharia em 12 semanas.

---

### 4. Flags de Risco

**[FORNECEDOR ÚNICO DE HARDWARE IoT]:** US-09, US-04 e US-02 dependem do mesmo fornecedor, com lead time de 60 dias e sem segunda fonte homologada. → Um atraso de 2 semanas na entrega consome integralmente o buffer do Sprint 6 (EN-13, 6 SP) e adia a homologação de campo; um atraso de 4 semanas ou mais joga US-09 e US-04 para fora da janela de 12 semanas, reduzindo o MVP entregue de 55 SP para 21 SP (US-01 + US-03).

**[LEAD TIME NO CAMINHO CRÍTICO]:** 8 das 12 semanas do caminho crítico são espera por fornecedor. → Se o pedido de compra não for emitido na semana 1 (EN-01), cada semana de atraso na emissão desloca o fim do MVP na mesma proporção, sem possibilidade de recuperação por capacidade do time.

**[US-02 — ACURÁCIA MÍNIMA DE 80% NÃO PROVADA]:** requisito técnico sem baseline conhecido, em história de 34 SP. → Já é o motivo formal de US-02 estar fora do MVP; se for reintroduzida sob pressão de stakeholder, contamina o Sprint 5 e o Sprint 6 e coloca em risco US-09, que é entregável.

**[US-02 — JANELA DE 30 DIAS DE TELEMETRIA]:** o dado de treino só existe na semana 8, e apenas se US-01 subir em produção na semana 4. → Qualquer deslize de US-01 desloca a janela de dado dia a dia; um atraso de 2 semanas em US-01 inviabiliza até um piloto de US-02 dentro do trimestre seguinte.

**[COMPONENTE COMPARTILHADO — GATEWAY DO BAÚ]:** US-04 e US-09 usam o mesmo gateway, firmware e rotina de calibração. → Um defeito de firmware descoberto na semana 9 bloqueia as duas histórias ao mesmo tempo (21 SP dos 22 SP do Sprint 5), e não uma de cada vez.

**[PESSOA-CHAVE — DEV SÊNIOR BACKEND]:** único perfil de integração IoT/telemetria; é principal em US-01 (Sprint 1), no rollout (Sprint 2), na demo (Sprint 3) e em US-09 (Sprints 5-6). → Uma ausência nas semanas 9-10 custa mais do que nas semanas 5-6: nas semanas 5-6 o sistema já está em produção e a perda é de conhecimento; nas semanas 9-10 ela para a integração física, que está no caminho crítico sem folga.

**[PESSOA-CHAVE — DEV PLENO BACKEND 2]:** único perfil de modelo preditivo/analytics; responsável por US-03 e designado por restrição para US-02. → Ausência no Sprint 3 adia US-03, único item além de US-01 que sustenta o OKR de sinistros.

**[FERIADOS NO SPRINT 4]:** 2 dias reduzem a capacidade real de 22 para 18 SP exatamente na sprint que antecipa o software de US-04 e US-09. → Se EN-08 e EN-09 não fecharem, os 11 SP antecipados voltam para o Sprint 5, que passa de 19 para 30 SP contra 22 de capacidade — estouro de 36% e perda da homologação de campo.

**[MARCO DO SPRINT 3 COM STAKEHOLDER]:** demo operacional para Carlos na semana 6. → Não é risco de capacidade (16 SP alocados contra 22 disponíveis), é risco de percepção: com apenas 2 semanas de produção, a amostra de alertas pode ser pequena demais para evidenciar tendência no OKR de sinistros.

---

### 5. Soluções de Contorno

**Para [FORNECEDOR ÚNICO / LEAD TIME DE 60 DIAS] — desenvolver contra mock, integrar contra hardware:**
Construir a camada de ingestão, o contrato de API dos sensores, o simulador de telemetria de temperatura e abertura, e os testes de integração automatizados antes de o hardware chegar (EN-02 no Sprint 1, EN-05 no Sprint 2, EN-08/EN-09/EN-11 no Sprint 4). Isso já está no cronograma e é o que retira 11 SP do caminho crítico: quando o hardware chega na semana 9, resta integração física e calibração, não desenvolvimento. Em paralelo, negociar com o fornecedor um **lote piloto antecipado de 5 a 10 sensores** para a semana 6 — com 10 unidades é possível homologar o firmware e a calibração nos Sprints 3 e 4, transformando o Sprint 5 em rollout e não em descoberta.

**Para [FORNECEDOR ÚNICO] — segunda fonte:**
Homologar um fornecedor alternativo em paralelo durante os Sprints 2 e 3, mesmo sem comprar. O custo é baixo (avaliação técnica de protocolo, cabe no Dev Pleno Fullstack 2) e converte um ponto único de falha em uma opção real de resposta caso o fornecedor principal atrase. Sem essa homologação prévia, trocar de fornecedor na semana 9 significa recomeçar o lead time do zero.

**Para [US-02 — ACURÁCIA E DADO DE TREINO]:**
Não esperar o hardware para começar a reduzir a incerteza. EN-04 (Sprint 2) monta o pipeline de histórico e EN-10 (Sprint 4) roda um spike sobre a telemetria de velocidade e GPS já acumulada, medindo o baseline de acurácia alcançável **sem** os sensores novos. O resultado do spike é a evidência que permite decidir na fase 2 entre investir nos 34 SP ou redefinir o requisito de 80%, em vez de descobrir isso já dentro da sprint de execução.

**Para [US-03 SCORE COMPLETO — ACELERÔMETRO AUSENTE]:**
Entregar o score parcial por velocidade (US-03, 8 SP) com o modelo de pontuação já desenhado para receber as dimensões de frenagem e aceleração como fatores adicionais de peso configurável. O motorista passa a ter score no app na semana 6, e a chegada do acelerômetro na fase 2 vira ajuste de configuração, não reescrita. Em paralelo, incluir o acelerômetro no pedido de compra da fase 2 imediatamente após a demo do Sprint 3, para que o lead time de 60 dias corra durante o restante do MVP.

**Para [COMPONENTE COMPARTILHADO — GATEWAY DO BAÚ]:**
Integrar US-04 (13 SP, sensor de abertura, leitura binária) antes de US-09 (21 SP, temperatura, exige calibração). US-04 funciona como prova de integração do gateway: se o firmware falhar, a falha aparece na história menor, no início do Sprint 5, com uma sprint e meia de margem para acionar o fornecedor — e não dentro do item maior, na semana 11.

**Para [PESSOA-CHAVE — DEV SÊNIOR BACKEND E DEV PLENO BACKEND 2]:**
Instituir pareamento obrigatório nas duas trilhas concentradas: Dev Pleno Fullstack 1 pareia com o Sênior na ingestão IoT desde o Sprint 1, e Dev Pleno Fullstack 1 acompanha o Backend 2 no pipeline de score (EN-04, Sprint 2). Complementar com runbook operacional de US-01 e roteiro de demo documentado ao fim do Sprint 2. O custo é de aproximadamente 2 SP por sprint em velocidade; o retorno é que nenhuma ausência de 2 semanas para o projeto.

**Para [FERIADOS NO SPRINT 4]:**
O Sprint 4 já está planejado com 17 de 18 SP e sem nenhuma história do backlog priorizado — só trabalho antecipatório. Se os feriados custarem mais do que o previsto, o item a sacrificar é EN-10 (spike de US-02, 3 SP), que não está no caminho crítico. EN-08 e EN-09 são inegociáveis, porque é a antecipação deles que faz o MVP caber em 12 semanas.

**Para [MARCO DO SPRINT 3 — AMOSTRA PEQUENA NA DEMO]:**
Subir US-01 em produção já no início do Sprint 2 (semana 3) em um piloto de 20 veículos, ampliando para 140 ao longo da semana 4. Na semana 6, a demo terá cerca de 4 semanas de dado real do piloto em vez de 2, o que permite mostrar tendência de alertas por veículo e não apenas o funcionamento da tela.
