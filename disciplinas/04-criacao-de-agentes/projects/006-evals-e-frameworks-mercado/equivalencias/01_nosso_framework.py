"""
Equivalencia 1 — Nosso Framework (Spec-Driven)

O agente e definido por contratos Markdown/YAML.
O runtime le os contratos e executa o ciclo.
Nenhum codigo de dominio. Tudo e especificacao.

Execucao:
  python runtime/main.py rodar --agente monitor-agent --entrada "alerta de latencia" --arquitetura react
"""

# Nao ha codigo Python de dominio.
# O agente inteiro e definido em 9 arquivos Markdown:
#
#   monitor-agent/
#     agent.md          → identidade, tipo, contrato de saida
#     rules.md          → limites, politicas, acoes sensiveis
#     skills.md         → habilidades com entrada/saida
#     hooks.md          → ganchos de observabilidade
#     memory.md         → memoria curta
#     contracts/
#       loop.md         → ciclo, condicoes de parada
#       planner.md      → formato de decisao, regras do planejador
#       executor.md     → validacao, retry
#       toolbox.md      → ferramentas disponiveis
#
# A arquitetura cognitiva e trocada com:
#
#   architectures/react/planner.md      → raciocinio explicito
#   architectures/plan_execute/planner.md → plano completo
#   architectures/reflect/critic.md     → autocritica
#
# Conceitos mapeados:
#   - Agente        = pasta com 9 contratos
#   - Skill/Tool    = contrato em skills.md + toolbox.md
#   - Planner       = planner.md (formato de decisao)
#   - Executor      = executor.md (validacao, retry)
#   - Memory        = memory.md + historico no estado
#   - Guardrails    = rules.md (limites, politicas)
#   - Observability = hooks.md + telemetria + trace.json
#   - Eval          = evals/suites/*.yaml + benchmark
