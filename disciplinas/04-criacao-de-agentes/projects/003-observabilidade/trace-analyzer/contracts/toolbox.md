# caixa_ferramentas.md

> Define o que o agente pode fazer.
> Se nao esta aqui, o agente nao pode executar.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `ferramentas` | lista | Ferramentas disponiveis. |
| `ferramentas[].nome` | string | Identificador da ferramenta. |
| `ferramentas[].entrada` | objeto | Parametros aceitos. |

---

```yaml
ferramentas:
  - nome: analisar_saude
    entrada:
      health_metrics: object
      etapas: list

  - nome: analisar_performance
    entrada:
      performance_data: object
      tempo_total_segundos: float
      tokens_consumidos: object

  - nome: analisar_conformidade
    entrada:
      etapas: list
      health_metrics: object
      ferramentas_esperadas: list

  - nome: detectar_anomalias
    entrada:
      etapas: list
      performance_data: object
      tipo_agente: string

  - nome: gerar_veredito
    entrada:
      saude: object
      performance: object
      conformidade: object
      anomalias: list
```
