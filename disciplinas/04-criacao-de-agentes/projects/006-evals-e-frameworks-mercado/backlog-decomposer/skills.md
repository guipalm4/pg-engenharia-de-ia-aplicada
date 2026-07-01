# habilidades.md

> Define as ferramentas do decomposer.
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
  - nome: analisar_objetivo
    descricao: analisa o objetivo de produto e identifica dominios, personas e capacidades envolvidas
    entrada:
      objetivo: string
      contexto_adicional: string
    saida:
      dominios: list
      personas: list
      capacidades: list
      restricoes: list

  - nome: gerar_epicos
    descricao: gera epicos a partir dos dominios e capacidades identificados
    entrada:
      dominios: list
      capacidades: list
      restricoes: list
    saida:
      epicos: list
      dependencias: list

  - nome: detalhar_stories
    descricao: cria user stories com criterios de aceite para cada epico
    entrada:
      epicos: list
      personas: list
    saida:
      stories: list
      criterios_aceite: list

  - nome: avaliar_riscos
    descricao: identifica riscos tecnicos e de produto para os epicos e stories
    entrada:
      epicos: list
      stories: list
      restricoes: list
    saida:
      riscos: list
      mitigacoes: list

  - nome: gerar_perguntas
    descricao: gera perguntas de esclarecimento para stakeholders sobre gaps identificados
    entrada:
      epicos: list
      riscos: list
      restricoes: list
    saida:
      perguntas: list
      prioridade_perguntas: list

  - nome: montar_backlog
    descricao: monta o backlog final consolidado com todos os artefatos coletados
    entrada:
      epicos: list
      stories: list
      criterios_aceite: list
      riscos: list
      perguntas: list
    saida:
      backlog: object
      resumo: string
```
