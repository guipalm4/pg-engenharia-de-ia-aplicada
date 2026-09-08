---
versao: v1
prompt: scheduling-v1.md
input: scheduling-routewise-input.md
escopo: cenarios what-if (3 cenarios, mesma sessao)
modelo: claude-opus-5
gerado_em: 07/09/2026
execucao: subagente de contexto limpo
---

## Cenário 1 — Atraso de 4 semanas no hardware IoT (entrega na semana 13)

### 1. Impacto nas datas

O hardware sai da semana 9 para a **semana 13** — ou seja, para **depois do fim do projeto** (semana 12). O caminho crítico identificado no cronograma base (pedido → lead time → integração → homologação) deixa de caber na janela de 12 semanas.

**Sprints e histórias afetados:**

| Sprint | Situação no cronograma base | Situação com o atraso |
|---|---|---|
| Sprint 0 a 3 (sem. 0-6) | US-01, US-03, EN-01 a EN-07 | **Nenhum impacto.** Nada nessas sprints depende do fornecedor. |
| Sprint 4 (sem. 7-8) | EN-08, EN-09, EN-10, EN-11 (17/18 SP) | **Nenhum impacto de execução**, mas o trabalho antecipado contra mock passa a ficar 5 semanas parado na prateleira antes de encontrar o hardware — risco de retrabalho por drift de firmware. |
| Sprint 5 (sem. 9-10) | US-04 (8 SP) + US-09 parte 1 (11 SP) = 19 SP | **Esvaziado.** 22 SP de capacidade real sem nenhuma história do backlog priorizado alocável. |
| Sprint 6 (sem. 11-12) | US-09 parte 2 (4 SP) + EN-12 homologação (8 SP) + buffer (6 SP) | **Esvaziado.** Mais 22 SP de capacidade real ociosa. A homologação de campo perde objeto. |

**Números do impacto:**
- Backlog priorizado que sairia no MVP: 55 SP (US-01 13 + US-03 8 + US-04 13 + US-09 21).
- Backlog que ainda sai na semana 12: **21 SP** (US-01 + US-03) — 38% do planejado.
- Capacidade real ociosa: **44 SP** distribuídos nos Sprints 5 e 6 (dois terços do time por 4 semanas).
- US-04 e US-09 entram em situação de **Fora do escopo do MVP** nesta janela: não é falta de capacidade nem de prontidão de software (EN-08/EN-09 as deixam prontas na semana 8), é indisponibilidade física do insumo até a semana 13.
- US-02 continua fora do escopo, agora por um motivo a mais: sua data mínima de início vai da semana 9 para a semana 13.

**O que não é afetado — e isso é o ponto central da decisão:** o OKR de reduzir sinistros por excesso de velocidade de 7 para 5 até setembro é sustentado por US-01 e US-03, ambos entregues e em produção nas semanas 4 e 6. Nenhuma das três histórias bloqueadas (US-09 temperatura de carga, US-04 abertura de baú, US-02 manutenção preditiva) move o indicador de sinistros por velocidade. O atraso do fornecedor custa escopo, não custa OKR.

### 2. Opções de resposta

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

### 3. Recomendação

**Recomendo a Opção C, com a Opção B executada em paralelo como hedge, e rejeito a Opção A.**

O raciocínio é o seguinte, na ordem em que os dados decidem:

1. **A Opção A é a mais cara e a que menos protege o que importa.** Estender 4 semanas custa 24 pessoa-semanas para entregar escopo que não move o OKR de setembro. E a premissa da extensão — que a semana 13 é confiável — é justamente a premissa que acabou de falhar: o fornecedor errou a própria estimativa em 28 dias sobre 60. Comprometer a data final do projeto com uma segunda estimativa do mesmo fornecedor é repetir o erro de planejamento.

2. **O dado que decide é qual história sustenta o OKR.** US-01 está em produção desde a semana 4 e US-03 desde a semana 6. Sinistros por excesso de velocidade são atacados por essas duas, e sobram mais de 20 semanas de medição até setembro. As três histórias bloqueadas endereçam controle de carga e manutenção — valor real de negócio, prioridade RICE/WSJF legítima, mas nenhum efeito sobre o indicador contratado. Portanto o atraso não é uma emergência de OKR, é uma renegociação de escopo.

