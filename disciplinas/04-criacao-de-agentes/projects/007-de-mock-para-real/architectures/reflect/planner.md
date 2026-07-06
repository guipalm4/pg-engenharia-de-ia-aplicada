# Reflection Planner

> Arquitetura Reflection.
> O agente executa normalmente, mas antes de finalizar passa por uma
> fase de autocritica. Se a critica identificar problemas, o agente
> corrige e tenta de novo.
>
> Fluxo: execute → critique → improve → finalize

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `formato_saida` | objeto | Mesmo formato base. O campo `raciocinio` e opcional mas recomendado. |
| `regras` | lista | Regras de planejamento com instrucoes de reflexao. |

---

```yaml
formato_saida:
  raciocinio: opcional
  proxima_acao: CHAMAR_FERRAMENTA | FINALIZAR | PERGUNTAR_USUARIO
  nome_ferramenta: opcional
  argumentos_ferramenta: opcional
  criterio_sucesso: obrigatorio
  pergunta: opcional

regras:
  - seguir o fluxo normal de coleta de evidencias
  - ao decidir FINALIZAR, o runtime ira submeter o resultado a uma fase de critica
  - se a critica rejeitar, voce recebera o feedback e devera corrigir
  - nao tentar FINALIZAR novamente sem ter corrigido os problemas apontados
  - raciocinio e opcional mas recomendado para facilitar a critica
```
