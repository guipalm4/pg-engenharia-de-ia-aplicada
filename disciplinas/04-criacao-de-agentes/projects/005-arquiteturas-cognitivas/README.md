# Exemplo 005 — Arquiteturas Cognitivas: ReAct Plugável sobre o Mesmo Runtime

> Generaliza o formato de saída do planejador para ser lido do contrato (não mais fixo no código) e introduz a arquitetura **ReAct** via flag `--arquitetura`, que sobrescreve `planner.md`/`executor.md` do agente sem tocar em uma linha do runtime.

## Contexto
- Disciplina: Criação de Agentes
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição
Até o projeto 004, o `formato_saida` que a LLM deveria retornar (`proxima_acao`, `nome_ferramenta`, `argumentos_ferramenta`, `criterio_sucesso`, `pergunta`) estava **hardcoded** em `construir_prompt_sistema` (`planejador.py`). Qualquer campo novo no protocolo de decisão exigiria mexer no runtime. Este projeto remove essa amarra: `construir_prompt_sistema` agora lê `formato_saida` diretamente do contrato `planner.md` e monta o bloco JSON do prompt dinamicamente a partir dele, caindo no formato antigo só como fallback quando o contrato não declara nada.

Essa generalização é o que viabiliza **arquiteturas cognitivas plugáveis**. A pasta `architectures/react/` define uma variante do planejador que adiciona um campo obrigatório `raciocinio` ao `formato_saida` — a implementação do padrão **ReAct** (*Reason + Act*): antes de decidir a próxima ação, a LLM é forçada a explicitar o que já sabe, o que falta e por que está escolhendo aquela ação. O `executor.md` do ReAct é idêntico ao padrão, reforçando a mensagem central do projeto: **a arquitetura cognitiva mora no planejador, não no executor**.

A troca acontece por composição, sem `if` de arquitetura no runtime: o novo parâmetro `--arquitetura` chega até `carregar_contratos` (`contratos.py`), que, se a pasta `architectures/<nome>/` existir, sobrescreve as chaves `planejador` e `executor` do dicionário de contratos com o conteúdo de lá antes de montar o prompt (e já contempla, de forma antecipada, um `critic.md` opcional para futuras arquiteturas de reflexão). O `ciclo.py` detecta a presença do campo `raciocinio` na resposta da LLM e imprime uma linha `[raciocinio]` própria no trace — visibilidade do processo de pensamento do agente, não só da decisão final. O planejador mock (usado sem `OPENAI_API_KEY`) também foi ensinado a gerar um `raciocinio` plausível quando o contrato carregado o exige, então o modo ReAct é demonstrável offline.

Os três agentes de domínio (`monitor-agent`, `backlog-decomposer`, `trace-analyzer`) permanecem inalterados — a mudança de arquitetura é ortogonal ao agente. Qualquer um deles pode rodar em modo padrão ou em modo `react` só trocando a flag `--arquitetura react` na CLI, prova de que o mesmo domínio pode ser servido por raciocínios cognitivos diferentes sem duplicar contratos de identidade, regras ou ferramentas.

## Tecnologias e Ferramentas
- [x] **Python 3** — runtime do agente (stdlib: `argparse`, `pathlib`, `json`, `uuid`)
- [x] **PyYAML** — parse dos blocos YAML embutidos nos contratos `.md`
- [x] **OpenAI SDK** (`gpt-4o-mini`, `response_format=json_object`) — planejador e geração de dados das ferramentas
- [x] **python-dotenv** — carga da `OPENAI_API_KEY`
- [x] **Contratos Markdown/YAML** — definição declarativa de agentes e arquiteturas cognitivas

## Pré-requisitos
- **Python 3.10+** e `pip`
- (Opcional) **`OPENAI_API_KEY`** em `runtime/.env` — sem ela os agentes rodam com planejador e ferramentas mock (o `raciocinio` do modo ReAct também é gerado no mock)

## Como executar
```bash
cd disciplinas/04-criacao-de-agentes/projects/005-arquiteturas-cognitivas/runtime
pip install -r requirements.txt
cp .env.example .env   # opcional: preencher OPENAI_API_KEY

# arquitetura padrao (sem raciocinio explicito no trace)
python main.py rodar --agente ../monitor-agent --entrada "alerta de latencia"

# arquitetura ReAct: mesmo agente, planner.md trocado por architectures/react/
python main.py rodar --agente ../monitor-agent --entrada "alerta de latencia" --arquitetura react

# ReAct funciona com qualquer agente de dominio
python main.py rodar --agente ../backlog-decomposer \
  --entrada "permitir onboarding self-service para novos usuarios" --arquitetura react

# utilitarios
python main.py validar --agente ../monitor-agent
python main.py rastreamento
python main.py replay --agente ../monitor-agent
```

