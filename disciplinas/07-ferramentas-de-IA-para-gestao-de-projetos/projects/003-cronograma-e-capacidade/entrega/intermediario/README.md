# Missão #03 — Cronograma e Alocação Assistidos por IA · nível Intermediário

> A terceira simulação what-if, a comparação entre as três e a armadilha do cronograma assistido
> que apareceu nesta execução.

## Configuração

| Item | Valor |
| --- | --- |
| Prompt V1 | [`scheduling-v1`](../../prompts/scheduling-v1.md) — Scheduling Prompt preenchido com o contexto do RouteWise |
| Insumo | [`inputs/scheduling-routewise-input.md`](../../inputs/scheduling-routewise-input.md) — time, backlog priorizado, dependências e restrições |
| Outputs | [cronograma](../../outputs/cronograma-sprints-v1.md) · [cenários what-if](../../outputs/whatif-cenarios-v1.md) |
| Modelo | `claude-opus-5`, subagente de contexto limpo |
| Data | 07/09/2026 |

O cronograma, o contexto do time, as dependências implícitas e as duas primeiras simulações — os
itens da rubrica Básica — estão em [`entrega/basico/`](../basico/README.md).

## Parte 3 — Terceira simulação what-if

### Cenário 3 — Antecipação da entrega em 2 semanas (fim no Sprint 5, semana 10)

#### Opções

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

#### Recomendação

**Recomendo a Opção A como compromisso firme, com a Opção C acionada em paralelo como upside condicional. Rejeito B e D.**

O raciocínio:

1. **O dado que decide é a data de chegada do hardware, não a capacidade do time.** Com hardware na semana 9 e fim na semana 10, existem 2 semanas de contato físico com o equipamento. Nenhuma realocação de pessoas altera isso — a Opção D falha por essa razão, e qualquer plano que aloque 23 SP nessa janela está apostando em integração sem defeito na primeira tentativa.

2. **Entre cortar US-04 e cortar US-09, o dado é o perfil técnico, não o valor de negócio.** US-04 é leitura binária de abertura, sem calibração; US-09 exige calibração de sensor de temperatura. Manter na sprint final a história que precisa de calibração (Opção B) é concentrar o risco justamente onde não há buffer nem sprint seguinte. Manter US-04 preserva ainda a função dela de prova de integração do gateway compartilhado — o defeito de firmware, se existir, aparece cedo e em item pequeno.

3. **A antecipação não ameaça o compromisso central.** US-01 está em produção na semana 4 e US-03 na semana 6; a demo para Carlos ocorre na semana 6, dentro da janela encurtada. O OKR de reduzir sinistros de 7 para 5 até setembro é integralmente preservado. O que a antecipação custa é escopo de controle de carga, não resultado de OKR — e essa é a informação que deve abrir a conversa com o cliente.

4. **A Opção C vale a tentativa porque é assimétrica.** Custa uma negociação e frete; se der certo, devolve US-09 ao MVP; se der errado, o plano da Opção A segue intacto. Acionar imediatamente, com prazo de resposta do fornecedor até a semana 3, para que a decisão de escopo esteja tomada antes do Sprint 4.

5. **Compromisso a assumir com o cliente:** MVP na semana 10 com US-01, US-03 e US-04 em produção e homologados em campo; US-09 com software 100% concluído e homologado contra mock, entregando em fase 2 de uma sprint (semanas 11-12) caso o orçamento seja mantido; US-02 permanece Fora do escopo do MVP pelos mesmos três motivos do cronograma base, agravados pela perda de uma sprint.

## Comparação das três simulações

### Critério de aceite ou rejeição, alternativa por alternativa

