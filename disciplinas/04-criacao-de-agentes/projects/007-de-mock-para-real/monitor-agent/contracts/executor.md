# executor.md

> Define como executar.
> Nao e so chamar ferramenta.
> E validar e interpretar resultado.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `execucao.validar_entrada` | bool | Se `true`, o runtime verifica se a ferramenta existe antes de executar. |
| `execucao.tentar_novamente_em_falha` | bool | Se `true`, o runtime tenta executar a ferramenta uma segunda vez caso a primeira chamada lance uma excecao. |
| `pos_execucao.avaliar_resultado` | bool | Se `true`, o resultado da ferramenta passa pela funcao `avaliar` que decide se o objetivo foi alcancado ou se o ciclo deve continuar. |

---

```yaml
execucao:
  validar_entrada: true
  tentar_novamente_em_falha: true

pos_execucao:
  avaliar_resultado: true
```
