# Missão #02 — Priorização de Backlog com IA · nível Intermediário

> Três rodadas do Backlog Scorer sobre o mesmo backlog: sem calibração, com dados de OKR
> acrescentados, e com o contexto reestruturado em fatos medidos mais regras de uso.

## Configuração

| Item | Valor |
| --- | --- |
| Prompt V1 | [`backlog-scorer-v1`](../../prompts/backlog-scorer-v1.md) — contexto original do case |
| Prompt V2 | [`backlog-scorer-v2`](../../prompts/backlog-scorer-v2.md) — OKRs do stakeholder acrescentados em prosa |
| Prompt V3 | [`backlog-scorer-v3`](../../prompts/backlog-scorer-v3.md) — mesmo conteúdo tabulado, mais três regras de uso |
| Insumo | [`inputs/backlog-routewise-input.md`](../../inputs/backlog-routewise-input.md) — 6 User Stories, idêntico nas três rodadas |
| Outputs | [V1](../../outputs/backlog-priorizado-v1.md) · [V2](../../outputs/backlog-priorizado-v2.md) · [V3](../../outputs/backlog-priorizado-v3.md) |
| Modelo | `claude-opus-5`, subagente de contexto limpo em cada rodada |
| Data | 03/09/2026 |

O material pede Gemini a temperatura 0,3. `temperature` não existe nos modelos Claude atuais, o que
torna a atribuição de causa mais frágil e é o motivo de este relato separar explicitamente efeito de
prompt, ruído, e o que não consigo explicar.

O ranking da 2ª rodada e o plano de resolução por Flag — itens 1 e 4 da *Entrega Esperada* — estão
em [`entrega/basico/`](../basico/README.md), escritos sobre a V2, que é a segunda rodada que o
enunciado pede.

## Artefatos desta entrega

| Arquivo | O que é |
| --- | --- |
| `README.md` | este relato |
| [`tabelas-comparativas.md`](./tabelas-comparativas.md) | as matrizes V1 × V2 × V3 completas, variável por variável |
| [`diff-dos-prompts.md`](./diff-dos-prompts.md) | os dois diffs, V1 → V2 e V2 → V3 |

## As três rodadas

Só o bloco **CONTEXTO DE NEGÓCIO** mudou. Protocolo de cálculo, formato de output e restrições de
comportamento são idênticos nas três versões.

**V1 → V2 — injeção de dados reais.** Acrescentei cinco números vindos do stakeholder: 2 sinistros/mês
a R$ 40.000, 20% da frota refrigerada, multa de R$ 10.000 por caminhão sem sensor, e o prazo de
01/01/2027. Tudo em prosa, dentro de uma lista de OKRs.

**V2 → V3 — reestruturação do contexto.** Mesmos números, três mudanças de forma e de regra:

1. Os dados saíram da prosa e viraram três tabelas — *Fatos medidos*, *OKRs*, *Restrições e
   exposições*.
2. Um bloco novo, *Como usar estes dados*, com três regras: item que não move nenhum OKR tem teto de
   Impact 1; exposição financeira entra em Cost of Delay, não em Impact; número ausente das tabelas
   deve ser **declarado como suposição** com Confidence mantida em 50%.
3. A frase "140 veículos" saiu do texto de apresentação da empresa, ficando só na tabela.

A hipótese por trás da V3: a V2 tinha resolvido a *disponibilidade* do dado, mas não a
*rastreabilidade*. O modelo continuava misturando número medido com número inventado na mesma
tabela, sem distinguir os dois.

## Execução V1

Output completo em [`outputs/backlog-priorizado-v1.md`](../../outputs/backlog-priorizado-v1.md).

## O que mudou no ranking

| Item | V1 | V2 | V3 |
| --- | --- | --- | --- |
| US01 — Alertas de Velocidade | 1º | 1º | 1º |
| US09 — Sensor de Temperatura | 4º | **2º** | 2º |
| US03 — Score de Comportamento | 2º | 3º | 3º |
| US04 — Sensor de Abertura de Baú | 3º | 4º | 4º |
| US02 — Manutenção Preditiva | 5º | 5º | 5º |
| US05 — Dashboard Base (HiPPO) | 6º | 6º | 6º |

