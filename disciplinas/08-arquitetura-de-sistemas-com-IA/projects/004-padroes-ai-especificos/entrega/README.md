# Missão #04 — Padrões de Design AI-Específicos

> Caso: Anotaí. Gateway que combina RAG, roteamento, cache semântico e Approval Gate, com limiar
> calibrado por medição.

## Passo 1 — Padrões mapeados

Tarefa: as mensagens de texto que eu mando ao bot. Muitas são a mesma pergunta com outras palavras
("quanto já gastei esse mês?"), e as outras são lançamentos e operações que mudam o meu estado
financeiro. Como a intenção sai da mesma chamada do extrator (PRD §10), o Gateway só decide *antes*
do modelo o que é comando e o que está no cache; o resto do roteamento acontece *depois* da extração.

| Padrão | Decisão no meu contexto | Por quê |
|---|---|---|
| RAG | Agentic, pelo agente de consulta do M2, que lê o banco com `total_gasto` | Sintoma real: pergunta de gasto é soma com filtro, e busca por similaridade sobre despesas devolve linhas parecidas, não o total. Não há corpus de documentos: as Categorias elegíveis vão inteiras em cada chamada |
| Intent-Based Routing | `/mes`, `/tetos`, `/limite` → regra, sem modelo; `consultar` com tipo fixo → código responde; `consultar` aberta → agente de consulta; `lancar_despesa` → regras e gravação; `pagar_fatura`, `estornar`, `quitar_parcelamento`, `registrar_receita` → Approval Gate | É o passo 3 do fluxo do PRD §7, e o roteamento mais simples que separa os caminhos |
| Model Router | Texto e áudio → modelo barato (`google/gemini-3.5-flash-lite`); foto → modelo mais capaz, eleito pela eval (PRD §10). A intenção não muda o modelo | A intenção só é conhecida depois da chamada, então o roteamento de modelo só pode usar o que se sabe antes: o tipo de entrada. Cupom em papel térmico é a leitura mais difícil |
| Semantic Cache | Cacheável: a **interpretação** de uma consulta fixa (pergunta → tipo `mes`, `tetos` ou `limite`); o número é recalculado pelo código a cada hit. Nunca: lançamento, operação e pergunta aberta | O total muda a cada lançamento, então o que se repete é a pergunta, não a resposta. Dois "gastei 50 no mercado" são duas despesas: um hit ali apagaria um gasto |
| Approval Gate | Obrigatório em operação (RN-23), por ser o erro caro sem desfazer do CASO.md; por confiança baixa quando total e parcela ficam incertos numa compra parcelada (RN-2) | Incerto é a união do que o modelo marca com o que o código marca (RN-30): `valor_informado_e` vazio, ou fala que não casa com "10x de 300" nem com "3 mil em 10x". Não há score numérico para arbitrar |

## Passo 2 — Calibração com dado real

Modelo de embedding: `openai/text-embedding-3-small`, multilíngue e o mais barato da lista do
OpenRouter que eu reconheço. Os pares diferentes são de propósito parecidos no texto, porque o risco
do meu cache é um lançamento bater numa consulta.

| Par | Pergunta A | Pergunta B | Esperado |
|---|---|---|---|
| 1 | quanto já gastei esse mês? | quanto eu gastei neste mês? | parecida |
| 2 | quanto já gastei esse mês? | qual meu total de gastos em outubro até agora? | parecida |
| 3 | qual o limite disponível do Nubank? | quanto ainda tenho de limite no cartão Nubank? | parecida |
| 4 | como estão meus tetos? | quanto falta para estourar os tetos das categorias? | parecida |
| 5 | quanto já gastei esse mês? | quanto gastei mês passado? | diferente |
| 6 | quanto gastei no mercado esse mês? | gastei 50 no mercado hoje | diferente |
| 7 | qual o limite disponível do Nubank? | paguei a fatura do Nubank, 2 mil | diferente |
| 8 | quanto já gastei esse mês? | quanto gastei com Uber em julho, agosto e setembro? | diferente |

