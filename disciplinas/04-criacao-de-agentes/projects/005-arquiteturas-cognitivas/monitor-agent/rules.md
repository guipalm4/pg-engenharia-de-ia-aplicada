# regras.md

> Protege o sistema.
> Evita loop infinito.
> Define comportamento seguro.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `ferramentas_obrigatorias` | lista | Ferramentas que devem ser chamadas antes de permitir FINALIZAR. O runtime impede o encerramento enquanto alguma ferramenta desta lista nao tiver sido executada. |
| `limites.max_etapas` | int | Numero maximo de iteracoes do ciclo. Sobrescreve o valor do `loop.md` se ambos existirem. |
| `limites.chamadas_ferramenta` | objeto | Limites de chamadas por ferramenta. Cada chave e o nome da ferramenta e o valor e o maximo permitido. |
| `limites.chamadas_ferramenta.total` | int | Limite total de chamadas somando todas as ferramentas. |
| `politicas` | lista | Regras de comportamento injetadas no prompt da LLM como texto. O runtime nao interpreta — apenas repassa. Servem para guiar a LLM sobre quando e como usar as ferramentas. |
| `limites.sem_progresso` | int | Numero de etapas consecutivas sem progresso antes de encerrar. Detecta estagnacao quando o agente repete as mesmas ferramentas sem avancar. |
| `limites.limite_tempo_segundos` | int | Tempo maximo de execucao em segundos. O ciclo encerra ao atingir esse limite. |
| `acoes_sensiveis` | lista | Ferramentas que requerem confirmacao humana antes de executar. O runtime pausa e pede confirmacao no terminal. |

---

```yaml
ferramentas_obrigatorias:
  - relatorio_incidente

limites:
  max_etapas: 10
  sem_progresso: 3
  limite_tempo_segundos: 120
  chamadas_ferramenta:
    consultar_metricas: 3
    buscar_logs: 3
    historico_deploys: 2
    relatorio_incidente: 1
    total: 9

acoes_sensiveis:
  - rollback_deploy

politicas:
  - parar se nao houver progresso apos 3 tentativas consecutivas
  - relatorio_incidente e obrigatorio antes de finalizar
  - relatorio_incidente so pode ser chamado apos coletar evidencias
  - os argumentos evidencia e recomendacao do relatorio_incidente devem conter dados reais coletados
  - rollback requer confirmacao humana
```
