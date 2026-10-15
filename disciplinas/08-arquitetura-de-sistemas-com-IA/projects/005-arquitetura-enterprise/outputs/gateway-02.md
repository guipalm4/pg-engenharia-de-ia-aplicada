---
script: src/gateway.js
comando: node gateway.js  (stdin: t)
modelos:
  - const MODELO_BARATO = 'google/gemini-3.5-flash-lite'
  - const MODELO_EMBEDDING = 'openai/text-embedding-3-small'
  - const MODELO_FOTO = 'google/gemini-3.8-flash'
  - const MODELO_TIER2 = 'google/gemini-3.8-flash'
engine: OpenRouter
node: v24.14.1
custo_total_usd: 0.003444
exit_code: 0
trilha: gateway-02.audit-trail.jsonl
gerado_em: 2026-10-15
---

```text
[Config] tier1=google/gemini-3.5-flash-lite · tier2=google/gemini-3.8-flash · embedding=openai/text-embedding-3-small · limiar_cache=0.93 · limiar_escalacao=0.85

[Gateway] Tenant "dono" — mensagem: "paguei 43 e noventa no mercado agora"
[Semantic Cache] MISS (0.000 < 0.93)
[Model Tiering] Tier 1 → google/gemini-3.5-flash-lite
[Extrator] {"intencao":"lancar_despesa","gastos":[{"valor":43.9,"parcelas":null,"valor_informado_e":"total","descricao":"mercado","estabelecimento":null,"categoria":"Mercado","campos_incertos":[]}]}
[Model Tiering] pontuação 1 ≥ 0.85 → Tier 1 bastou
[Orquestrador] grava e mostra: mercado R$ 43,90
[Orçamento] tenant "dono": gasto acumulado 0.000353 / limite 3.0909 (US$)
[Audit Trail] status_final: gravado

[Gateway] Tenant "dono" — mensagem: "parcelei o celular em 10, deu 900"
[Semantic Cache] MISS (0.000 < 0.93)
[Model Tiering] Tier 1 → google/gemini-3.5-flash-lite
[Extrator] {"intencao":"lancar_despesa","gastos":[{"valor":900,"parcelas":10,"valor_informado_e":null,"descricao":"celular","estabelecimento":null,"categoria":"Eletrônicos","campos_incertos":["valor_informado_e"]}]}
[Model Tiering] pontuação 0.667 < 0.85 → escalando para o Tier 2 (google/gemini-3.8-flash)
[Extrator] {"intencao":"lancar_despesa","gastos":[{"valor":900,"parcelas":10,"valor_informado_e":"total","descricao":"celular","estabelecimento":null,"categoria":"Eletrônicos","campos_incertos":[]}]}
[Model Tiering] pontuação do Tier 2: 0.667
[Confiança] valor_informado_e="total" do modelo, mas a fala não casa com "Nx de V" nem com "V em Nx" → incerto (marcado pelo código)
[Approval Gate] R$ 900,00 em 10x: o extrator não distinguiu total de parcela (RN-2). Total ou parcela? (t/p) → dono respondeu "t"
[Orçamento] tenant "dono": gasto acumulado 0.003444 / limite 3.0909 (US$)
[Audit Trail] status_final: gravado_apos_escolha

[Gateway] Tenant "convidado" — mensagem: "paguei 30 na padaria"
[Orçamento] BLOQUEADO antes de qualquer chamada: gasto 3.090900 + máximo da requisição 0.012710 > limite 3.0909 (US$)
[Orçamento] tenant "convidado": gasto acumulado 3.090900 / limite 3.0909 (US$)
[Audit Trail] status_final: falhou_orcamento

[Custo] total: US$ 0.003444
```
