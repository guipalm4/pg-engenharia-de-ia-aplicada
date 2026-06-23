# planejador.md

> Define como a LLM decide.
> Isso nao e prompt. E contrato.
> Obriga a LLM a responder estruturado.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `formato_saida` | objeto | Estrutura JSON que a LLM deve retornar. O runtime faz parse dessa resposta para decidir o que executar. |
| `formato_saida.proxima_acao` | string | Acao que a LLM escolheu: `CHAMAR_FERRAMENTA` para executar uma ferramenta ou `FINALIZAR` para encerrar o ciclo. |
| `formato_saida.nome_ferramenta` | string | Nome da ferramenta a ser chamada. Obrigatorio quando `proxima_acao = CHAMAR_FERRAMENTA`. |
| `formato_saida.argumentos_ferramenta` | objeto | Parametros passados para a ferramenta. As chaves devem corresponder aos campos de entrada definidos em `skills.md`. |
| `formato_saida.criterio_sucesso` | string | Descreve o que define sucesso nesta etapa. Usado na avaliacao e exibido no rastreamento. |
| `regras` | lista | Instrucoes injetadas no prompt da LLM. O runtime nao interpreta — apenas repassa como texto. Aqui voce controla o comportamento da LLM sem alterar o codigo. |

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
  - coletar evidencias de metricas, logs e deploys antes de diagnosticar
  - analisar as evidencias coletadas para identificar a causa raiz
  - so usar FINALIZAR apos registrar o incidente com diagnostico e recomendacao
  - o criterio_sucesso do FINALIZAR deve conter o diagnostico e a acao recomendada
  - usar PERGUNTAR_USUARIO quando faltar informacao critica que nao pode ser obtida via ferramentas
  - no modo interactive, sempre validar ambiguidades com o usuario antes de agir
```
