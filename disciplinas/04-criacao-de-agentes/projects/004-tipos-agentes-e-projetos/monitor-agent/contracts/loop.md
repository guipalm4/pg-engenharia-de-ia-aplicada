# ciclo.md

> Define como o agente roda.
> Controla o ciclo inteiro.
> Sem isso, nao existe agente.

---

## Campos

| Campo | Tipo | Descricao |
|-------|------|-----------|
| `objetivo` | string | O que o agente deve alcancar. Exibido no inicio da execucao e usado no prompt da LLM. |
| `ciclo.max_etapas` | int | Numero maximo de iteracoes do ciclo. Funciona como trava de seguranca. |
| `condicoes_parada` | lista | Situacoes que encerram o ciclo. O runtime verifica essas condicoes a cada iteracao. |

---

```yaml
objetivo: resolver_incidente

ciclo:
  max_etapas: 10

# As etapas do ciclo (perceber -> planejar -> agir -> avaliar) sao fixas no runtime.
# Para torna-las dinamicas:
#   1. Descomentar o bloco "etapas" abaixo
#   2. No ciclo.py, criar um dicionario mapeando nome da etapa -> funcao:
#        registro_etapas = {
#            "perceber": perceber,
#            "planejar": chamar_llm,
#            "agir": executar,
#            "avaliar": avaliar,
#        }
#   3. Substituir as chamadas fixas por um for que percorre as etapas do contrato:
#        etapas = contratos.get("ciclo", {}).get("etapas", [])
#        for nome_etapa in etapas:
#            funcao = registro_etapas[nome_etapa]
#            funcao(...)
#   4. Novos agentes podem definir etapas extras registrando funcoes no mapeamento

# etapas:
#   - perceber
#   - planejar
#   - agir
#   - avaliar

condicoes_parada:
  - objetivo_alcancado
  - max_etapas_excedido
  - sem_progresso
  - limite_tempo_excedido
  - confirmacao_humana_negada
```
