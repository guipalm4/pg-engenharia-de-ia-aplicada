# ciclo.md

> Define como o agente roda.
> Controla o ciclo inteiro.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `objetivo` | string | O que o agente deve alcancar. |
| `ciclo.max_etapas` | int | Numero maximo de iteracoes. |
| `condicoes_parada` | lista | Situacoes que encerram o ciclo. |

---

```yaml
objetivo: diagnosticar_execucao

ciclo:
  max_etapas: 8

condicoes_parada:
  - objetivo_alcancado
  - max_etapas_excedido
  - sem_progresso
  - limite_tempo_excedido
```
