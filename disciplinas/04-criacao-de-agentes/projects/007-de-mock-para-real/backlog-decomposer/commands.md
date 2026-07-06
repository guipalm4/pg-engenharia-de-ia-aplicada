# comandos.md

> Operacao do agente como produto.

---

```yaml
comandos:
  - nome: rodar
    descricao: executa o agente com um objetivo de produto
    argumentos:
      - nome: --agente
        obrigatorio: true
        descricao: caminho para a pasta do agente
      - nome: --entrada
        obrigatorio: true
        descricao: objetivo de produto (ex. "permitir onboarding self-service")
      - nome: --modo
        obrigatorio: false
        descricao: modo de operacao (task_based, interactive, goal_oriented, autonomous)
    exemplo: "python main.py rodar --agente ../backlog-decomposer --entrada 'permitir onboarding self-service para novos usuarios'"

  - nome: validar
    descricao: valida se os contratos estao completos
    exemplo: "python main.py validar --agente ../backlog-decomposer"

  - nome: rastreamento
    descricao: exibe o rastreamento da ultima execucao
    exemplo: "python main.py rastreamento"

  - nome: replay
    descricao: reexecuta com a mesma entrada da ultima execucao
    exemplo: "python main.py replay --agente ../backlog-decomposer"
```
