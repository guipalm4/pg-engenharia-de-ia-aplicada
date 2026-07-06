# Critico (Reflection)

> Define como o agente avalia a propria saida antes de finalizar.
> O critico analisa corretude, completude e qualidade da evidencia.
> Se a nota for abaixo do limiar, sugere melhorias e o agente corrige.
>
> Sem critico, o agente entrega o que tem.
> Com critico, o agente entrega o melhor que consegue.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `criterios` | lista | Dimensoes avaliadas pelo critico. Cada criterio e verificado contra as evidencias coletadas. |
| `limiar_aprovacao` | int | Nota minima (0-100) para aprovar a finalizacao. Abaixo disso, o agente recebe feedback e deve corrigir. |
| `max_reflexoes` | int | Numero maximo de ciclos critica→correcao. Evita loop infinito de perfeccionismo. |
| `formato_critica` | objeto | Estrutura JSON retornada pelo critico. |

---

```yaml
criterios:
  - corretude: as evidencias sustentam o diagnostico?
  - completude: todas as fontes relevantes foram consultadas?
  - qualidade_evidencia: os dados sao especificos ou genericos demais?

limiar_aprovacao: 70

max_reflexoes: 2

formato_critica:
  nota: int (0-100)
  aprovado: bool
  problemas: lista de problemas encontrados
  sugestoes: lista de acoes para melhorar
```