3. **A Opção B não substitui a C, complementa.** Homologar segunda fonte tem custo baixo e valor permanente: mesmo que o lote piloto não chegue a tempo, o projeto termina com duas fontes homologadas em vez de uma, o que era o defeito estrutural do plano original. Se o piloto chegar na semana 9-10, US-04 volta ao MVP como escopo condicional e a recomendação melhora sem ter sido reescrita.

4. **Ação imediata na semana em que o atraso é comunicado:** acionar a cláusula contratual de atraso (multa ou compensação) e exigir data com penalidade; iniciar a homologação da segunda fonte no Sprint 3; emitir o pedido do acelerômetro; e reunir Carlos para reancorar o MVP em US-01 + US-03 com fase 2 acordada para as semanas 13-16.

---

## Cenário 2 — Afastamento do Dev Sênior Backend nas semanas 5-6 (Sprint 3)

### 1. Impacto nas datas

**Sprint afetado: Sprint 3 (semanas 5-6), onde está o marco obrigatório da demo para Carlos.**

Composição do Sprint 3 no cronograma base: US-03 (8 SP), EN-06 preparação e execução da demo (5 SP), EN-07 contrato de integração dos sensores (3 SP) = 16 SP contra 22 SP de capacidade real.

**Impacto de capacidade:** a saída de uma pessoa retira 3,8 SP efetivos, levando o Sprint 3 de 22 para **18,2 SP**. A carga alocada é de 16 SP. **A carga continua cabendo — a folga cai de 6 SP para 2,2 SP.** Ou seja, este cenário **não é um problema de capacidade**, e tratá-lo como tal levaria à decisão errada.

**Impacto real, história por história:**
- **US-03 (8 SP): impacto nulo.** Responsáveis são Dev Pleno Backend 2, Dev Pleno Fullstack 1 e Dev Pleno Frontend. O Sênior não está alocado nela.
- **EN-06 demo de US-01 (5 SP): impacto alto.** Ele é o responsável principal e o autor do motor de regras e da ingestão GPS. Perde-se quem melhor explica o sistema a um Diretor de Operações e quem responde a um incidente durante a apresentação.
- **EN-07 (3 SP): impacto nulo.** Dev Pleno Fullstack 2.
- **US-01 em produção desde a semana 4: risco operacional, não de entrega.** O sistema está rodando nos 140 veículos com o autor ausente por 2 semanas. O risco é de tempo de resposta a incidente, não de prazo.
- **Sprints 4, 5 e 6: nenhum impacto direto**, desde que o retorno na semana 7 se confirme.

**O ponto de ruptura fica em outro lugar.** Se o afastamento se estender para as semanas 9-10, o dano muda de natureza: ali ele é responsável principal por US-09 parte 1 (11 SP) e a integração física está no caminho crítico sem folga. Uma ausência nas semanas 5-6 custa conhecimento; a mesma ausência nas semanas 9-10 custa data final. Vale registrar isso como gatilho de monitoramento agora.

**Marco da demo: mantido na semana 6.** A data não desliza — o que muda é quem conduz.

### 2. Opções de resposta

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

### 3. Recomendação

**Recomendo a Opção B, mantendo o marco na semana 6, e rejeito A e C.**

O que decide é a leitura correta do impacto: **a restrição aqui é de conhecimento, não de capacidade.** Os números mostram isso sem ambiguidade — a carga do Sprint 3 é 16 SP e a capacidade residual sem o Sênior é 18,2 SP. Não falta gente para fazer o trabalho; falta a pessoa que sabe apresentar e sustentar tecnicamente o sistema que já está em produção. Opções que mexem em data (A) ou em escopo (C) resolvem um problema de capacidade que não existe, e criam um problema novo: A degrada a qualidade do dado mostrado na demo, e C tira do caminho crítico justamente o plano de homologação dos sensores.

