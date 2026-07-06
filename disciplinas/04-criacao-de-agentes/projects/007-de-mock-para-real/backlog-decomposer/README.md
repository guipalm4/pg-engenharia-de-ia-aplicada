# backlog-decomposer

Agente goal-oriented que decompoe objetivos de produto em backlog estruturado.

Portfolio: **product** + **engineering**.

---

## Estrutura

```
backlog-decomposer/
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

## O que entrega

| Artefato | Descricao |
|----------|-----------|
| Epicos | agrupamentos de valor orientados a negocio |
| Stories | "Como [persona], quero [acao], para [beneficio]" |
| Criterios de aceite | verificaveis, sem ambiguidade |
| Riscos | impacto + mitigacao |
| Perguntas | direcionadas a stakeholders |

## Pipeline de ferramentas

```
analisar_objetivo → gerar_epicos → detalhar_stories → avaliar_riscos → gerar_perguntas → montar_backlog
```

Ferramenta obrigatoria: `montar_backlog` (deve ser chamada antes de FINALIZAR).

## Como rodar

```bash
cd ../runtime

# goal-oriented (padrao do agente)
python main.py rodar --agente ../backlog-decomposer --entrada "plataforma de onboarding"

# interactive (faz perguntas para esclarecer o objetivo)
python main.py rodar --agente ../backlog-decomposer --entrada "melhorar experiencia do checkout" --modo interactive

# analisar a execucao
python main.py analisar --agente ../trace-analyzer

# validar contratos
python main.py validar --agente ../backlog-decomposer

# ver rastreamento
python main.py rastreamento

# replay
python main.py replay --agente ../backlog-decomposer
```

## Diagnostico

Se o agente nao decompoe → problema no **planejador** (`contracts/planner.md`).
Se o agente nao gera stories → verificar **skills.md** e **toolbox.md**.
Se o agente nao para → problema nas **regras** (`rules.md`).
Se o backlog sai incompleto → verificar **ferramentas_obrigatorias** em `rules.md`.
Se alertas de payload_invalido → verificar tipos de entrada/saida em `skills.md`.
Para diagnostico automatizado → `python main.py analisar --agente ../trace-analyzer`.
