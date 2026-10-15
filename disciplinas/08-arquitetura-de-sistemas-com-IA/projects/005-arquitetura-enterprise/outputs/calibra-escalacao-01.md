---
script: src/calibra-escalacao.js
comando: node calibra-escalacao.js
modelos:
  - const MODELO_BARATO = 'google/gemini-3.5-flash-lite'
  - const MODELO_EMBEDDING = 'openai/text-embedding-3-small'
  - const MODELO_FOTO = 'google/gemini-3.8-flash'
  - const MODELO_TIER2 = 'google/gemini-3.8-flash'
engine: OpenRouter
node: v24.14.1
custo_total_usd: 0.000943
exit_code: 0
trilha: —
gerado_em: 2026-10-15
---

```text
[Calibração] Tier 1=google/gemini-3.5-flash-lite · 3 perguntas
[Extrator] "paguei 43 e noventa no mercado agora" → {"intencao":"lancar_despesa","gastos":[{"valor":43.9,"parcelas":null,"valor_informado_e":"total","descricao":"mercado","estabelecimento":null,"categoria":"Mercado","campos_incertos":[]}]}
[Extrator] "parcelei o celular em 10, deu 900" → {"intencao":"lancar_despesa","gastos":[{"valor":900,"parcelas":10,"valor_informado_e":null,"descricao":"celular","estabelecimento":null,"categoria":"Eletrônicos","campos_incertos":["valor_informado_e"]}]}
[Extrator] "me lembra de ligar pro dentista amanhã" → {"intencao":"desconhecida","gastos":[],"operacao":null,"consulta":null}
| Pergunta | Tipo | Esperado | Pontuação do Tier 1 |
|---|---|---|---|
| paguei 43 e noventa no mercado agora | simples | bastou | 1.000 |
| parcelei o celular em 10, deu 900 | ambígua | duvidoso | 0.667 |
| me lembra de ligar pro dentista amanhã | fora do domínio | duvidoso | 0.000 |
[Custo] total: US$ 0.000943
```
