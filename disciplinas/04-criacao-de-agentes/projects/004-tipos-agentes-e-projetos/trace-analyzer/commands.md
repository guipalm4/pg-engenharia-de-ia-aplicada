# comandos.md

> Comandos disponiveis para o operador.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `comandos` | lista | Operacoes disponiveis. |

---

```yaml
comandos:
  - nome: rodar
    descricao: analisa o ultimo trace gerado pelo runtime
    argumentos:
      - nome: --agente
        descricao: caminho do agente trace-analyzer
        obrigatorio: true
      - nome: --entrada
        descricao: caminho ou nome do trace a analisar (usa ultimo trace por default)
        obrigatorio: true
    exemplo: python3 main.py rodar --agente ../trace-analyzer --entrada "analisar ultimo trace"

  - nome: rastreamento
    descricao: exibe o rastreamento da analise
    exemplo: python3 main.py rastreamento
```
