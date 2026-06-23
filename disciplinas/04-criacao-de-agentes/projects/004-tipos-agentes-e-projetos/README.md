# Exemplo 004 — Tipos de Agente: o Goal-Oriented `backlog-decomposer`

> Introduz o `backlog-decomposer`, um agente do tipo `goal_oriented` que decompõe um objetivo de produto em backlog estruturado (épicos, stories, critérios de aceite, riscos e perguntas) — mostrando que basta mudar o `tipo` no contrato para o mesmo runtime mudar todo o comportamento da LLM.

## Contexto
- Disciplina: Criação de Agentes
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição
Este projeto fecha a primeira unidade da disciplina demonstrando **tipos de agente**. Até aqui, `monitor-agent` (diagnostica incidentes) e `trace-analyzer` (analisa traces) eram ambos do tipo `task_based` — recebem uma tarefa bem definida e executam um pipeline. Agora entra o **`backlog-decomposer`**, do tipo **`goal_oriented`**: recebe um objetivo amplo de produto ("permitir onboarding self-service") e o transforma em um plano executável.

O ponto central da aula é que **mesmo runtime, mesmos módulos Python, mesmo loop** produzem comportamentos diferentes só pela mudança do campo `tipo` no `agent.md`. O runtime, ao montar o system prompt, injeta instruções específicas do tipo (em `planejador.py`): para `goal_oriented`, "decomponha o objetivo em sub-objetivos executáveis, planeje as ferramentas de cada um e reavalie após cada etapa". Nenhuma linha de código muda — muda o contrato, e a LLM passa a decompor em vez de executar.

O `backlog-decomposer` traz dois elementos novos no `agent.md`: o campo `portfolio: [product, engineering]` (áreas de atuação) e um `contrato_saida` voltado a artefatos de produto (`epicos`, `stories`, `criterios_aceite`, `riscos`, `perguntas`). Suas seis habilidades formam um pipeline de decomposição — `analisar_objetivo` → `gerar_epicos` → `detalhar_stories` → `avaliar_riscos` → `gerar_perguntas` → `montar_backlog` — governado por políticas no `rules.md` que impõem boas práticas de produto: stories no formato "Como [persona], quero [ação], para [benefício]", critérios de aceite verificáveis, riscos com impacto e mitigação, e a regra anti-alucinação "nunca inventar métricas ou dados de mercado".

Os três agentes (`monitor-agent`, `trace-analyzer`, `backlog-decomposer`) agora coexistem na pasta do projeto, todos rodando no **mesmo runtime sem alteração funcional** (as diferenças vs. 003 são apenas cosméticas: caractere de moldura no painel de KPIs e reordenação de import).

## Tecnologias e Ferramentas
- [x] **Python 3** — runtime do agente (stdlib: `argparse`, `pathlib`, `json`, `uuid`)
- [x] **PyYAML** — parse dos blocos YAML embutidos nos contratos `.md`
- [x] **OpenAI SDK** (`gpt-4o-mini`, `response_format=json_object`) — planejador e geração de dados das ferramentas
- [x] **python-dotenv** — carga da `OPENAI_API_KEY`
- [x] **Contratos Markdown/YAML** — definição declarativa dos três agentes

## Pré-requisitos
- **Python 3.10+** e `pip`
- (Opcional) **`OPENAI_API_KEY`** em `runtime/.env` — sem ela os agentes rodam com planejador e ferramentas mock

## Como executar
```bash
cd disciplinas/04-criacao-de-agentes/projects/004-tipos-agentes-e-projetos/runtime
pip install -r requirements.txt
cp .env.example .env   # opcional: preencher OPENAI_API_KEY

# o novo agente goal_oriented: decompõe um objetivo de produto em backlog
python main.py rodar --agente ../backlog-decomposer \
  --entrada "permitir onboarding self-service para novos usuarios"

# os outros tipos, no mesmo runtime
python main.py rodar --agente ../monitor-agent --entrada "alerta de latencia"   # task_based
python main.py analisar --agente ../trace-analyzer                              # task_based (sobre o trace)

# utilitários
python main.py validar --agente ../backlog-decomposer
python main.py rastreamento
python main.py replay --agente ../backlog-decomposer
```

## Estrutura do Projeto
```
004-tipos-agentes-e-projetos/
├── monitor-agent/          # tipo task_based — diagnostica incidentes (igual a 001-003)
├── trace-analyzer/         # tipo task_based — analisa traces (igual a 003)
│
├── backlog-decomposer/     # ★ NOVO: tipo goal_oriented — decompõe objetivo de produto
│   ├── agent.md            # portfolio: [product, engineering]; saída: epicos/stories/criterios/riscos/perguntas
│   ├── skills.md           # 6 habilidades do pipeline de decomposição
│   ├── rules.md            # montar_backlog obrigatório + políticas de boas práticas de produto
│   ├── hooks.md  memory.md  commands.md
│   └── contracts/  loop.md  planner.md  toolbox.md  executor.md
│
└── runtime/                # mesmo runtime (mudanças só cosméticas vs 003)
    ├── planejador.py       # injeta instruções por tipo de agente no system prompt
    ├── ciclo.py  contratos.py  ferramentas.py  executor.py  telemetria.py  validador.py  main.py
```