**O ranking mudou uma vez em três rodadas, e a V3 não o moveu** — apesar de 24 das 48 variáveis de
entrada terem mudado de valor entre V2 e V3. Isso já diz algo antes de qualquer análise: a
ordenação é bem menos sensível que os números que a produzem.

---

## Análise causal

### Confidence foi a única variável que respondeu a dado

Entre V1 e V3, contando quantos dos 6 itens se moveram:

| Variável | Itens que mudaram | Rastreável a dado ou regra nomeada |
| --- | --- | --- |
| Confidence | 1 de 6 | sim — US09, o único item que recebeu dado novo |
| Impact | 1 de 6 | sim — US09, mesma origem |
| Reach (valor) | 1 de 6 | não — US05, o único Reach sem lastro no contexto |
| Effort | **6 de 6** | não |

Essa assimetria é a base de toda a atribuição deste relato. Confidence só se moveu onde entrou
informação; Effort se moveu em todo lugar, inclusive onde nada entrou. Uma variável está lendo o
prompt, a outra está oscilando.

### Por que a US09 subiu duas posições (V1 → V2)

Três dados entraram, cada um movendo uma variável diferente:

| Dado acrescentado | Variável que moveu | Efeito |
| --- | --- | --- |
| 20% da frota é refrigerada (28 veículos) | Confidence: 50% → 100% | o Reach deixou de ser suposição do modelo |
| Multa de R$ 10.000 por caminhão sem sensor | Impact: 2 → 3 e BV: 3 → 8 | exposição passou a ser quantificável (R$ 280.000) |
| Prazo de 01/01/2027 | Time Criticality: 7 → 10 | o item virou *fixed date* |

Na V1 o modelo já havia chutado "28 veículos (estimado)" e aberto Flag sobre isso: *"os 28 veículos
refrigerados são uma suposição de 20% da frota, não uma informação do contexto"*. **O número não
mudou — mudou a origem dele.** Esse deslocamento de suposição para dado de contexto é o que dobra o
Confidence, e sozinho ele triplica o RICE (9,3 → 28,0), porque Confidence é multiplicador.

No WSJF o motor é outro: o prazo com data. Sem data, compliance é apenas "importante" (TC 7). Com
data, o valor não decai — despenca em 01/01/2027. Isso, com BV 3 → 8, leva o CoD de 18 para 28, o
maior do backlog, e o WSJF de 3,00 para 5,60.

### Por que o Confidence da US09 caiu de 100% para 80% (V2 → V3)

Essa é a mudança mais interessante das três rodadas, porque é a única em que o modelo ficou **menos**
confiante recebendo o **mesmo** dado.

A V2 deu 100% e justificou assim: *"o requisito não é uma hipótese de valor, é uma obrigação com
prazo e multa nominal informados no contexto"*, e completou que *"a Confidence alta refere-se ao
valor do item, não ao seu cronograma"*.

A V3 deu 80% e apontou uma lacuna que a V2 não considerou: a **especificação técnica da
conformidade**. A faixa de 2°C–8°C aparece nos critérios de aceitação como exemplo, e os requisitos
da ANVISA quanto a frequência de leitura, retenção de log e formato de comprovação não estão em lugar
nenhum do contexto.

A causa é a terceira regra da V3 — *número ausente das tabelas deve ser declarado como suposição*.
Ela não se aplicava a este caso literalmente, já que os 28 veículos estão na tabela de fatos medidos;
o que ela fez foi obrigar o modelo a varrer o item procurando o que **não** estava lastreado, e a
varredura encontrou outra coisa.

