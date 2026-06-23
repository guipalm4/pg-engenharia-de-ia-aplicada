# memoria.md

> Define o que o agente lembra entre etapas.
> Memoria curta: so dura uma execucao.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `memoria_curta.guardar` | lista | O que manter entre etapas. |
| `memoria_curta.descartar` | lista | O que descartar entre etapas. |
| `resumo_final` | objeto | Configuracao do resumo ao finalizar. |

---

```yaml
memoria_curta:
  guardar:
    - resultado de cada analise (saude, performance, conformidade, anomalias)
    - dados do trace usados como evidencia
    - problemas e anomalias detectados
  descartar:
    - prompt interno da LLM
    - dados brutos do trace ja processados

resumo_final:
  campos:
    - agente_analisado
    - veredito
    - anomalias
    - recomendacoes
  max_linhas: 8
```