Três desdobramentos concretos:
1. **Semana 4, no Sprint 2:** runbook de US-01, roteiro de demo e sessão de transferência com Dev Pleno Fullstack 1. Orçar 3 SP, retirando 1 SP de EN-05 e usando os 2 SP de folga.
2. **Semana 6:** a demo é conduzida por Dev Pleno Fullstack 1 com apoio do Dev Júnior QA nos dados. Combinar com Carlos, antes, que perguntas de arquitetura terão resposta escrita na semana 7 — expectativa alinhada não vira frustração.
3. **Gatilho de escalonamento:** se o retorno na semana 7 não se confirmar, o cenário deixa de ser gerenciável por transferência de conhecimento. Nesse caso é preciso decidir na semana 7 (e não na semana 9) entre contratar apoio sênior de integração IoT ou remover US-09 do MVP, porque ele é o responsável principal pelos 11 SP de integração física do Sprint 5, que estão no caminho crítico sem folga.

---

## Cenário 3 — Antecipação da entrega em 2 semanas (fim no Sprint 5, semana 10)

### 1. Impacto nas datas

O projeto perde o Sprint 6 (semanas 11-12): **22 SP de capacidade real e 4 semanas do caminho crítico**, sendo que o hardware IoT só chega na **semana 9**. Sobram **2 semanas de janela para toda a integração física**, sem nenhuma sprint depois para absorver retrabalho.

**Sprints e histórias afetados:**
- **Sprints 0 a 4 (semanas 0-8): nenhum impacto.** US-01 (semana 4 em produção), US-03 (semana 6), demo para Carlos (semana 6) e todo o trabalho antecipado contra mock permanecem intactos. O marco obrigatório e o OKR estão fora da zona de corte.
- **Sprint 6: deixa de existir.** Perdem-se US-09 parte 2 (4 SP residuais), EN-12 homologação de campo em 20 veículos (8 SP) e EN-13 buffer de integração física (6 SP).
- **Sprint 5 (semanas 9-10): passa a ser a sprint final e estoura.** Concentraria US-04 (8 SP residuais) + US-09 completa (15 SP residuais) = **23 SP contra 22 SP de capacidade real** — estouro de 4,5% já no papel, antes de qualquer imprevisto.

**O estouro nominal de 1 SP não é o problema real. Os três problemas reais são:**
1. **Buffer zero em integração física.** Os 6 SP de EN-13 existiam justamente porque calibração de sensor e firmware de gateway falham na primeira tentativa. O plano passa a supor integração perfeita na primeira semana de contato com o hardware.
2. **Homologação de campo eliminada.** EN-12 (8 SP) sai inteira. Entregar sensores de temperatura de carga refrigerada em 140 veículos sem homologação em lote piloto transfere o teste para a operação do cliente.
3. **Risco concentrado no gateway compartilhado.** US-04 e US-09 usam o mesmo gateway, firmware e rotina de calibração. Um defeito descoberto na semana 9 bloqueia 23 dos 23 SP restantes ao mesmo tempo, sem sprint seguinte para acionar o fornecedor.

**Escopo em risco:** 34 SP de 55 SP do backlog priorizado (US-04 13 + US-09 21) dependem de uma janela de 2 semanas de integração física sem folga.

### 2. Opções de resposta

**Opção A — Fechar o MVP na semana 10 com US-01 + US-03 + US-04; US-09 marcada como Fora do escopo do MVP.**
Sprint 5 fica com US-04 (8 SP residuais) + homologação de campo de US-04 em lote piloto (6 SP) = 14/22 SP, preservando 8 SP de buffer para integração física.
- A favor: entrega com buffer real na única sprint de contato com o hardware; US-04 é a história mais simples (leitura binária de abertura, sem calibração) e por isso a mais segura de comprimir; mantém a homologação de campo, que é o que separa entrega de risco transferido; e US-09 vai para a fase 2 já com 100% do software pronto, tornando-a uma sprint de integração pura.
- Contra: corta a história de maior effort e maior valor percebido para carga refrigerada; o MVP entrega 34 dos 55 SP planejados (62%); e exige renegociação de escopo com o cliente logo depois de ele ter pedido antecipação de prazo — conversa duplamente sensível.

