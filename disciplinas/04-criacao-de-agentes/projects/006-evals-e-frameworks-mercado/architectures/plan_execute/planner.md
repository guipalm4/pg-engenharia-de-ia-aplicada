# Plan-and-Execute Planner

> Arquitetura Plan-and-Execute.
> O agente gera um plano completo na primeira etapa.
> As etapas seguintes executam o plano sequencialmente.
> A LLM so e chamada uma vez (no planejamento). A execucao e deterministica.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `formato_saida` | objeto | Na primeira etapa, retorna plano completo. Nas seguintes, o runtime segue o plano sem chamar a LLM. |
| `formato_saida.plano_completo` | lista | Lista ordenada de passos. Cada passo tem: objetivo, ferramenta, argumentos, criterio_sucesso. |
| `formato_saida.proxima_acao` | string | Sempre `CHAMAR_FERRAMENTA` na primeira etapa (primeira acao do plano). |
| `modo_execucao` | string | `plan_execute` — indica ao runtime que deve seguir o plano sem chamar a LLM novamente. |
| `regras` | lista | Regras de planejamento. |

---

```yaml
modo_execucao: plan_execute

formato_saida:
  plano_completo: obrigatorio (lista de passos ordenados)
  proxima_acao: CHAMAR_FERRAMENTA | FINALIZAR
  nome_ferramenta: obrigatorio
  argumentos_ferramenta: obrigatorio
  criterio_sucesso: obrigatorio

regras:
  - gerar o plano COMPLETO na primeira chamada
  - cada passo do plano deve ter: objetivo, ferramenta, argumentos_ferramenta, criterio_sucesso
  - o plano deve cobrir todas as etapas necessarias ate o objetivo final
  - ordenar os passos pela dependencia logica (evidencias primeiro, consolidacao por ultimo)
  - o primeiro passo do plano deve ser retornado como proxima_acao
  - ferramentas obrigatorias devem estar no plano
  - nunca retornar texto livre fora do JSON
  - se o objetivo for ambiguo demais para planejar, usar PERGUNTAR_USUARIO
```
