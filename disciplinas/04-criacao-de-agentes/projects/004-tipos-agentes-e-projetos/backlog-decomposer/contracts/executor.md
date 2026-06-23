# executor.md

> Define como executar.
> Validar e interpretar resultado.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `execucao.validar_entrada` | bool | Verifica se a ferramenta existe antes de executar. |
| `execucao.tentar_novamente_em_falha` | bool | Tenta segunda vez se a primeira falhar. |
| `pos_execucao.avaliar_resultado` | bool | Passa resultado pela funcao avaliar. |

---

```yaml
execucao:
  validar_entrada: true
  tentar_novamente_em_falha: true

pos_execucao:
  avaliar_resultado: true
```
