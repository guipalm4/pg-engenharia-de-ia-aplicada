# ganchos.md

> Permite observar e intervir.
> Antes. Depois. Erro.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `ganchos` | objeto | Mapeamento de eventos do ciclo para acoes. O runtime dispara o gancho no momento correspondente. |
| `ganchos.antes_da_etapa` | string | Disparado antes de cada etapa do ciclo. Util para log de progresso e checagem de budget. |
| `ganchos.apos_etapa` | string | Disparado apos cada etapa do ciclo. Util para registrar resultado da etapa. |
| `ganchos.antes_da_acao` | string | Disparado antes de executar uma ferramenta. Valores possiveis: `log` (imprime no terminal) ou `alerta` (imprime com destaque). |
| `ganchos.apos_acao` | string | Disparado apos executar uma ferramenta com sucesso ou falha. Mesmos valores possiveis. |
| `ganchos.em_erro` | string | Disparado quando a ferramenta retorna erro. Mesmos valores possiveis. |

---

```yaml
ganchos:
  antes_da_etapa: log
  apos_etapa: log
  antes_da_acao: log
  apos_acao: log
  em_erro: alerta
```
