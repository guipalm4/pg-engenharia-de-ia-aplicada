# habilidades.md

> Define as ferramentas do analyzer.
> Nao implementa. So define interface.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `habilidades` | lista | Ferramentas que o agente sabe usar. |
| `habilidades[].nome` | string | Identificador unico da ferramenta. |
| `habilidades[].descricao` | string | Quando e por que usar esta ferramenta. |
| `habilidades[].entrada` | objeto | Parametros de entrada (chave: tipo). |
| `habilidades[].saida` | objeto | Campos retornados (chave: tipo). |

---

```yaml
habilidades:
  - nome: analisar_saude
    descricao: analisa metricas de saude do trace - taxa de sucesso, circuit breaker, payload invalido, qualidade das avaliacoes
    entrada:
      health_metrics: object
      etapas: list
    saida:
      taxa_sucesso: float
      circuit_breaker_ativacoes: int
      payload_invalido: int
      qualidade_resumo: string
      problemas: list

  - nome: analisar_performance
    descricao: analisa performance temporal - tempo total vs limite, tokens vs limite, tendencia de latencia por fase, gargalos
    entrada:
      performance_data: object
      tempo_total_segundos: float
      tokens_consumidos: object
    saida:
      tempo_usado_pct: float
      tokens_usado_pct: float
      latencia_planejar_tendencia: string
      latencia_agir_media_ms: float
      gargalos: list

  - nome: analisar_conformidade
    descricao: verifica se o agente seguiu seus contratos - ferramentas obrigatorias, pipeline completo, limites respeitados, guardrails ativados
    entrada:
      etapas: list
      health_metrics: object
      ferramentas_esperadas: list
    saida:
      ferramentas_obrigatorias_chamadas: bool
      pipeline_completo: bool
      guardrails_ativados: int
      violacoes: list

  - nome: detectar_anomalias
    descricao: identifica padroes anomalos - latencia crescente, etapas improdutivas, perguntas sem resposta em modo nao-interativo, finalizacao prematura
    entrada:
      etapas: list
      performance_data: object
      tipo_agente: string
    saida:
      anomalias: list
      severidade: string

  - nome: gerar_veredito
    descricao: consolida todas as analises anteriores e gera um veredito final com recomendacoes acionaveis
    entrada:
      saude: object
      performance: object
      conformidade: object
      anomalias: list
    saida:
      veredito: string
      recomendacoes: list
```