## Como funciona
O `tipo` declarado em `agent.md` é lido em `criar_estado` (`contratos.py`) e usado em `construir_prompt_sistema` (`planejador.py`), que injeta um bloco de instruções específico antes de chamar a LLM:

| Tipo | Instrução injetada no prompt | Agente exemplo |
|------|------------------------------|----------------|
| `task_based` | executa o pipeline definido até entregar o artefato | `monitor-agent`, `trace-analyzer` |
| `interactive` | valida ambiguidades com o usuário (`PERGUNTAR_USUARIO`) antes de agir | — |
| `goal_oriented` | decompõe o objetivo em sub-objetivos, planeja ferramentas e reavalia a cada etapa | `backlog-decomposer` |
| `autonomous` | responde a um evento trigger dentro de limites rígidos, sem ações destrutivas sem confirmação | — |

Pipeline do `backlog-decomposer` (ordem imposta por `planner.md` + `rules.md`):
```
analisar_objetivo → gerar_epicos → detalhar_stories → avaliar_riscos → gerar_perguntas → montar_backlog → FINALIZAR
```
1. **`analisar_objetivo`** — identifica domínios, personas, capacidades e restrições.
2. **`gerar_epicos`** — épicos orientados a valor de negócio (não a implementação) + dependências.
3. **`detalhar_stories`** — user stories no formato "Como [persona]…" com critérios de aceite verificáveis.
4. **`avaliar_riscos`** — riscos técnicos e de produto, cada um com impacto e mitigação.
5. **`gerar_perguntas`** — perguntas de esclarecimento direcionadas a stakeholders, priorizadas.
6. **`montar_backlog`** (obrigatória) — consolida tudo num backlog final; só executável após coletar épicos, stories, riscos e perguntas.

Se o objetivo for ambíguo demais, a política manda gerar perguntas de esclarecimento antes de detalhar stories — e o agente pode emitir `PERGUNTAR_USUARIO`. Como qualquer agente, roda sob guardrails: `max_etapas: 12`, 11 chamadas no total, circuit breaker e enforcement de `montar_backlog` antes de `FINALIZAR`.

## Conceitos trabalhados
- [x] **Tipos de agente** — `task_based`, `interactive`, `goal_oriented`, `autonomous` mudam o comportamento via prompt, não via código
- [x] **Agente goal-oriented** — decompõe objetivo amplo em plano executável, em vez de rodar pipeline fixo
- [x] **Comportamento dirigido por contrato** — trocar o campo `tipo` no `agent.md` reescreve as instruções injetadas no system prompt
- [x] **Pipeline de decomposição de produto** — épicos → stories → critérios → riscos → perguntas → backlog
- [x] **Políticas de qualidade de produto** — formato de story, critérios verificáveis, riscos com mitigação, perguntas a stakeholders
- [x] **Portfólio do agente** — campo `portfolio` declara as áreas de atuação (`product`, `engineering`)
- [x] **Anti-alucinação** — "nunca inventar métricas ou dados de mercado"; ambiguidade vira pergunta, não suposição
- [x] **Multi-agente no mesmo runtime** — três agentes de tipos/domínios distintos compartilham o motor sem mudança funcional

## Aprendizados
- [x] O `tipo` do agente é uma alavanca de comportamento que cabe em uma linha de YAML — o runtime traduz isso em instruções de prompt e o loop inteiro muda sem tocar no código.
- [x] `task_based` executa uma tarefa definida; `goal_oriented` transforma um objetivo amplo em plano — a diferença prática aparece em como a LLM decide a sequência de ferramentas.
- [x] Boas práticas de produto (formato de story, critérios de aceite verificáveis, riscos com mitigação) são governança que vive no `rules.md`, não no código — qualquer time pode versioná-las.
- [x] Fechando a unidade: um único runtime declarativo, contratos versionáveis e tipos de agente bastam para cobrir domínios tão distintos quanto incidentes de produção, análise de traces e planejamento de produto.

## Referências
- [001-contratos](../001-contratos/README.md) — definição declarativa do agente
- [002-runtime](../002-runtime/README.md) — internos do runtime
- [003-observabilidade](../003-observabilidade/README.md) — agente que analisa outro agente
- [OpenAI API — Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [PyYAML](https://pyyaml.org/wiki/PyYAMLDocumentation)
