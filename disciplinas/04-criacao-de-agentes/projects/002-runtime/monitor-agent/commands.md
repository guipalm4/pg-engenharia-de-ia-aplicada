# comandos.md

> Define a operacao do agente como produto.
> Cada comando e uma acao que o operador pode executar.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `comandos` | lista | Lista de comandos disponiveis na CLI. |
| `comandos[].nome` | string | Nome do comando (usado no terminal). |
| `comandos[].descricao` | string | O que o comando faz. |
| `comandos[].argumentos` | lista | Parametros aceitos pelo comando. |
| `comandos[].exemplo` | string | Exemplo de uso. |

---

```yaml
comandos:
  - nome: rodar
    descricao: executa o agente com uma entrada
    argumentos:
      - nome: --agente
        obrigatorio: true
        descricao: caminho para a pasta do agente
      - nome: --entrada
        obrigatorio: true
        descricao: texto de entrada (ex. alerta)
      - nome: --modo
        obrigatorio: false
        descricao: modo de operacao (task_based, interactive, goal_oriented, autonomous)
      - nome: --evento
        obrigatorio: false
        descricao: evento trigger para modo autonomous (ex. alerta_cpu, deploy_falhou)
    exemplo: "python main.py rodar --agente ../monitor-agent --entrada 'alerta de latencia'"

  - nome: validar
    descricao: valida se os contratos do agente estao completos e consistentes
    argumentos:
      - nome: --agente
        obrigatorio: true
        descricao: caminho para a pasta do agente
    exemplo: "python main.py validar --agente ../monitor-agent"

  - nome: rastreamento
    descricao: exibe o rastreamento da ultima execucao
    argumentos: []
    exemplo: "python main.py rastreamento"

  - nome: replay
    descricao: reexecuta o agente com a mesma entrada da ultima execucao
    argumentos:
      - nome: --agente
        obrigatorio: true
        descricao: caminho para a pasta do agente
    exemplo: "python main.py replay --agente ../monitor-agent"
```
