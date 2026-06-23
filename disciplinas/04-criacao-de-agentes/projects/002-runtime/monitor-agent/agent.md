# agent.md

> Identidade do agente.
> O que ele e, o que entrega, como se comporta.
> Sem isso, o agente e generico demais.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `nome` | string | Identificador unico do agente. |
| `descricao` | string | O que o agente faz em uma frase. |
| `tipo` | string | Modo de operacao: `task_based`, `interactive`, `goal_oriented` ou `autonomous`. |
| `objetivo` | string | O que o agente deve alcancar. |
| `contrato_saida` | objeto | Estrutura do artefato final que o agente entrega. |
| `contrato_saida.formato` | string | Tipo do artefato: `json`, `texto`, `relatorio`. |
| `contrato_saida.campos_obrigatorios` | lista | Campos que devem estar presentes no artefato final. |
| `contrato_saida.exemplo` | objeto | Exemplo de saida esperada. |

> **Tipos de agente:**
> - `task_based` — recebe tarefa bem definida, executa em poucas etapas, entrega artefato final
> - `interactive` — faz perguntas para remover ambiguidade antes de agir
> - `goal_oriented` — recebe objetivo amplo e transforma em plano executavel
> - `autonomous` — responde a eventos/triggers com limites rigidos

---

```yaml
nome: monitor-agent
descricao: agente de monitoramento e diagnostico de incidentes de producao
tipo: task_based

objetivo: resolver_incidente

contrato_saida:
  formato: json
  campos_obrigatorios:
    - diagnostico
    - evidencias
    - recomendacao
    - severidade
  exemplo:
    diagnostico: "latencia elevada causada por deploy recente"
    evidencias:
      metricas: "p99=450ms, erro=12%"
      logs: "timeout em upstream-service"
      deploys: "v2.3.1 ha 30 min"
    recomendacao: "rollback para v2.3.0"
    severidade: "alta"
```
