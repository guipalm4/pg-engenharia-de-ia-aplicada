# regras.md

> Protege o sistema.
> Evita loop infinito.
> Define comportamento seguro.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `ferramentas_obrigatorias` | lista | Ferramentas que devem ser chamadas antes de FINALIZAR. |
| `limites.max_etapas` | int | Numero maximo de iteracoes do ciclo. |
| `limites.sem_progresso` | int | Etapas consecutivas sem progresso antes de encerrar. |
| `limites.limite_tempo_segundos` | int | Tempo maximo de execucao. |
| `limites.chamadas_ferramenta` | objeto | Limites por ferramenta e total. |
| `acoes_sensiveis` | lista | Ferramentas que requerem confirmacao humana. |
| `politicas` | lista | Regras injetadas no prompt da LLM. |

---

```yaml
ferramentas_obrigatorias:
  - analisar_saude
  - analisar_performance
  - analisar_conformidade
  - detectar_anomalias
  - gerar_veredito

limites:
  max_etapas: 8
  sem_progresso: 3
  limite_tempo_segundos: 180
  max_tokens: 100000
  chamadas_ferramenta:
    analisar_saude: 1
    analisar_performance: 1
    analisar_conformidade: 1
    detectar_anomalias: 1
    gerar_veredito: 1
    total: 5

acoes_sensiveis: []

politicas:
  - sempre analisar saude antes de performance
  - sempre analisar conformidade antes de detectar anomalias
  - gerar_veredito e obrigatorio e so pode ser chamado apos as 4 analises anteriores
  - anomalias devem ser especificas e citar etapas, valores e thresholds
  - o veredito deve ser objetivo e acionavel, sem jargao generico
  - nunca inventar dados que nao estejam no trace
  - se o trace nao tiver dados suficientes para uma analise, registrar como "dados insuficientes" em vez de inferir
  - recomendacoes devem indicar se a correcao e no runtime ou nos contratos do agente
```
