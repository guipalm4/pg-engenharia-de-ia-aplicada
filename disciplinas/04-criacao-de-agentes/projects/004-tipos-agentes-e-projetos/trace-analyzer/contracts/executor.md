# executor.md

> Define como o agente executa acoes.
> Valida antes, executa, avalia depois.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `execucao.validar_entrada` | bool | Verificar se ferramenta existe antes de executar. |
| `execucao.tentar_novamente_em_falha` | bool | Tentar novamente se a primeira execucao falhar. |
| `execucao.avaliar_resultado` | bool | Avaliar se o objetivo da etapa foi alcancado. |

---

```yaml
execucao:
  validar_entrada: true
  tentar_novamente_em_falha: false
  avaliar_resultado: true
```
