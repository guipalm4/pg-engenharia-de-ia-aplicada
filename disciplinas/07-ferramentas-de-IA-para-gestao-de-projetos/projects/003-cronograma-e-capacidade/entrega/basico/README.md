# Missão #03 — Cronograma e Alocação Assistidos por IA · nível Básico

> Cronograma de 6 sprints do MVP do RouteWise gerado pelo Scheduling Prompt sobre o backlog
> priorizado do Módulo 2, as dependências implícitas que o modelo inferiu, e duas das três
> simulações what-if com a decisão tomada.

## Configuração

| Item | Valor |
| --- | --- |
| Prompt V1 | [`scheduling-v1`](../../prompts/scheduling-v1.md) — Scheduling Prompt preenchido com o contexto do RouteWise |
| Insumo | [`inputs/scheduling-routewise-input.md`](../../inputs/scheduling-routewise-input.md) — time, backlog priorizado, dependências e restrições |
| Outputs | [cronograma](../../outputs/cronograma-sprints-v1.md) · [cenários what-if](../../outputs/whatif-cenarios-v1.md) |
| Modelo | `claude-opus-5`, subagente de contexto limpo |
| Data | 07/09/2026 |

O material pede Google AI Studio a temperatura 0,3. `temperature` não existe nos modelos Claude
atuais; a execução foi feita em subagente de contexto limpo.

## Parte 1 — Contexto do time

| Papel | Foco técnico | Disponibilidade para dev |
| --- | --- | --- |
| Dev Sênior Backend | integrações IoT, telemetria, APIs | 26h/sprint |
| Dev Pleno Fullstack 1 | backend services, dados | 26h/sprint |
| Dev Pleno Fullstack 2 | APIs, integrações | 26h/sprint |
| Dev Pleno Frontend | app mobile, notificações push | 26h/sprint |
| Dev Pleno Backend 2 | modelo preditivo, analytics | 26h/sprint |
| Dev Júnior QA | testes, documentação, suporte | 26h/sprint |

**Sprint de 2 semanas, 6 sprints planejados (12 semanas).**

Capacidade nominal: 6 × 26h = 156h/sprint ≈ **35 SP/sprint** (≈ 4,5h por SP).
Capacidade real a 65%: 35 × 0,65 = 22,75 → **22 SP/sprint**, ou ≈ 3,8 SP por pessoa por sprint.
Sprint 4 absorve os 2 feriados do período (10 dias úteis → 8): 22,75 × 0,8 = 18,2 → **18 SP**.

## Parte 2 — Cronograma gerado

Itens `EN-xx` são trabalho habilitador — rollout, mocks, pipeline de dados, homologação. Não constam
do backlog priorizado, mas consomem capacidade e por isso aparecem no cronograma.

