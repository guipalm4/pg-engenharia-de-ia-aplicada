# planejador.md

> Define como o agente decide o proximo passo.
> Saida sempre estruturada em JSON.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `formato_saida` | string | Formato da resposta do planejador. |
| `campos` | lista | Campos obrigatorios na resposta. |
| `regras` | lista | Restricoes do planejador. |

---

```yaml
formato_saida: json

campos:
  - proxima_acao
  - nome_ferramenta
  - argumentos_ferramenta
  - criterio_sucesso

regras:
  - analisar os dados do trace na ordem: saude, performance, conformidade, anomalias, veredito
  - cada ferramenta deve receber como argumento os dados relevantes extraidos do trace
  - nao chamar gerar_veredito sem ter resultados das 4 analises anteriores
  - proxima_acao deve ser exatamente CHAMAR_FERRAMENTA, FINALIZAR ou PERGUNTAR_USUARIO
```
