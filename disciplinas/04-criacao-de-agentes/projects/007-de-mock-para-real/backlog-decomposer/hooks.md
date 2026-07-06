# ganchos.md

> Permite observar e intervir.
> Antes. Depois. Erro.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `ganchos` | objeto | Mapeamento de eventos do ciclo para acoes. |
| `ganchos.antes_da_etapa` | string | Disparado antes de cada etapa. |
| `ganchos.apos_etapa` | string | Disparado apos cada etapa. |
| `ganchos.antes_da_acao` | string | Disparado antes de executar uma ferramenta. |
| `ganchos.apos_acao` | string | Disparado apos executar uma ferramenta. |
| `ganchos.em_erro` | string | Disparado quando a ferramenta retorna erro. |

---

```yaml
ganchos:
  antes_da_etapa: log
  apos_etapa: log
  antes_da_acao: log
  apos_acao: log
  em_erro: alerta
```
