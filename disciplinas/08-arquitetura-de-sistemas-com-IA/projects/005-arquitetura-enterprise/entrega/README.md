# Missão #05 — Arquitetura Enterprise

> Caso: Anotaí. O Gateway do Módulo 4 estendido com cascata de model tiering e orçamento por tenant.

## Passo 1 — Tiers definidos

A cascata vale para o extrator de texto. Os dois modelos são candidatos do spike de extração do
Anotaí (`spikes/extracao/candidatos.yaml`). Custos medidos nas execuções deste módulo.

| Tier | Modelo (OpenRouter) | Quando entra | Custo estimado |
|---|---|---|---|
| 1 — barato | `google/gemini-3.5-flash-lite` | sempre, primeiro | ≈ US$ 0,00035 por mensagem; 110 mensagens por mês dão ≈ US$ 0,04 |
| 2 — caro | `google/gemini-3.8-flash` | só se o Tier 1 não convencer | ≈ US$ 0,003 a 0,006 por chamada, de 8 a 16 vezes o Tier 1 |

Tier 3 não entra: o Passo 5 diz por quê.

## Passo 2 — Calibração com dado real

Sinal de escalação: uma **pontuação calculada pelo código** sobre a resposta do Tier 1, não a
confiança que o modelo declara (no M4 ele devolveu "total" sem marcar incerto numa fala ambígua). É a
fração das checagens da RN-30 que a proposta passa: valor presente, categoria entre as elegíveis,
total × parcela coerente com a fala, e nenhum desses campos marcado como incerto pelo modelo.
Intenção desconhecida vale 0.

| Pergunta | Tipo | Esperado |
|---|---|---|
| paguei 43 e noventa no mercado agora | simples, resposta claramente certa | bastou |
| parcelei o celular em 10, deu 900 | ambígua, resposta duvidosa | duvidoso |
| me lembra de ligar pro dentista amanhã | fora do domínio | duvidoso |

Medido em [outputs/calibra-escalacao-01.md](../outputs/calibra-escalacao-01.md), só com o Tier 1:

| Pergunta | Pontuação do Tier 1 |
|---|---|
| paguei 43 e noventa no mercado agora | 1,000 |
| parcelei o celular em 10, deu 900 | 0,667 (2 de 3 checagens) |
| me lembra de ligar pro dentista amanhã | 0,000 |

**Limiar de escalação: 0,85**, entre 0,667 e 1,000, com 0,18 de folga abaixo e 0,15 acima. Como a
pontuação é uma fração de poucas checagens, qualquer checagem que falha põe a resposta abaixo dele.
A pontuação ficou estável mesmo com o modelo instável: na mesma frase ambígua o Tier 1 ora marcou
incerto, ora devolveu "total", e a checagem do código deu 0,667 nas duas vezes.

## Passo 3 — Orçamento por tenant

- **Tenant** é o `user_id`, que o PRD põe em toda tabela. A v1 tem um só, o dono. O tenant
  `convidado` representa o cenário de assinatura do PRD §1, que a v1 não constrói, e existe aqui só
  para mostrar o bloqueio, com o mês já gasto.
- **Limite**: 85% do teto de R$ 20 (fatia dos extratores mais a reserva dos lançamentos, PRD §9), à
  cotação de R$ 5,50 por US$, que arbitrei porque o PRD a deixa como configuração: US$ 3,0909 por
  mês para cada tenant.
- **Checagem antes da chamada**, com o custo máximo da requisição (embedding + Tier 1 + Tier 2, cerca
  de 2 vezes o medido), antes inclusive do embedding do cache.
- **Regra fixa fora da cascata**: operação (`pagar_fatura`, `estornar`, `quitar_parcelamento`,
  `registrar_receita`) não escala nem deixa de escalar pela pontuação. Vai sempre ao Approval Gate
  (RN-23), porque é o erro caro sem desfazer do caso. Um modelo maior não tira esse risco; o meu
  Confirmar tira.

`src/gateway.js:165` — o orçamento é verificado antes de qualquer chamada:

