---
script: src/gateway.js
comando: node gateway.js  (stdin: s,t)
modelos:
  - const MODELO_BARATO = 'google/gemini-3.5-flash-lite'
  - const MODELO_EMBEDDING = 'openai/text-embedding-3-small'
  - const MODELO_FOTO = 'google/gemini-3.8-flash'
engine: OpenRouter
node: v24.14.1
custo_total_usd: 0.000808
exit_code: 0
trilha: gateway-02.audit-trail.jsonl
gerado_em: 2026-10-15
---

```text
[Config] barato=google/gemini-3.5-flash-lite · foto=google/gemini-3.8-flash · embedding=openai/text-embedding-3-small · limiar_cache=0.93

[Gateway] Mensagem: "quanto já gastei esse mês?"
[Semantic Cache] MISS (0.000 < 0.93)
[Model Router] texto → google/gemini-3.5-flash-lite (barato)
[Extrator] {"intencao":"consultar","gastos":[],"operacao":null,"consulta":{"tipo":"mes"}}
[Router] consulta mes → regra; interpretação guardada no cache
[Orquestrador] outubro até 2026-10-15: essencial R$ 308,50 · não essencial R$ 208,40 · a classificar R$ 38,20
[Audit Trail] status_final: respondido

[Gateway] Mensagem: "quanto eu gastei neste mês?"
[Semantic Cache] HIT (0.951 ≥ 0.93) com "quanto já gastei esse mês?" → consulta mes, sem chamar o extrator
[Orquestrador] outubro até 2026-10-15: essencial R$ 308,50 · não essencial R$ 208,40 · a classificar R$ 38,20
[Audit Trail] status_final: respondido_via_cache

[Gateway] Mensagem: "paguei a fatura do Nubank, 2 mil"
[Semantic Cache] MISS (0.523 < 0.93)
[Model Router] texto → google/gemini-3.5-flash-lite (barato)
[Extrator] {"intencao":"pagar_fatura","operacao":{"cartao_apelido":"Nubank","valor":2000}}
[Approval Gate] pagar_fatura {"cartao_apelido":"Nubank","valor":2000}: gate obrigatório (RN-23). Confirmar? (s/n) → dono respondeu "s"
[Audit Trail] status_final: executado_apos_confirmar

[Gateway] Mensagem: "parcelei o celular em 10, deu 900"
[Semantic Cache] MISS (0.438 < 0.93)
[Model Router] texto → google/gemini-3.5-flash-lite (barato)
[Extrator] {"intencao":"lancar_despesa","gastos":[{"valor":900,"parcelas":10,"valor_informado_e":"total","descricao":"celular","estabelecimento":null,"categoria":"Eletrônicos","campos_incertos":[]}]}
[Orquestrador] grava e mostra: celular R$ 900,00
[Audit Trail] status_final: gravado

[Custo] total: US$ 0.000808
```
