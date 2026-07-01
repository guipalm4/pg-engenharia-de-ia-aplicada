# ReAct Planner

> Arquitetura ReAct (Reason + Act).
> O agente raciocina explicitamente antes de cada acao.
> O raciocinio fica visivel no trace.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `formato_saida` | objeto | Estrutura JSON que a LLM deve retornar. Inclui campo `raciocinio` obrigatorio. |
| `formato_saida.raciocinio` | string | Pensamento explicito do agente antes de decidir. Deve conter: o que sei ate agora, o que falta, por que estou escolhendo esta acao. |
| `formato_saida.proxima_acao` | string | Acao escolhida: `CHAMAR_FERRAMENTA`, `FINALIZAR` ou `PERGUNTAR_USUARIO`. |
| `formato_saida.nome_ferramenta` | string | Ferramenta a ser chamada. Obrigatorio se `CHAMAR_FERRAMENTA`. |
| `formato_saida.argumentos_ferramenta` | objeto | Parametros da ferramenta. |
| `formato_saida.criterio_sucesso` | string | O que define sucesso nesta etapa. |
| `formato_saida.pergunta` | string | Pergunta ao usuario. Obrigatorio se `PERGUNTAR_USUARIO`. |
| `regras` | lista | Regras injetadas no prompt da LLM. |

---

```yaml
formato_saida:
  raciocinio: obrigatorio
  proxima_acao: CHAMAR_FERRAMENTA | FINALIZAR | PERGUNTAR_USUARIO
  nome_ferramenta: opcional
  argumentos_ferramenta: opcional
  criterio_sucesso: obrigatorio
  pergunta: opcional

regras:
  - SEMPRE incluir raciocinio antes de decidir a proxima acao
  - o raciocinio deve conter: (1) o que ja sei, (2) o que falta, (3) por que escolhi esta acao
  - nunca retornar texto livre fora do JSON
  - cada etapa deve avancar em direcao ao objetivo
  - se nao houve progresso nas ultimas etapas, mudar de estrategia
  - so usar FINALIZAR quando todas as evidencias necessarias foram coletadas
```