| Sprint | Semanas | História | Responsáveis | Effort | Capacidade |
| --- | --- | --- | --- | --- | --- |
| Sprint 0 | 0 | EN-00 Configuração do ambiente de staging | Dev Pleno Fullstack 2 + Dev Júnior QA | 5 SP | 5/22 SP |
| Sprint 1 | 1-2 | US-01 Alertas de Velocidade em Tempo Real (staging) | Dev Sênior Backend (principal) + Dev Pleno Fullstack 1 + Dev Pleno Frontend + Dev Júnior QA | 13 SP | 20/22 SP |
| Sprint 1 | 1-2 | EN-01 Pedido de compra do hardware IoT + contrato de interface dos sensores | Dev Pleno Fullstack 2 | 3 SP | |
| Sprint 1 | 1-2 | EN-02 Mock/simulador dos sensores IoT | Dev Pleno Backend 2 | 4 SP | |
| Sprint 2 | 3-4 | EN-03 Rollout de US-01 em produção nos 140 veículos + hardening | Dev Sênior Backend + Dev Júnior QA | 6 SP | 20/22 SP |
| Sprint 2 | 3-4 | EN-04 Pipeline de histórico de telemetria | Dev Pleno Fullstack 1 + Dev Pleno Backend 2 | 7 SP | |
| Sprint 2 | 3-4 | EN-05 Camada de ingestão de sensores contra mock | Dev Pleno Fullstack 2 + Dev Pleno Frontend | 7 SP | |
| Sprint 3 | 5-6 | US-03 Score de Comportamento do Motorista (MVP parcial, só velocidade) | Dev Pleno Backend 2 (principal) + Dev Pleno Fullstack 1 + Dev Pleno Frontend | 8 SP | 16/22 SP |
| Sprint 3 | 5-6 | EN-06 Preparação e execução da demo de US-01 para Carlos | Dev Sênior Backend + Dev Júnior QA | 5 SP | |
| Sprint 3 | 5-6 | EN-07 Contrato de integração e plano de homologação dos sensores | Dev Pleno Fullstack 2 | 3 SP | |
| Sprint 4 | 7-8 | EN-08 Software de US-04 contra mock (residual de US-04: 13 → 8 SP) | Dev Pleno Fullstack 2 + Dev Pleno Frontend | 5 SP | 17/18 SP |
| Sprint 4 | 7-8 | EN-09 Software de US-09 contra mock (residual de US-09: 21 → 15 SP) | Dev Sênior Backend + Dev Pleno Fullstack 1 | 6 SP | |
| Sprint 4 | 7-8 | EN-10 Spike de viabilidade de US-02 sobre a telemetria acumulada | Dev Pleno Backend 2 | 3 SP | |
| Sprint 4 | 7-8 | EN-11 Automação dos testes de integração IoT contra mock | Dev Júnior QA | 3 SP | |
| Sprint 5 | 9-10 | US-04 Sensor de Abertura de Baú (8 SP residuais) | Dev Pleno Fullstack 2 (principal) + Dev Pleno Frontend + Dev Júnior QA | 8 SP | 19/22 SP |
| Sprint 5 | 9-10 | US-09 Controle de Temperatura, parte 1: integração física e calibração | Dev Sênior Backend (principal) + Dev Pleno Fullstack 1 + Dev Pleno Backend 2 | 11 SP | |
| Sprint 6 | 11-12 | US-09 Controle de Temperatura, parte 2: alertas, app e relatórios | Dev Sênior Backend + Dev Pleno Frontend + Dev Pleno Fullstack 1 | 4 SP | 18/22 SP |
| Sprint 6 | 11-12 | EN-12 Homologação de campo em lote piloto de 20 veículos + treinamento | Dev Júnior QA + Dev Pleno Fullstack 2 | 8 SP | |
| Sprint 6 | 11-12 | EN-13 Buffer de retrabalho de integração física | Dev Pleno Backend 2 + folga do time | 6 SP | |

Marcos: **US-01 em produção na semana 4** (restrição do input) e **demo operacional para Carlos na
semana 6** (marco obrigatório).

**Fora do escopo do MVP**, sinalizado pelo modelo:

- **US-02 Manutenção Preditiva (34 SP)** — excede a capacidade real de qualquer sprint isolada
  (22 SP), só pode iniciar na semana 9 pelo mesmo bloqueio de hardware, e o requisito de acurácia
  mínima de 80% é risco técnico sem baseline conhecido.
- **US-03 score completo (frenagem e aceleração)** — depende do acelerômetro, hardware que não
  consta do pedido de compra da semana 1; o lead time de 60 dias colocaria a entrega além da semana 12.

### Dependências implícitas identificadas pelo modelo

Nenhuma das seis estava declarada no backlog nem na seção de dependências conhecidas do input.

**D1 — US-04 e US-09 são dependência candidata mútua.** Compartilham gateway do baú, firmware,
protocolo de ingestão e rotina de calibração. A primeira das duas a ser integrada paga o custo de
estabilizar o gateway; a segunda herda esse trabalho. Por isso US-04 (13 SP, leitura binária) foi
alocada antes de US-09 (21 SP, exige calibração) no Sprint 5.