**O 100% da V2 estava inflado**, e o item aqui não é a diferença de 20 pontos: é que a V2 declarou
"evidências sólidas" sobre um item cujo próprio critério de conformidade ninguém verificou. Um
ranking que se apresenta como auditável não pode ter uma célula em 100% apoiada num requisito
regulatório que não foi lido.

O efeito numérico é grande — RICE 28,0 → 16,8, somando a queda de Confidence ao Effort que subiu de 3
para 4 — e derruba a US09 do 3º para o 4º lugar no RICE isolado. O ranking combinado a segura em 2º
pelo Cost of Delay. Ver a ressalva sobre isso em [Anti-padrão](#anti-padrão-observado).

### Por que o Confidence da US01 nunca se moveu

Ficou em 80% nas três rodadas, e o Impact em 3. Os dois dados acrescentados na V2 — 2 sinistros/mês,
R$ 40.000 por sinistro — **não moveram nenhuma variável do RICE**, e a V3 confirmou isso.

A razão está no que o dado descreve. Frequência e custo de sinistro dimensionam o **tamanho do
problema**. Confidence mede confiança na estimativa de Reach, Impact e Effort — e a incerteza da US01
não está no tamanho do problema, está no **mecanismo**: quanto o alerta reduz o excesso de
velocidade, e quanto a redução de excesso reduz sinistro.

As três rodadas dizem a mesma coisa com palavras diferentes, o que torna isto reprodução e não
coincidência:

| Rodada | O que impede 100% |
| --- | --- |
| V1 | *"sem referência disponível para o efeito de alerta em tempo real em frota logística brasileira"* |
| V2 | *"sabe-se o custo do problema mas não a eficácia da intervenção"* |
| V3 | *"não há histórico de quantos dos 7 sinistros teriam sido evitáveis por alerta em tempo real"* |

O Impact também não tinha para onde subir: já estava em 3 (massivo) desde a V1, saturado.

**Regra que sai daqui:** dado que dimensiona o problema move Impact — e só se Impact não estiver no
teto. Dado que evidencia o mecanismo, ou que remove uma suposição do modelo, é o que move Confidence.
Foi por isso que a mesma quantidade de informação nova produziu efeito nulo na US01 e salto de duas
posições na US09.

### A regra que eliminou uma contagem dupla

A segunda regra da V3 — *exposição financeira entra em Cost of Delay, não em Impact* — não mudou
nenhum número da US09: o Impact ficou em 3 nas duas rodadas. Mudou a **fundamentação**, e o rastro é
textual.

Na V2, a mesma multa sustentava as duas pontas. O Impact 3 foi justificado com *"a exposição é
quantificada: R$ 10.000 × 28 refrigerados = R$ 280.000"*, e o BV 8 do WSJF vinha da mesma exposição.
Um fato contado duas vezes, em dois frameworks que depois são combinados num ranking.

Na V3 o modelo escreve explicitamente: *"A multa de R$ 10.000 por veículo não entra aqui — como
exposição financeira, foi alocada ao Business Value do WSJF"*, e passa a sustentar o Impact 3 em
outra coisa: ser o único item que atende o OKR 2. O BV subiu de 8 para 9.

Esta é a única mudança da V3 que atribuo ao prompt com confiança alta, porque a justificativa do
output nomeia a regra ao aplicá-la.

### A regra que não fez nada

A primeira regra da V3 — *item que não move nenhum OKR tem teto de Impact 1* — **não produziu efeito
observável**. US02 e US04 já estavam em Impact 1 na V1 e na V2; US05 já estava em 0,5. O modelo já
aplicava esse teto por conta própria, e as justificativas da V1 dizem isso com todas as letras:
*"problemas reais de logística, porém fora do OKR declarado do Carlos"*.

Registro porque uma entrega que só relata as regras que funcionaram inverte a taxa de acerto real:
das três instruções que escrevi na V3, uma foi redundante.

### O Reach ficou pior e a auditabilidade ficou melhor

A US05 é o caso mais claro do que a terceira regra fez. O Reach dela nas três rodadas:

| Rodada | Célula da tabela RICE | Justificativa |
| --- | --- | --- |
| V1 | `5 usuários/mês` | apresentado sem ressalva |
| V2 | `5 usuários/mês` | nota de base de Reach: *"US05 alcança apenas o círculo executivo/TI (Carlos, Priya e ~3 gestores)"* — o modelo detalhou a composição do número que ele mesmo inventou |
| V3 | `10 usuários/mês (suposição)` | *"é estimativa própria — o contexto não informa quantos gestores acessariam o painel"* |

O número dobrou, arbitrariamente, e continua sem lastro. Mas na V2 ele estava **pior disfarçado**: a
justificativa nomeava pessoas reais do case, o que faz um chute parecer levantamento. A V3 desiste da
precisão falsa e marca a célula.

O padrão se repete no Reach de US03 (140 motoristas — assume um motorista por veículo, número que
nunca esteve no contexto) e de US04 (140 baús monitoráveis — o contexto só discrimina os 28
refrigerados). Nas três rodadas o valor é o mesmo; só a V3 marca a célula e explica.

Contagem de suposições marcadas na tabela RICE: **V1 = 1, V2 = 0, V3 = 3**. A V2 chega a *remover* a
única marcação da V1 — corretamente, porque aquele dado passou a existir — sem marcar nenhuma das
três que continuavam sem lastro.

Como o enunciado abre dizendo que *"o objetivo não é ter um backlog certo: é ter um backlog
auditável"*, este é o resultado mais relevante da V3, e ele não aparece em nenhum score.

---

## Justificativas de Impact e Confidence — os 3 itens do topo

Item 2 da *Entrega Esperada*. Abaixo, como cada justificativa se sustenta na rodada mais recente e o
que mudou nela ao longo das três.

**US01 — Alertas de Velocidade (1º nas três rodadas)**
Impact 3 estável. A justificativa ganhou precisão: a V1 argumentava por exclusão (*"é o único item
cuja saída é a própria métrica do OKR"*), a V3 quantifica a meta (*"evitar 2 sinistros, a R$ 40.000
cada, equivale a R$ 80.000 no período"*). Confidence 80% estável, com a mesma causa nas três
rodadas — eficácia da intervenção não medida. A V3 é a única que propõe um teste executável hoje:
cruzar os 7 sinistros com os logs de telemetria existentes e ver quantos tiveram evento de excesso
registrado antes.

**US09 — Sensor de Temperatura (4º → 2º → 2º)**
Impact 2 → 3, causado pela multa e pelo prazo; a fundamentação migrou da exposição financeira (V2)
para a cobertura do OKR 2 (V3), como descrito acima. Confidence 50% → 100% → 80%, com as três
justificativas apontando gaps diferentes: contagem de refrigerados (V1), nenhum (V2), especificação
ANVISA (V3). É o único item do backlog cujo Confidence tem três valores distintos, e o único que
recebeu dado novo — não é coincidência.

**US03 — Score de Comportamento (2º → 3º → 3º)**
Impact 2 e Confidence 50% estáveis nas três rodadas, sem nunca ter recebido dado. Caiu uma posição
por movimento alheio — a subida da US09 — e não por reavaliação própria. O que muda entre as rodadas
é o que o modelo aponta como lacuna: a V1 e a V2 citam o elo score → sinistro não medido; a V3
acrescenta que o Reach de 140 motoristas assume um motorista por veículo, dado que nunca esteve no
contexto. **Efeito da terceira regra da V3**, e a lacuna nova é mais acionável que a anterior: o
efetivo de motoristas é um número que o RH entrega numa consulta.

---

## Efeito do prompt, ruído, ou não explicado

**Atribuo ao prompt** o que rastreia até um dado ou regra nomeada, com rastro no texto da
justificativa:

| Mudança | Causa nomeada |
| --- | --- |
| US09 Confidence 50% → 100% | os 28 veículos refrigerados entraram no contexto (V2) |
| US09 Impact 2 → 3, TC 7 → 10, BV 3 → 8 | multa e prazo entraram no contexto (V2) |
| US09 Confidence 100% → 80% | a regra de declarar suposições fez o modelo achar o gap da especificação ANVISA (V3) |
| US09 — fundamentação do Impact deixa de citar a multa | a regra de rotear exposição para CoD (V3) |
| US03, US04, US05 — Reach marcado como suposição | a regra de declarar suposições (V3) |
| Flag de capacidade versus escopo | **candidato, não confirmado** — a capacidade do time saiu da prosa e virou linha de tabela na V3, mas a V3 mudou forma e regra na mesma rodada, e não consigo separar as duas |

**Trato como ruído** a variação de Effort e de Job Size. Nenhuma das seis histórias mudou de escopo
entre as rodadas, e Effort mudou nos 6 itens. Três amostras do mesmo item, sem tendência: US03 vai
2,5 → 4,0 → 3,0; US02 vai 4,0 → 6,0 → 5,0. A amplitude chega a 60% do valor mínimo.

A consequência prática aparece duas vezes, em direções opostas, e as duas convidam a uma leitura
errada:

- **RICE da US01 caiu 224 → 168 entre V1 e V2.** Não é a calibração desvalorizando o item — todas as
  outras quatro variáveis do RICE ficaram idênticas. É o Effort que foi de 1,5 para 2,0. Na V3, com
  Effort 2, o RICE volta a dar exatamente 168,0.
- **WSJF da US01 saltou 8,00 → 12,00 entre V2 e V3**, o maior número da série inteira. O CoD nem se
  moveu (24 nas duas). O que mudou foi o Job Size, de 3 para 2. Ler isso como "o input reestruturado
  valorizou a US01" seria errado pela mesma razão, em espelho.

**Não consigo explicar** duas coisas, e prefiro nomeá-las assim a forçá-las numa das categorias
acima:

1. **Entre V1 e V2 nenhum Effort caiu, e quatro dos seis subiram.** Ruído simétrico não faz isso. Mas
   também não é reescala limpa: a razão V2/V1 varia de 1,00 (US04, US09) a 1,60 (US03). Há um
   deslocamento para cima sem causa identificável no que mudou no prompt.
2. **O Cost of Delay dos quatro itens sem vínculo com OKR cai monotonicamente nas três rodadas** —
   US04 11 → 9 → 7, US02 13 → 10 → 8, US05 6 → 5 → 3, US03 17 → 16 → 15 — enquanto os dois ancorados
   em OKR não seguem o padrão. Na V3 há uma regra que pressiona nessa direção (*"os OKRs definem o
   que conta como valor de negócio"*), mas ela não existia na V2, e a queda começa na V2. A
   explicação de recompressão relativa é plausível — WSJF é pontuação relativa, e quando a US09
   assume o topo com CoD 28 os demais são empurrados para baixo — mas plausível não é verificado.

**Ressalva de método, e ela é séria:** um run por versão, três versões. A separação acima é por
rastreabilidade a dado nomeado e por consistência entre as três rodadas, **não por reprodução do
mesmo prompt**. Três execuções de prompts diferentes não substituem duas execuções do mesmo prompt.
O que salva a atribuição de Confidence é a assimetria — 1 item em 6 contra 6 em 6 —, que é forte
demais para ser acidente; o resto fica no nível de hipótese sustentada.

---

## O que isso implica para o sprint

1. **US01 entra na Sprint 1, com medição embutida.** Como o Confidence não subiu em nenhuma das três
   rodadas, e sempre pela mesma razão, a eficácia segue não demonstrada. O OKR do Carlos tem amostra
   de 7 sinistros, pequena o bastante para cair sozinha por variação natural. Sem baseline de eventos
   de excesso coletado **antes** de ligar o alerta, em setembro de 2026 não haverá como atribuir o
   resultado à feature. O teste que a V3 sugere — cruzar os 7 sinistros com os logs de telemetria
   existentes — custa horas e deve sair antes da sprint.
2. **A US09 está em 2º, mas o item de sprint dela não é código.** É o pedido de compra: 60 dias de
   lead time mais instalação em 28 veículos contra 01/01/2027, o que dá data-limite de pedido em
   torno de 01/11/2026. Esse trabalho não consome capacidade do time e por isso pode — e deve — sair
   já, em paralelo à US01.
3. **A especificação ANVISA virou tarefa, não pressuposto.** Foi o achado da V3, e ele antecede a
   compra: comprar 28 sensores antes de confirmar frequência de leitura, retenção de log e formato de
   comprovação é arriscar R$ 280.000 de exposição contra hardware que pode não atender a norma.
4. **US01 e US09 não cabem na mesma sprint.** Somando os Efforts das três rodadas, US01 fica em
   ~2 pm e US09 entre 3 e 4 pm, contra 6 devs e ~35 SP por sprint. A sequência é US01 na Sprint 1,
   com a compra da US09 disparada no mesmo dia e o desenvolvimento dela na Sprint 2.
5. **A soma de 21 pessoa-mês do backlog inteiro não cabe na janela dos OKRs** — flag que só a V3
   levantou. Contra a meta de setembro de 2026 e a data-limite de hardware de novembro de 2026, a
   conversa a ter com o Carlos é qual dos itens de baixo do ranking sai do MVP, não como acelerar
   todos.

---

## Anti-padrão observado

**Mudei mais de uma coisa por rodada, nas duas iterações — e a segunda vez foi pior que a primeira.**

Na V2 injetei cinco dados de uma vez, em dois itens diferentes. O enunciado pede calibrar *o item
prioritário*; calibrei US01 e US09 juntos. Deu certo por acidente: os efeitos ficaram separáveis
porque um dos itens não se moveu. Se o Confidence da US01 também tivesse subido, eu não teria como
dizer qual dos cinco dados causou o quê.

Na V3, sabendo disso, fiz de novo — e misturei duas coisas de **naturezas diferentes**: mudança de
forma (prosa → tabela) e mudança de regra (as três instruções do bloco *Como usar estes dados*). O
preço apareceu na flag de capacidade versus escopo, a única que a V3 acrescentou.
Ela pode ter surgido porque a capacidade do time saiu da prosa e virou linha de tabela, ganhando
saliência, ou por alguma das regras novas, ou por nada — e como as duas mudanças entraram juntas,
não há como decidir. É o único achado da V3 que não consigo atribuir, e é o de maior
consequência prática — é ele que diz que o backlog não cabe na janela dos OKRs.

Uma variável por rodada custa uma execução a mais e torna a atribuição trivial. Foi o que o exemplo
do professor fez: um único dado, num único item.

**Segundo anti-padrão, este do prompt e não da minha operação:** o formato de output pede *"liste os
itens combinando RICE e WSJF"* sem definir como combinar — texto herdado do template do professor e
que sobreviveu intocado às três versões. O modelo preencheu a lacuna sozinho, de três jeitos: média
posicional com desempate por CoD na V1, prosa por item sem método declarado na V2, e média posicional
com uma banda de tolerância de 0,5 que ele mesmo inventou na V3. Nas três rodadas o resultado bateu,
mas a posição 2 da US09 na V3 depende inteiramente dessa banda: no RICE isolado ela é 4ª, com 16,8
contra 46,7 da US03. **A conclusão central desta entrega está apoiada num método de combinação que o
prompt nunca especificou.** Numa V4, essa é a primeira linha a escrever.

## O experimento que falta

Rodar `backlog-scorer-v2` uma segunda vez, sem alterar nada. É a única forma de fechar a atribuição:
se o Effort da US01 voltar a 2,0 e o da US03 a 4,0, a variação é do prompt e este relato está errado
em três lugares. Se saírem números diferentes de novo, o ruído está confirmado por reprodução em vez
de por inferência.
