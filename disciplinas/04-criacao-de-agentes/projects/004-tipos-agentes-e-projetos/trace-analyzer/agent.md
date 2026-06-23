# agent.md

> Identidade do agente.
> Analisa traces de execucao de qualquer agente e gera diagnostico estruturado.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `nome` | string | Identificador unico do agente. |
| `descricao` | string | O que o agente faz em uma frase. |
| `tipo` | string | Modo de operacao. |
| `objetivo` | string | O que o agente deve alcancar. |
| `contrato_saida` | objeto | Estrutura do artefato final. |

---

```yaml
nome: trace-analyzer
descricao: analisa o trace de execucao de qualquer agente e gera diagnostico de saude, performance e conformidade
tipo: task_based

objetivo: diagnosticar_execucao

contrato_saida:
  formato: json
  campos_obrigatorios:
    - saude
    - performance
    - conformidade
    - anomalias
    - veredito
  exemplo:
    saude:
      taxa_sucesso: 100.0
      circuit_breaker: 0
      payload_invalido: 0
      qualidade: "6/6 ok, 0 parcial, 0 falha"
    performance:
      tempo_usado_pct: 69
      tokens_usado_pct: 69
      latencia_planejar_tendencia: "crescente"
      latencia_agir_media_ms: 11412
    conformidade:
      ferramentas_obrigatorias_chamadas: true
      pipeline_completo: true
      guardrails_ativados: 1
    anomalias:
      - "latencia do planejar cresceu 8x entre etapa 1 e etapa 6"
    veredito: "execucao saudavel - pipeline completo, zero alertas, tokens dentro do limite"
```
