# memoria.md

> Memoria curta do agente.
> O que guardar, o que descartar, como resumir.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `memoria_curta` | objeto | Configuracao da memoria operacional. |
| `memoria_curta.guardar` | lista | Informacoes retidas no historico. |
| `memoria_curta.descartar` | lista | Informacoes descartadas. |
| `memoria_curta.max_registros` | int | Maximo de registros na memoria curta. |
| `resumo_final` | objeto | Como resumir a execucao. |

---

```yaml
memoria_curta:
  guardar:
    - resultado_de_ferramenta
    - decisao_do_planejador
    - epicos_gerados
    - stories_detalhadas
    - riscos_identificados
    - perguntas_geradas
  descartar:
    - prompt_sistema_completo
    - argumentos_mock_internos
    - dados_de_entrada_repetidos
  max_registros: 20

resumo_final:
  max_linhas: 5
  campos:
    - objetivo
    - etapas_executadas
    - ferramentas_chamadas
    - resultado_final
    - proximos_passos
```
