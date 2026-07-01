# monitor-agent

Agente autonomo de monitoramento e diagnostico de incidentes de producao.

---

## Estrutura

```
monitor-agent/
├── agent.md            ← identidade, tipo e contrato de saida
├── rules.md            ← limites, politicas e acoes sensiveis
├── skills.md           ← contrato das ferramentas (entrada/saida)
├── hooks.md            ← interceptacao (antes/depois etapa e acao, erro)
├── memory.md           ← memoria curta e resumo final
├── commands.md         ← comandos CLI disponiveis
└── contracts/
    ├── loop.md         ← ciclo do agente e condicoes de parada
    ├── planner.md      ← contrato de decisao da LLM
    ├── executor.md     ← validacao de resultado
    └── toolbox.md      ← capacidades do agente
```

## Pipeline

```
consultar_metricas → buscar_logs → historico_deploys → relatorio_incidente → FINALIZAR
```

## Como rodar

```bash
cd ../runtime

# task-based (padrao)
python main.py rodar --agente ../monitor-agent --entrada "alerta de latencia"

# interactive — faz perguntas ao usuario
python main.py rodar --agente ../monitor-agent --entrada "alerta de latencia" --modo interactive

# goal-oriented — decompoe objetivo em plano
python main.py rodar --agente ../monitor-agent --entrada "reduzir incidentes do servico de pagamento" --modo goal_oriented

# autonomous — responde a evento trigger
python main.py rodar --agente ../monitor-agent --entrada "deploy v2.3.1" --modo autonomous --evento deploy_falhou

# analisar a execucao
python main.py analisar --agente ../trace-analyzer

# validar contratos
python main.py validar --agente ../monitor-agent

# ver rastreamento
python main.py rastreamento

# reexecutar com mesma entrada
python main.py replay --agente ../monitor-agent
```

## Tipos de agente

| Tipo | Descricao | Loop |
|------|-----------|------|
| `task_based` | Tarefa bem definida, loop curto (1-2 steps) | entrada → ferramentas → artefato |
| `interactive` | Faz perguntas para remover ambiguidade | pergunta → resposta → ferramentas → artefato |
| `goal_oriented` | Objetivo amplo, decompoe em plano | objetivo → sub-plano → ferramentas → artefato |
| `autonomous` | Responde a triggers/eventos simulados | evento → ferramentas → artefato (com limites rigidos) |

## Anti-loop

| Condicao | Campo | Descricao |
|----------|-------|-----------|
| Max etapas | `limites.max_etapas` | Encerra apos N iteracoes |
| Sem progresso | `limites.sem_progresso` | Detecta repeticao de ferramenta N vezes consecutivas |
| Limite tempo | `limites.limite_tempo_segundos` | Encerra apos N segundos |
| Limite tokens | `limites.max_tokens` | Encerra apos N tokens consumidos |
| Limite por tool | `limites.chamadas_ferramenta` | Limite individual por ferramenta + total |
| Acao sensivel | `acoes_sensiveis` | Pede confirmacao humana antes de executar |

## Diagnostico

Se o agente nao decidir → problema no **planejador** (`contracts/planner.md`).
Se o agente nao agir → problema na **caixa de ferramentas** (`contracts/toolbox.md`).
Se o agente nao parar → problema nas **regras** (`rules.md`).
Se o agente nao perguntar → verificar **tipo** em `agent.md` e modo CLI.
Se alertas no painel KPIs → verificar tipos nos contratos (`skills.md`, `toolbox.md`).
Para diagnostico automatizado → `python main.py analisar --agente ../trace-analyzer`.
