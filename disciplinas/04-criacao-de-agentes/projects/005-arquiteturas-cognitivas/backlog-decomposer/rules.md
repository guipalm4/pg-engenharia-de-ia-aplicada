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
  - montar_backlog

limites:
  max_etapas: 12
  sem_progresso: 3
  limite_tempo_segundos: 180
  chamadas_ferramenta:
    analisar_objetivo: 2
    gerar_epicos: 2
    detalhar_stories: 2
    avaliar_riscos: 2
    gerar_perguntas: 2
    montar_backlog: 1
    total: 11

acoes_sensiveis: []

politicas:
  - sempre analisar o objetivo antes de gerar epicos
  - epicos devem ter descricao orientada a valor de negocio, nao a implementacao tecnica
  - stories devem seguir formato "Como [persona], quero [acao], para [beneficio]"
  - criterios de aceite devem ser verificaveis e sem ambiguidade
  - riscos devem incluir impacto e mitigacao
  - perguntas devem ser direcionadas a stakeholders especificos
  - montar_backlog e obrigatorio antes de finalizar
  - montar_backlog so pode ser chamado apos coletar epicos, stories, riscos e perguntas
  - nunca inventar metricas ou dados de mercado
  - se o objetivo for ambiguo, gerar perguntas de esclarecimento antes de detalhar stories
```