Medido em [outputs/calibra-limiar-01.md](../outputs/calibra-limiar-01.md):

| Par | Esperado | Similaridade |
|---|---|---|
| 1 | parecida | 0,951 |
| 2 | parecida | 0,763 |
| 3 | parecida | 0,824 |
| 4 | parecida | 0,492 |
| 5 | diferente | 0,901 |
| 6 | diferente | 0,553 |
| 7 | diferente | 0,555 |
| 8 | diferente | 0,688 |

**Limiar do cache: 0,93.** Os grupos se sobrepõem: "esse mês" × "mês passado" (0,901) é mais
parecido no texto do que três pares que são a mesma pergunta. Um hit ali responde o mês errado, então
o limiar precisa ficar acima de 0,901, e o único par acima dele é a paráfrase quase literal (0,951).
Pus o corte perto do meio desse intervalo, com pelo menos 0,02 de folga para cada lado. Na prática, o meu cache só
acerta paráfrase quase literal; os pares 2, 3 e 4 viram uma chamada ao extrator, que custa menos de
um décimo de centavo de dólar. O embedding mede o texto, não o período.

## Passo 3 — Log de execução (4 casos)

Execução com `stdin: s,t` ([outputs/gateway-03.md](../outputs/gateway-03.md), trilha em
[gateway-03.audit-trail.jsonl](../outputs/gateway-03.audit-trail.jsonl), US$ 0,000813). Nas duas
primeiras execuções ([gateway-01](../outputs/gateway-01.md) e [gateway-02](../outputs/gateway-02.md)),
o modelo leu "parcelei o celular em 10 vezes, 2500" e "parcelei o celular em 10, deu 900" como total,
sem marcar incerto, e o gate não disparou. Por isso a confiança passou a ser a união com a checagem do
código (`src/gateway.js:89`), como a RN-30 já pedia.

**Cache miss**

```text
[Gateway] Mensagem: "quanto já gastei esse mês?"
[Semantic Cache] MISS (0.000 < 0.93)
[Model Router] texto → google/gemini-3.5-flash-lite (barato)
[Extrator] {"intencao":"consultar","gastos":[],"operacao":null,"consulta":{"tipo":"mes"}}
[Router] consulta mes → regra; interpretação guardada no cache
[Orquestrador] outubro até 2026-10-15: essencial R$ 308,50 · não essencial R$ 208,40 · a classificar R$ 38,20
```

**Cache hit**

```text
[Gateway] Mensagem: "quanto eu gastei neste mês?"
[Semantic Cache] HIT (0.951 ≥ 0.93) com "quanto já gastei esse mês?" → consulta mes, sem chamar o extrator
[Orquestrador] outubro até 2026-10-15: essencial R$ 308,50 · não essencial R$ 208,40 · a classificar R$ 38,20
```

**Approval Gate por síntese obrigatória** (no meu caso, operação)

```text
[Gateway] Mensagem: "paguei a fatura do Nubank, 2 mil"
[Semantic Cache] MISS (0.523 < 0.93)
[Extrator] {"intencao":"pagar_fatura","operacao":{"cartao_apelido":"Nubank","valor":2000}}
[Approval Gate] pagar_fatura {"cartao_apelido":"Nubank","valor":2000}: gate obrigatório (RN-23). Confirmar? (s/n) → dono respondeu "s"
[Audit Trail] status_final: executado_apos_confirmar
```

**Approval Gate por confiança baixa**

```text
[Gateway] Mensagem: "parcelei o celular em 10, deu 900"
[Extrator] {"intencao":"lancar_despesa","gastos":[{"valor":900,"parcelas":10,"valor_informado_e":"total",...,"campos_incertos":[]}]}
[Confiança] valor_informado_e="total" do modelo, mas a fala não casa com "Nx de V" nem com "V em Nx" → incerto (marcado pelo codigo)
[Approval Gate] R$ 900,00 em 10x: o extrator não distinguiu total de parcela (RN-2). Total ou parcela? (t/p) → dono respondeu "t"
[Audit Trail] status_final: gravado_apos_escolha
```
