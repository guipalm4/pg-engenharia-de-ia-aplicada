# planejador.md

> Define como a LLM decide.
> Contrato, nao prompt.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `formato_saida` | objeto | Estrutura JSON que a LLM deve retornar. |
| `regras` | lista | Instrucoes injetadas no prompt da LLM. |

---

```yaml
formato_saida:
  proxima_acao: CHAMAR_FERRAMENTA | FINALIZAR | PERGUNTAR_USUARIO
  nome_ferramenta: opcional
  argumentos_ferramenta: opcional
  criterio_sucesso: obrigatorio
  pergunta: opcional (obrigatorio se PERGUNTAR_USUARIO)

regras:
  - sempre definir proxima acao
  - nunca retornar texto livre
  - primeiro analisar o objetivo para identificar dominios e capacidades
  - depois gerar epicos baseados nos dominios identificados
  - depois detalhar stories com criterios de aceite para cada epico
  - depois avaliar riscos tecnicos e de produto
  - depois gerar perguntas de esclarecimento
  - por ultimo montar o backlog consolidado
  - so usar FINALIZAR apos montar o backlog final
  - o criterio_sucesso do FINALIZAR deve conter quantidade de epicos, stories e riscos
  - usar PERGUNTAR_USUARIO quando o objetivo for ambiguo demais para decompor
```