**Plano de validação:** confirmar com o Dev Sênior Backend e o fornecedor, na semana 1 (junto ao EN-01),
se gateway, firmware e protocolo são de fato os mesmos nos dois sensores. Se não forem, EN-08 e EN-09
deixam de ser trabalho comum e o Sprint 4 estoura.

**D2 — US-02 depende do mesmo pipeline de telemetria de US-01.** Qualquer mudança de esquema no
pipeline durante o rollout do Sprint 2 propaga para o treino do modelo preditivo.

**Plano de validação:** revisar o esquema do pipeline com o Dev Pleno Fullstack 1 e o Dev Pleno
Backend 2 ao fechar EN-04 (Sprint 2), e congelar o contrato de esquema antes do rollout do Sprint 2.

**D3 — US-02, US-09 e US-04 dependem do mesmo fornecedor.** Não são três riscos independentes: é um
risco só com três consequências, sem segunda fonte homologada.

**Plano de validação:** perguntar a compras, na semana 1, se existe segunda fonte homologável e se o
pedido tem cláusula de atraso. Homologar a alternativa nos Sprints 2-3, mesmo sem comprar.

**D4 — US-09 e US-04 dependem da mesma camada de ingestão de sensores** (EN-05/EN-08/EN-09),
construída uma única vez contra mock.

**Plano de validação:** validar com o Dev Pleno Fullstack 2, ao desenhar EN-05 (Sprint 2), se um
contrato de API único cobre temperatura e abertura. Se não cobrir, EN-08 e EN-09 dobram de tamanho.

**D5 — US-02 e US-03 dependem da mesma pessoa.** Dev Pleno Backend 2 é o único perfil de modelo
preditivo/analytics do time. Dependência de pessoa, não de código.

**Plano de validação:** confirmar com o Dev Pleno Backend 2 quem consegue assumir US-03 na ausência
dele, e instituir o pareamento em EN-04 (Sprint 2).

**D6 — US-01, US-09 e a integração IoT dependem do Dev Sênior Backend.** Segunda concentração de
pessoa-chave, na trilha crítica de telemetria.

**Plano de validação:** confirmar férias e compromissos dele para as semanas 9-10 antes do Sprint 1, e
ativar o pareamento com o Dev Pleno Fullstack 1 na ingestão IoT desde o Sprint 1.

> São seis, e a *Entrega Esperada* pede até cinco. Ficaram as seis porque D5 e D6 são a mesma
> classe — pessoa-chave sem backup — em duas trilhas independentes, e fundi-las num item só apagaria
> a distinção que o Cenário 2 usa: a ausência do Dev Sênior custa conhecimento nas semanas 5-6 e
> custa data nas semanas 9-10.

## Parte 3 — Simulações what-if

As duas primeiras das três simulações executadas. A terceira, a comparação entre elas e a armadilha
do cronograma assistido estão em [`entrega/intermediario/`](../intermediario/README.md).


### Cenário 1 — Atraso de 4 semanas no hardware IoT (entrega na semana 13)

#### Opções

**Opção A — Estender o projeto em 2 sprints (fim na semana 16).**
Sprints 5 e 6 viram sprints de trabalho reduzido ou pausa parcial; a integração física acontece nos Sprints 7 e 8 (semanas 13-16).

- A favor: entrega os 55 SP planejados; nenhuma conversa de corte de escopo com Carlos; preserva a lógica original do cronograma.
- Contra: paga 6 pessoas por 4 semanas (≈ 44 SP, 24 pessoa-semanas) para produzir zero avanço no OKR nesse intervalo; empurra o marco final para 4 semanas depois do prometido; e assume que a nova data do fornecedor é confiável — o mesmo fornecedor já errou a estimativa em 47% (60 → 88 dias). Se atrasar de novo, a extensão se repete.

**Opção B — Segunda fonte / lote piloto expresso.**
Homologar um fornecedor alternativo nos Sprints 3 e 4 e comprar um lote piloto de 10 a 20 sensores para chegada na semana 9-10.

