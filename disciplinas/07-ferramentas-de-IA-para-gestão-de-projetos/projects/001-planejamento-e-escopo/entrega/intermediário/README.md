# Missão #01 — Planejamento e Escopo com IA · nível Intermediário

Inclui os itens do [nível Básico](../básico/README.md) — duas falhas, a alteração no prompt e a
comparação V1×V2. Aqui está o que o Intermediário acrescenta: o campo marcado, a pergunta ao
stakeholder e a instrução adicional derivada do padrão de erro.

---

## O campo `[A CONFIRMAR]` escolhido

`US-01`, critério de aceite ([`backlog-estruturado-v1.md:156`](../../outputs/backlog-estruturado-v1.md)):

> *"E o alerta é entregue ao supervisor SUP-01 em até `[A CONFIRMAR COM STAKEHOLDER]` segundos"*

É o mais caro dos 15 campos marcados: o V1 usa exatamente essa lacuna para reprovar a US-01 em
*Estimable* e bloquear o card da história de maior valor do primeiro release.

**Por que a resposta não estava na transcrição.** Não é lacuna de discovery — a pergunta foi feita.
Marcus perguntou e Carlos respondeu: *"Tem que ser em tempo real. Não pode ter delay de cinco
minutos. (...) Quanto é 'em tempo real'? Não sei te dizer um número exato. Mas rápido."* O que a
reunião revelou é que a informação não existe do lado do stakeholder: Carlos não tem como converter
urgência operacional em segundos. Repetir a pergunta devolve "rápido" outra vez.

## A pergunta que eu enviaria

**Para:** Carlos Mendonça (Diretor de Operações) · **Cópia:** Priya · **Trava:** US-01, US-02, US-07

> Carlos, ficou um ponto aberto do discovery travando a estimativa do alerta de velocidade, e ele é
> de operação, não de tecnologia. Você disse que cinco minutos é demais, e concordo. O que eu preciso
> não é o número ideal: é **a partir de quanto tempo o alerta deixa de ter serventia**.
>
> Um jeito prático de chegar lá: quando o supervisor recebe o aviso, quanto tempo ele leva até falar
> com o motorista? Se são três minutos até a ligação completar, um alerta que chega em 30 segundos e
> um que chega em 90 dão no mesmo na prática — e custam bem diferente para construir.
>
> **(A) até ~1 min** — exige receber a telemetria de forma contínua; provavelmente a parte mais cara
> do projeto, e a Priya está levantando isso com o fornecedor.
> **(B) até ~3 min** — cabe numa consulta periódica, bem mais barato, e continua muito abaixo do
> atraso que você chamou de inaceitável.
> **(C) até ~10 min** — serve para relatório, não para intervenção; nesse caso a história perde a
> função que você descreveu e vale repensá-la.
>
> Minha leitura é que (B) atende. **Se a resposta demorar, a US-01 não entra em sprint:** sem o
> número o time não consegue estimar.

Não é a mesma pergunta da reunião: sai de um número que Carlos não tem para um fato operacional que
ele tem, e as faixas trazem a consequência de cada escolha.

---

## O padrão de erro da V1 e a instrução adicional

**Padrão:** o Protocolo de Ambiguidade condiciona seu comportamento mais útil — *"quando a
ambiguidade for de alto impacto, ofereça duas interpretações alternativas"* — a um julgamento que o
prompt nunca define. Sem gatilho, a aplicação ficou errática: **1 das 18 perguntas** recebeu
alternativas, e não foi a da latência, que o próprio output diz decidir a arquitetura de ingestão.
O mesmo vazio no destinatário: a Seção 2 mapeia oito papéis ausentes da reunião e esse mapa nunca é
cruzado com as perguntas.

**Instrução adicional (C3 da [v2.0](../../prompts/requirements-copilot-v2.md)):** "alto impacto"
deixa de ser julgamento e vira teste — passar em qualquer um dos três obriga alternativas.

> (a) trava uma história do primeiro release declarado no input;
> (b) a diferença de esforço entre as interpretações é de uma ordem de magnitude ou mais;
> (c) o destinatário da resposta não é quem falou no input.

Junto, o item 5 novo do Protocolo: se o input mostra alguém sendo perguntado e respondendo que não
sabe, a pergunta muda de dono. E a Seção 5 passa a exigir destinatário, histórias travadas e ordem
por bloqueio.

## Efeito no V2

| Seção 5 | V1 | V2 |
|---|---|---|
| Perguntas | 18 | 19 |
| Com destinatário nomeado | 0 | **19** |
| Com alternativas | 1 | **12** |

**O que melhorou.** A pergunta da latência recebeu três alternativas com a implicação de arquitetura
de cada uma (lote, fila, push), e mudou de dono sozinha: *"Carlos foi perguntado e respondeu 'Não sei
te dizer um número exato' — repetir a pergunta para ele devolve a mesma não-resposta. Quem tem o
número é quem precisa agir sobre o alerta a tempo"*, redirecionando para supervisores e coordenação.
É o raciocínio que eu tinha feito à mão, agora produzido pelo prompt.

**O que ainda persiste.** As alternativas passaram a ser obrigatórias por regra, então parte das 12
pode ser preenchimento de formato e não trade-off real — com uma execução por versão não dá para
separar. E o `[A CONFIRMAR]` da latência sumiu do critério de aceite pelo motivo errado, trocado
pelo teto de 5 minutos (ver [Básico](../básico/README.md), *o que ainda persiste*).