```js
const orc = orcamentoPermite(tenant);
if (!orc.permite) {
  console.log(`[Orçamento] BLOQUEADO antes de qualquer chamada: gasto ${orc.gasto_acumulado_usd.toFixed(6)} + máximo da requisição ${orc.maximo.toFixed(6)} > limite ${orc.limite_usd.toFixed(4)} (US$)`);
  registro.status_final = 'falhou_orcamento';
  return registro;
}
```

`src/gateway.js:209` — a regra fixa, antes da decisão de escalar:

```js
if (OPERACOES.includes(proposta.intencao)) {
  // Regra fixa, fora da cascata: operação vai ao Approval Gate qualquer que seja a pontuação.
  console.log('[Model Tiering] operação: regra fixa, fora da cascata → Approval Gate (RN-23)');
} else if (registro.pontuacao_tier1 < LIMIAR_ESCALACAO) {
```

Uma linha da trilha ([gateway-02.audit-trail.jsonl](../outputs/gateway-02.audit-trail.jsonl)), com
tier, escalação, gasto acumulado e limite do tenant:

```json
{"tenant":"dono","mensagem":"parcelei o celular em 10, deu 900","modelo":"google/gemini-3.8-flash","tier_usado":2,"escalou":true,"pontuacao_tier1":0.667,"pontuacao_tier2":0.667,"custo_usd":0.003091,"gasto_acumulado_usd":0.003444,"limite_tenant_usd":3.0909}
```

## Passo 4 — Log de execução (três comportamentos)

Execução com `stdin: t` ([outputs/gateway-02.md](../outputs/gateway-02.md), US$ 0,003444). A
primeira ([gateway-01](../outputs/gateway-01.md)) mostrou o Tier 2 custando ≈ US$ 0,0057, quase 4
vezes a estimativa que eu usava na checagem de orçamento; corrigi a estimativa e rodei de novo.

**Tier 1 resolve sozinho**

```text
[Gateway] Tenant "dono" — mensagem: "paguei 43 e noventa no mercado agora"
[Model Tiering] Tier 1 → google/gemini-3.5-flash-lite
[Model Tiering] pontuação 1 ≥ 0.85 → Tier 1 bastou
[Orquestrador] grava e mostra: mercado R$ 43,90
[Orçamento] tenant "dono": gasto acumulado 0.000353 / limite 3.0909 (US$)
```

**Escala para o Tier 2**

```text
[Gateway] Tenant "dono" — mensagem: "parcelei o celular em 10, deu 900"
[Model Tiering] Tier 1 → google/gemini-3.5-flash-lite
[Model Tiering] pontuação 0.667 < 0.85 → escalando para o Tier 2 (google/gemini-3.8-flash)
[Model Tiering] pontuação do Tier 2: 0.667
[Confiança] valor_informado_e="total" do modelo, mas a fala não casa com "Nx de V" nem com "V em Nx" → incerto (marcado pelo código)
[Approval Gate] R$ 900,00 em 10x: o extrator não distinguiu total de parcela (RN-2). Total ou parcela? (t/p) → dono respondeu "t"
[Orçamento] tenant "dono": gasto acumulado 0.003444 / limite 3.0909 (US$)
```

**Bloqueado por orçamento antes de qualquer chamada**

```text
[Gateway] Tenant "convidado" — mensagem: "paguei 30 na padaria"
[Orçamento] BLOQUEADO antes de qualquer chamada: gasto 3.090900 + máximo da requisição 0.012710 > limite 3.0909 (US$)
[Audit Trail] status_final: falhou_orcamento
```

## Passo 5 — Reflexão final

Uma das duas mensagens do dono escalou, e o Tier 2 ficou na mesma pontuação porque a dúvida estava
na fala, não no modelo; por isso o sinal para um terceiro tier seria as mensagens escaladas que o
Tier 2 também deixa abaixo de 0,85 passarem a ser de leitura difícil (cupom em papel térmico, áudio
de rua) e não de fala ambígua, que nenhum modelo resolve e o Approval Gate da RN-2 já resolve.