**Opção B — Manter US-09 em escopo reduzido (leitura e alerta de temperatura, sem histórico e relatórios, ≈ 9 SP residuais) e cortar US-04.**
- A favor: preserva a proposta de valor de carga refrigerada, que é a dor mais visível da operação; cabe nominalmente no Sprint 5 com 13 SP de folga.
- Contra: concentra o risco no item errado. US-09 exige calibração de sensor de temperatura, que é exatamente a parte que costuma falhar na primeira integração, e passaria a ser a única história da sprint final. Além disso, US-04 e US-09 compartilham o gateway do baú: cortar US-04 não elimina a instalação em 140 veículos nem o custo de campo, apenas remove a história que serviria de prova barata de integração do gateway. Economiza menos do que parece e arrisca mais do que aparenta.

**Opção C — Negociar lote piloto expresso com entrega na semana 7, antecipando a integração física para o Sprint 4.**
- A favor: é a única opção que ataca a causa (a janela curta) em vez do sintoma (o escopo). Com sensores na semana 7, o Sprint 4 vira integração e calibração reais, e o Sprint 5 vira rollout e homologação — restaurando a possibilidade de entregar US-04 e US-09 na semana 10.
- Contra: custo de frete expresso e preço unitário maior; depende de aceite do fornecedor; e o Sprint 4 já opera com 17 de 18 SP por causa dos 2 feriados, então absorver integração física exigiria remover EN-10 (spike de US-02, 3 SP) e provavelmente EN-11 (3 SP), sacrificando a preparação da fase 2. Um lote piloto também não cobre 140 veículos: viabiliza homologação, não rollout completo.

**Opção D — Adicionar pessoas ao time para comprimir os 23 SP em uma sprint.** Rejeitada de saída: ramp-up de contexto de integração IoT é maior que a janela de 2 semanas restante, e a restrição do Sprint 5 é hardware físico e calibração, não horas de desenvolvimento. Adicionar gente aqui torna a sprint mais lenta.

### 3. Recomendação

**Recomendo a Opção A como compromisso firme, com a Opção C acionada em paralelo como upside condicional. Rejeito B e D.**

O raciocínio:

1. **O dado que decide é a data de chegada do hardware, não a capacidade do time.** Com hardware na semana 9 e fim na semana 10, existem 2 semanas de contato físico com o equipamento. Nenhuma realocação de pessoas altera isso — a Opção D falha por essa razão, e qualquer plano que aloque 23 SP nessa janela está apostando em integração sem defeito na primeira tentativa.

2. **Entre cortar US-04 e cortar US-09, o dado é o perfil técnico, não o valor de negócio.** US-04 é leitura binária de abertura, sem calibração; US-09 exige calibração de sensor de temperatura. Manter na sprint final a história que precisa de calibração (Opção B) é concentrar o risco justamente onde não há buffer nem sprint seguinte. Manter US-04 preserva ainda a função dela de prova de integração do gateway compartilhado — o defeito de firmware, se existir, aparece cedo e em item pequeno.

3. **A antecipação não ameaça o compromisso central.** US-01 está em produção na semana 4 e US-03 na semana 6; a demo para Carlos ocorre na semana 6, dentro da janela encurtada. O OKR de reduzir sinistros de 7 para 5 até setembro é integralmente preservado. O que a antecipação custa é escopo de controle de carga, não resultado de OKR — e essa é a informação que deve abrir a conversa com o cliente.

4. **A Opção C vale a tentativa porque é assimétrica.** Custa uma negociação e frete; se der certo, devolve US-09 ao MVP; se der errado, o plano da Opção A segue intacto. Acionar imediatamente, com prazo de resposta do fornecedor até a semana 3, para que a decisão de escopo esteja tomada antes do Sprint 4.

5. **Compromisso a assumir com o cliente:** MVP na semana 10 com US-01, US-03 e US-04 em produção e homologados em campo; US-09 com software 100% concluído e homologado contra mock, entregando em fase 2 de uma sprint (semanas 11-12) caso o orçamento seja mantido; US-02 permanece Fora do escopo do MVP pelos mesmos três motivos do cronograma base, agravados pela perda de uma sprint.
