---
script: src/calibra-limiar.js
comando: node calibra-limiar.js
modelos:
  - const MODELO_EMBEDDING = 'openai/text-embedding-3-small'
engine: OpenRouter
node: v24.14.1
custo_total_usd: 0.000003
exit_code: 0
trilha: —
gerado_em: 2026-10-15
---

```text
[Calibração] modelo=openai/text-embedding-3-small · 8 pares · 12 textos
| Par | Esperado | Similaridade |
|---|---|---|
| 1 | parecida | 0.951 |
| 2 | parecida | 0.763 |
| 3 | parecida | 0.824 |
| 4 | parecida | 0.492 |
| 5 | diferente | 0.901 |
| 6 | diferente | 0.553 |
| 7 | diferente | 0.555 |
| 8 | diferente | 0.688 |
[Calibração] parecidas: mín 0.492 · máx 0.951
[Calibração] diferentes: mín 0.553 · máx 0.901
[Custo] total: US$ 0.000003
```