- A favor: permite integrar e homologar US-04 e US-09 em piloto dentro da janela original; quebra o ponto único de falha, que é o defeito estrutural apontado na seção de dependências implícitas; o lote piloto é barato em relação ao custo de 4 semanas de time parado.
- Contra: preço unitário e frete maiores; risco de divergência de firmware e protocolo entre fornecedores, o que pode invalidar parte de EN-05/EN-08/EN-09 construídos contra o mock do fornecedor original; e a homologação de um novo fornecedor consome capacidade do Dev Pleno Fullstack 2 nos Sprints 3 e 4. Além disso, 20 sensores não cobrem 140 veículos — entrega piloto, não rollout.

**Opção C — Reescopar o MVP para a semana 12 e criar uma fase 2 de integração começando na semana 13.**
MVP fecha na semana 12 com US-01 + US-03 em produção e com US-04 e US-09 **prontas do lado de software, homologadas contra mock e com plano de integração escrito**. Sprints 5 e 6 são realocados para: concluir 100% do software de US-04 e US-09 contra mock (≈ 12 SP dos 23 SP residuais), amadurecer US-03 com ajustes pedidos na demo, executar o spike de US-02 sobre a telemetria acumulada (que na semana 10 já tem 6 semanas de histórico, o dobro do mínimo exigido), e emitir o pedido do acelerômetro que destrava o score completo de US-03 na fase 2.

- A favor: mantém a data prometida; converte capacidade ociosa em redução de risco futuro; a fase 2 (semanas 13-16) começa com integração pura, sem desenvolvimento pendente; e o pedido do acelerômetro emitido agora corre em paralelo ao atraso do fornecedor em vez de depois dele.
- Contra: Carlos recebe um MVP com 21 dos 55 SP de backlog priorizado — a conversa de expectativa é obrigatória e desconfortável; e exige um compromisso formal de orçamento para a fase 2, que hoje não existe.

#### Recomendação

**Recomendo a Opção C, com a Opção B executada em paralelo como hedge, e rejeito a Opção A.**

O raciocínio é o seguinte, na ordem em que os dados decidem:

1. **A Opção A é a mais cara e a que menos protege o que importa.** Estender 4 semanas custa 24 pessoa-semanas para entregar escopo que não move o OKR de setembro. E a premissa da extensão — que a semana 13 é confiável — é justamente a premissa que acabou de falhar: o fornecedor errou a própria estimativa em 28 dias sobre 60. Comprometer a data final do projeto com uma segunda estimativa do mesmo fornecedor é repetir o erro de planejamento.

2. **O dado que decide é qual história sustenta o OKR.** US-01 está em produção desde a semana 4 e US-03 desde a semana 6. Sinistros por excesso de velocidade são atacados por essas duas, e sobram mais de 20 semanas de medição até setembro. As três histórias bloqueadas endereçam controle de carga e manutenção — valor real de negócio, prioridade RICE/WSJF legítima, mas nenhum efeito sobre o indicador contratado. Portanto o atraso não é uma emergência de OKR, é uma renegociação de escopo.

3. **A Opção B não substitui a C, complementa.** Homologar segunda fonte tem custo baixo e valor permanente: mesmo que o lote piloto não chegue a tempo, o projeto termina com duas fontes homologadas em vez de uma, o que era o defeito estrutural do plano original. Se o piloto chegar na semana 9-10, US-04 volta ao MVP como escopo condicional e a recomendação melhora sem ter sido reescrita.

4. **Ação imediata na semana em que o atraso é comunicado:** acionar a cláusula contratual de atraso (multa ou compensação) e exigir data com penalidade; iniciar a homologação da segunda fonte no Sprint 3; emitir o pedido do acelerômetro; e reunir Carlos para reancorar o MVP em US-01 + US-03 com fase 2 acordada para as semanas 13-16.

### Cenário 2 — Afastamento do Dev Sênior Backend nas semanas 5-6 (Sprint 3)

#### Opções

**Opção A — Antecipar a demo para o fim da semana 4 (Sprint 2), com ele ainda presente.**

