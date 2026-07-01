# ganchos.md

> Define acoes automaticas em momentos do ciclo.
> Nao implementa logica. So declara.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `ganchos` | objeto | Mapa de evento para acao. |

---

```yaml
ganchos:
  antes_da_etapa: log
  apos_etapa: log
  antes_da_acao: log
  apos_acao: log
  em_erro: alerta
```
