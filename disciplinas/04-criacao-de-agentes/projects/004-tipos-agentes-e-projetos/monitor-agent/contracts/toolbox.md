# caixa_ferramentas.md

> Define o que o agente pode fazer.
> Quais ferramentas existem. Quais parametros aceitam.
> Se nao esta aqui — o agente nao pode executar.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `ferramentas` | lista | Lista de ferramentas disponiveis para o agente. |
| `ferramentas[].nome` | string | Identificador unico da ferramenta. Deve ser o mesmo nome usado em `skills.md` e `rules.md`. |
| `ferramentas[].entrada` | objeto | Parametros que a ferramenta aceita. Cada chave e o nome do parametro e o valor e o tipo (`string`, `int`, `float`, `bool`, `list`, `object`). |

> **Nota:** este contrato define apenas quais ferramentas existem e seus parametros.
> A descricao completa (com saidas) fica em `skills.md`.
> As restricoes de uso ficam em `rules.md`.

---

```yaml
ferramentas:
  - nome: consultar_metricas
    entrada:
      nome_servico: string
      janela_tempo_minutos: int

  - nome: buscar_logs
    entrada:
      nome_servico: string
      janela_tempo_minutos: int
      nivel_minimo: string

  - nome: historico_deploys
    entrada:
      nome_servico: string
      janela_tempo_horas: int

  - nome: relatorio_incidente
    entrada:
      nome_servico: string
      severidade: string
      evidencia: object
      recomendacao: object
```