- A favor: preserva o dono técnico na apresentação; elimina o risco de condução; e antecipa feedback de Carlos em 2 semanas.
- Contra: US-01 sobe em produção nos 140 veículos exatamente na semana 4, então a demo mostraria dias de operação, não semanas — amostra de alertas pequena demais para evidenciar tendência de sinistros, que é o que interessa a um Diretor de Operações. Além disso, antecipar um marco contratado exige aceite do stakeholder e consome capacidade do Sprint 2, que está em 20/22 SP. Trocaria um risco de pessoa por um risco de conteúdo — e conteúdo fraco em demo de OKR é o dano mais caro dos dois.

**Opção B — Transferência de conhecimento e troca de condutor, mantendo a data.**
Na semana 4 (Sprint 2), o Sênior produz runbook operacional de US-01, roteiro de demo documentado e uma gravação de apoio; Dev Pleno Fullstack 1 (que já pareia com ele na ingestão IoT desde o Sprint 1) assume a condução técnica e o Dev Júnior QA prepara o material de dados da demo.

- A favor: mantém a demo na semana 6 com 2 a 4 semanas de dado real, que é o argumento forte diante de Carlos; ativa o pareamento já previsto como contorno de pessoa-chave, então o custo marginal é baixo; e o runbook resolve simultaneamente o risco de incidente em produção durante a ausência. O custo (≈ 3 SP no Sprint 2) cabe: o Sprint 2 tem 2 SP de folga e EN-05 pode ceder 1 SP sem afetar o Sprint 4.
- Contra: consome folga do Sprint 2 e há risco de a demo ser conduzida com menos profundidade técnica em perguntas fora do roteiro. Se Carlos fizer uma pergunta de arquitetura, a resposta vira follow-up e não resposta imediata.

**Opção C — Manter a data e proteger a folga adiando EN-07 (3 SP) para o Sprint 5.**

- A favor: recompõe a folga do Sprint 3 de 2,2 para 5,2 SP, cobrindo imprevistos durante a ausência.
- Contra: EN-07 é o contrato de integração e o plano de homologação dos sensores; empurrá-lo para o Sprint 5 significa escrever o plano de homologação **depois** de o hardware chegar, o que atrasa a integração no caminho crítico. Mover para o Sprint 4 também não serve: ele já opera com 17/18 SP por causa dos 2 feriados.

#### Recomendação

**Recomendo a Opção B, mantendo o marco na semana 6, e rejeito A e C.**

O que decide é a leitura correta do impacto: **a restrição aqui é de conhecimento, não de capacidade.** Os números mostram isso sem ambiguidade — a carga do Sprint 3 é 16 SP e a capacidade residual sem o Sênior é 18,2 SP. Não falta gente para fazer o trabalho; falta a pessoa que sabe apresentar e sustentar tecnicamente o sistema que já está em produção. Opções que mexem em data (A) ou em escopo (C) resolvem um problema de capacidade que não existe, e criam um problema novo: A degrada a qualidade do dado mostrado na demo, e C tira do caminho crítico justamente o plano de homologação dos sensores.

Três desdobramentos concretos:

1. **Semana 4, no Sprint 2:** runbook de US-01, roteiro de demo e sessão de transferência com Dev Pleno Fullstack 1. Orçar 3 SP, retirando 1 SP de EN-05 e usando os 2 SP de folga.
2. **Semana 6:** a demo é conduzida por Dev Pleno Fullstack 1 com apoio do Dev Júnior QA nos dados. Combinar com Carlos, antes, que perguntas de arquitetura terão resposta escrita na semana 7 — expectativa alinhada não vira frustração.
3. **Gatilho de escalonamento:** se o retorno na semana 7 não se confirmar, o cenário deixa de ser gerenciável por transferência de conhecimento. Nesse caso é preciso decidir na semana 7 (e não na semana 9) entre contratar apoio sênior de integração IoT ou remover US-09 do MVP, porque ele é o responsável principal pelos 11 SP de integração física do Sprint 5, que estão no caminho crítico sem folga.
