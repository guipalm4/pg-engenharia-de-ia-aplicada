# Caso da disciplina 09

Os seis enunciados pedem *"um caso real do seu próprio contexto de trabalho (não um exemplo
hipotético)"*. O caso é o **extrator de despesas do Anotaí**, o mesmo nos seis módulos. Escolhido em
14/10/2026.

## 1. O projeto

| Campo | Valor |
|---|---|
| Nome | Anotaí |
| Repositório local | `~/Dev/Projects/Personal/anotai` (PRD em `docs/PRD.md`, spike em `spikes/extracao/`) |
| O que faz | Controle de finanças pessoais em que o lançamento é uma conversa no Telegram (áudio, texto ou foto de cupom) |
| Quem usa | O dono; usuário único na v1. Oferta a amigos e família por assinatura é hipótese futura |
| Stack | TypeScript, monorepo, Postgres, OpenRouter como único provedor de IA |
| Estado em 14/10/2026 | Spike de escolha de modelo de extração (F-0); não está em produção |

## 2. A tarefa recortada

**Mensagem em texto → lista de gastos em JSON.** É o contrato de saída do extrator (PRD §10), restrito
à intenção `lancar_despesa`:

| Campo | Regra |
|---|---|
| `gastos[].valor` | total do gasto; vazio quando não foi dito |
| `gastos[].descricao` | sempre |
| `gastos[].estabelecimento` | opcional |
| `gastos[].categoria` | só entre as Categorias elegíveis enviadas na chamada |
| `gastos[].cartao` | só entre os apelidos de Cartão enviados (*roxinho* → Nubank) |
| `gastos[].data_expressao` | tipo da expressão (hoje, ontem, dia do mês…); a data é calculada por código |

**Fora do recorte:** transcrição do áudio, foto de cupom e as outras intenções (fatura, estorno,
receita). Parcelamento (`10x de 300`) fica fora do treino, mas serve de teste de estresse no M5.

## 3. Números reais (PRD §9)

| Restrição | Valor |
|---|---|
| Volume | 100 mensagens de áudio ou texto e 10 fotos por mês |
| Teto de custo de IA | R$ 20 por mês, elevável a R$ 40 (plano B) |
| Fatia dos extratores | 70% do teto, cerca de R$ 0,13 por mensagem |
| Latência | p95 de até 10 s entre o envio e a confirmação (áudio e texto) |
| Dado sensível | dados financeiros do dono; o dono aceitou que trafeguem para o OpenRouter |

**Tensão conhecida:** com esse volume, o gasto de IA da tarefa tem teto de cerca de R$ 13 por mês (100 × R$ 0,13). A
economia possível de um modelo ajustado é pequena diante de qualquer custo de treino, e o NPV do M1
tende a reprovar. O enunciado aceita isso como entrega. O que pode mudar a conta é volume (a
hipótese de assinatura) ou trocar o modelo grande por um pequeno ajustado, que é o que o M4 testa.

## 4. Dados

- **Real:** não há dado de produção. Há um gabarito de 2 áudios em `anotai-OLD/evals/expected.json`,
  com gírias reais (*roxinho*, *pila*, *personalite*). O PRD manda o dataset real ficar fora do git.
- **Neste repositório público, só dado sintético ou anonimizado.** Valores, datas e estabelecimentos
  de exemplo são inventados; nenhum gasto real do dono entra aqui.

## 5. Estado acumulado

O que cada módulo decidiu e o seguinte herda. Uma linha por decisão, sem análise.

| Módulo | Decisão herdável |
|---|---|
| 001 | — |
| 002 | — |
| 003 | — |
| 004 | — |
| 005 | — |
| 006 | — |
