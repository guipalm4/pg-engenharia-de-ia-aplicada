# caixa_ferramentas.md

> Define o que o agente pode fazer.
> Se nao esta aqui, o agente nao pode executar.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `ferramentas` | lista | Ferramentas disponiveis. |
| `ferramentas[].nome` | string | Identificador da ferramenta. |
| `ferramentas[].entrada` | objeto | Parametros aceitos. |

---

```yaml
ferramentas:
  - nome: analisar_objetivo
    entrada:
      objetivo: string
      contexto_adicional: string

  - nome: gerar_epicos
    entrada:
      dominios: list
      capacidades: list
      restricoes: list

  - nome: detalhar_stories
    entrada:
      epicos: list
      personas: list

  - nome: avaliar_riscos
    entrada:
      epicos: list
      stories: list
      restricoes: list

  - nome: gerar_perguntas
    entrada:
      epicos: list
      riscos: list
      restricoes: list

  - nome: montar_backlog
    entrada:
      epicos: list
      stories: list
      criterios_aceite: list
      riscos: list
      perguntas: list
```
