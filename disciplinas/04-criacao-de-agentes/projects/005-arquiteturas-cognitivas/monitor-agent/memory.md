# memoria.md

> Define a memoria curta do agente.
> O que guardar. O que descartar.
> Como resumir a execucao no final.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `memoria_curta` | objeto | Configuracao da memoria operacional do agente durante a execucao. |
| `memoria_curta.guardar` | lista | Tipos de informacao que devem ser retidos no historico. |
| `memoria_curta.descartar` | lista | Tipos de informacao que NAO devem poluir o historico. |
| `memoria_curta.max_registros` | int | Numero maximo de registros mantidos na memoria curta. Registros mais antigos sao resumidos. |
| `resumo_final` | objeto | Como o agente deve resumir a execucao ao terminar. |
| `resumo_final.max_linhas` | int | Numero maximo de linhas no resumo final. |
| `resumo_final.campos` | lista | Campos obrigatorios no resumo. |

---

```yaml
memoria_curta:
  guardar:
    - resultado_de_ferramenta
    - decisao_do_planejador
    - evidencia_coletada
    - erro_encontrado
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