| # | Alternativa | Decisão | Critério que decidiu |
| --- | --- | --- | --- |
| 1-A | Estender o projeto em 2 sprints (fim na semana 16) | Rejeitada | A opção repousa exatamente sobre a premissa que acabou de falhar — uma data do mesmo fornecedor que errou a própria estimativa em 28 dias sobre 60. E custa 24 pessoa-semanas para entregar escopo que não move o OKR de setembro. |
| 1-B | Segunda fonte + lote piloto de 10-20 sensores | Aceita, em paralelo | Assimetria: se o piloto chegar, US-04 volta ao MVP; se não chegar, o projeto ainda termina com duas fontes homologadas em vez de uma, que era o defeito estrutural do plano. |
| 1-C | Reescopar para a semana 12 com fase 2 na semana 13 | Aceita, principal | O escopo bloqueado não sustenta o indicador contratado. US-01 está em produção na semana 4 e US-03 na semana 6; US-09, US-04 e US-02 endereçam carga e manutenção, não sinistros por velocidade. |
| 2-A | Antecipar a demo para a semana 4 | Rejeitada | Troca um risco de pessoa por um risco de conteúdo. Na semana 4 o rollout nos 140 veículos acabou de acontecer: a demo mostraria dias de operação, e tendência de sinistros é o que interessa a um Diretor de Operações. |
| 2-B | Transferência de conhecimento e troca de condutor | Aceita | A restrição é conhecimento, não capacidade — 16 SP alocados contra 18,2 SP de capacidade residual sem o Sênior. O contorno de pessoa-chave já previsto (pareamento com o Dev Pleno Fullstack 1) torna o custo marginal ≈ 3 SP. |
| 2-C | Adiar EN-07 para o Sprint 5 e recompor a folga | Rejeitada | Recompõe folga que os números dizem não faltar, e tira do caminho crítico o plano de homologação dos sensores — que passaria a ser escrito depois de o hardware chegar. |
| 3-A | MVP na semana 10 com US-04; US-09 fora | Aceita, compromisso firme | Perfil técnico, não valor de negócio: US-04 é leitura binária, US-09 exige calibração. A sprint final, sem sprint seguinte para absorver retrabalho, não pode ser a que precisa de calibração. Preserva 8 SP de buffer e a homologação de campo. |
| 3-B | US-09 em escopo reduzido; US-04 fora | Rejeitada | Concentra o risco no item que exige calibração e remove a prova barata do gateway compartilhado — sem eliminar a instalação em 140 veículos nem o custo de campo, que vêm junto de qualquer uma das duas. |
| 3-C | Lote piloto expresso na semana 7 | Aceita, condicional | Mesma assimetria de 1-B: custa uma negociação e frete; se der certo devolve US-09 ao MVP, se der errado o plano de 3-A segue intacto. |
| 3-D | Adicionar pessoas ao time | Rejeitada | A restrição do Sprint 5 é hardware físico e calibração, não horas de desenvolvimento. O ramp-up de contexto de integração IoT é maior que a janela de 2 semanas restante. |

### O que a tabela mostra quando lida na vertical

**1. A pergunta que decide os três cenários é qual é a natureza da restrição — e ela vem antes de
qualquer alavanca.** As quatro alternativas rejeitadas por mérito próprio (1-A, 2-A, 2-C, 3-D) têm a
mesma forma de erro: acionam uma alavanca que não toca a restrição. 1-A e 3-D tratam escassez de
insumo físico como problema de tempo ou de gente; 2-C trata como falta de capacidade um cenário em
que sobram 2,2 SP de folga. O sintoma comum é que nenhuma delas move a variável que trava o plano —
a semana de chegada do hardware, nos Cenários 1 e 3, e quem sabe operar US-01, no Cenário 2.

**2. O que autoriza cortar escopo nos dois cenários de hardware é o mesmo dado.** 1-C e 3-A são
decisões de renúncia, e ambas só se sustentam porque US-01 está em produção na semana 4 e US-03 na
semana 6 — o OKR de sinistros já está endereçado antes de o hardware sequer chegar. Sem esses dois
marcos antecipados, as duas viram entrega de 21 SP sem resultado contratado, e a decisão certa
passaria a ser 1-A. A antecipação de US-01 no cronograma base é, portanto, o que torna os dois
cortes defensáveis; não é uma escolha de sequenciamento apenas, é o que compra a opção de cortar.

**3. Dois cenários de três terminam na mesma jogada de hedge.** 1-B e 3-C são o mesmo movimento —
comprar acesso antecipado ao insumo, em lote pequeno, por fora do lead time contratado. Que a mesma
alternativa apareça como resposta a um atraso do fornecedor e a uma antecipação pedida pelo cliente
diz menos sobre os cenários do que sobre o plano: **o cronograma tem uma alavanca dominante, e é o
lead time de 60 dias.** Oito das doze semanas do caminho crítico são espera. Qualquer cenário futuro
que não seja de pessoal vai desembocar aí, e a conclusão prática é que a homologação de segunda
fonte deveria ser trabalho do Sprint 2 no plano base, não contingência acionada quando o problema
chega.

**4. Onde os três divergem é no custo de errar.** No Cenário 2 a decisão é reversível dentro da
própria sprint — se a transferência de conhecimento não pegar, ainda há a semana 7 para escalar. Nos
Cenários 1 e 3 a decisão é de escopo com o cliente, e desfazê-la exige uma segunda conversa que
consome o crédito da primeira. Isso justifica o gatilho de prazo em 3-C (resposta do fornecedor até
a semana 3, antes do Sprint 4): a assimetria só é assimetria enquanto a decisão de escopo ainda não
foi comunicada.

## Armadilha do cronograma assistido observada nesta execução

O modelo preencheu as seis sprints com trabalho habilitador que ele mesmo inventou: 71 dos 115 SP
alocados (62%) são itens `EN-xx` que não existiam no backlog e que ninguém estimou. Com isso, a
"capacidade utilizada" fica saudável por construção — 16 a 20 SP contra 22 em toda sprint — e o
cronograma parece equilibrado. Percebi ao conferir as somas: o Sprint 4 não tem nenhuma história do
backlog, só EN-xx. O gargalo real são os 60 dias de lead time, que nenhuma dessas linhas endereça.