## Estrutura do Projeto
```
005-arquiteturas-cognitivas/
├── architectures/
│   └── react/               # NOVO: arquitetura ReAct (Reason + Act)
│       ├── planner.md       # formato_saida com campo raciocinio obrigatorio
│       └── executor.md      # identico ao executor padrao — ReAct nao muda a execucao
│
├── monitor-agent/            # tipo task_based — diagnostica incidentes (igual a 001-004)
├── backlog-decomposer/       # tipo goal_oriented — decompoe objetivo de produto (igual a 004)
├── trace-analyzer/           # tipo task_based — analisa traces (igual a 003-004)
│
└── runtime/
    ├── contratos.py          # carregar_contratos(arquitetura=...) sobrescreve planner/executor
    ├── planejador.py         # construir_prompt_sistema le formato_saida do contrato (nao mais fixo)
    ├── ciclo.py               # imprime [raciocinio] quando o plano da LLM traz o campo
    ├── ferramentas.py  executor.py  telemetria.py  validador.py  main.py  # inalterados na essencia
```

## Como funciona
Fluxo de carregamento quando `--arquitetura react` é passado:

```
main.py --arquitetura react
   └─> ciclo.rodar(arquitetura="react")
         └─> contratos.carregar_contratos(caminho_agente, arquitetura="react")
               ├─ carrega os 9 contratos normais do agente (agent/rules/skills/hooks/memory/contracts/*)
               └─ SE architectures/react/ existir:
                     ├─ contratos["planejador"] <- architectures/react/planner.md  (formato_saida + raciocinio)
                     └─ contratos["executor"]   <- architectures/react/executor.md (identico ao padrao)
```

Dentro do loop, a diferença fica só na fase **planejar**:

1. `construir_prompt_sistema` monta o bloco de formato de saída **a partir do `formato_saida` do contrato carregado** — se for o do ReAct, o bloco JSON injetado no prompt inclui a chave `"raciocinio": "..."`, obrigando a LLM a preenchê-la antes de decidir `proxima_acao`.
2. A LLM (ou o planejador mock, que replica a mesma lógica) retorna o plano com `raciocinio` preenchido.
3. `ciclo.py` detecta o campo e imprime `[raciocinio] <texto>` no console e persiste no `trace.json`, tornando o processo de pensamento auditável — não só a decisão final, mas o porquê dela.

Sem a flag `--arquitetura`, `contratos["planejador"]` continua vindo direto de `<agente>/contracts/planner.md`, que não declara `raciocinio` — o mesmo runtime roda em modo padrão sem produzir a linha de raciocínio. A troca de comportamento cognitivo é 100% dirigida por qual arquivo de contrato foi carregado, sem `if`/`else` de arquitetura no código.

## Conceitos trabalhados
- [x] **Arquitetura cognitiva como contrato substituível** — `planner.md`/`executor.md` de uma pasta `architectures/<nome>/` sobrescrevem os do agente, sem mudar o runtime
- [x] **ReAct (Reason + Act)** — campo `raciocinio` obrigatório força a LLM a explicitar estado atual, lacuna e justificativa antes de agir
- [x] **Formato de saída dirigido por contrato** — `construir_prompt_sistema` lê `formato_saida` do `planner.md` em vez de tê-lo fixo no código Python
- [x] **Separação planejador vs. executor** — o `executor.md` do ReAct é idêntico ao padrão: a arquitetura cognitiva vive inteiramente na decisão, não na execução
- [x] **Reasoning trace observável** — `[raciocinio]` aparece no console e é persistido no `trace.json`, junto da telemetria já existente (circuit breaker, tokens, latência por fase)
- [x] **Paridade mock/LLM** — o planejador mock também gera `raciocinio` quando o contrato o exige, permitindo demonstrar arquiteturas cognitivas sem `OPENAI_API_KEY`
- [x] **Ortogonalidade domínio × arquitetura** — qualquer um dos três agentes roda em modo padrão ou ReAct trocando só a flag `--arquitetura`

## Aprendizados
- [x] "Arquitetura cognitiva" não precisa ser um framework à parte — pode ser um contrato a mais que o runtime sabe sobrescrever, mantendo o loop perceber→planejar→agir→avaliar intacto.
- [x] Tirar o `formato_saida` do código e colocá-lo no contrato foi o que abriu a porta para o ReAct: sem essa generalização, cada campo novo (como `raciocinio`) exigiria alterar `planejador.py` a cada arquitetura.
- [x] ReAct muda o *que* a LLM deve produzir antes de decidir (o raciocínio), não *como* a ferramenta é executada — por isso o `executor.md` do ReAct é uma cópia do padrão.
- [x] Observabilidade de raciocínio (não só de decisão) é uma extensão natural da telemetria já construída em 003 — bastou checar se o campo existe e imprimir mais uma linha no trace.

## Referências
- [001-contratos](../001-contratos/README.md) — definição declarativa do agente
- [002-runtime](../002-runtime/README.md) — internos do runtime
- [003-observabilidade](../003-observabilidade/README.md) — agente que analisa outro agente
- [004-tipos-agentes-e-projetos](../004-tipos-agentes-e-projetos/README.md) — tipos de agente e múltiplos domínios no mesmo runtime
- [ReAct: Synergizing Reasoning and Acting in Language Models](https://arxiv.org/abs/2210.03629)
- [OpenAI API — Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
