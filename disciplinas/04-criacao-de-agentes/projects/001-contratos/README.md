# Exemplo 001 — Agentes Orientados a Contratos

> Runtime genérico de agentes autônomos cujo comportamento é definido 100% por contratos em Markdown/YAML — sem escrever código de tool. O loop perceber→planejar→agir→avaliar, os guardrails e a telemetria vivem no runtime; o agente vive nos contratos.

## Contexto
- Disciplina: Criação de Agentes
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição
Este projeto separa **o que o agente é** (declarado em contratos) de **como o agente roda** (um runtime Python genérico). Um agente — aqui, o `monitor-agent`, que diagnostica incidentes de produção — é descrito por nove arquivos Markdown com blocos YAML embutidos: identidade, ciclo, decisão, capacidades, registro de ferramentas, execução, limites, ganchos e memória. Nenhum desses arquivos é código.

O runtime (`runtime/`) lê esses contratos e executa o ciclo clássico de um agente autônomo: **perceber → planejar → agir → avaliar**, repetido até atingir o objetivo ou bater em uma condição de parada. O planejamento é delegado a uma LLM (`gpt-4o-mini`) que é **obrigada a responder JSON estruturado** (`proxima_acao`, `nome_ferramenta`, `argumentos_ferramenta`, `criterio_sucesso`); sem API key, um planejador mock percorre as ferramentas em ordem, tornando o projeto executável offline.

O foco da disciplina aparece nos **guardrails e na observabilidade** que cercam esse loop: circuit breaker que valida (e autocorrige) a resposta da LLM antes de executar, validação de payload contra o schema da ferramenta, ferramentas obrigatórias antes de finalizar, confirmação humana para ações sensíveis, limites de etapas/tempo/tokens/estagnação, e uma camada de telemetria estruturada (trace ID, timing por fase, health metrics, audit logs) persistida em `trace.json`. Há ainda quatro modos de operação (`task_based`, `interactive`, `goal_oriented`, `autonomous`) e um comando `analisar` que roda um segundo agente sobre o trace do primeiro, gerando um relatório de execução em Markdown.

Como o comportamento é todo declarativo, **criar um novo agente é criar uma nova pasta de contratos** — o mesmo runtime serve a qualquer domínio.

## Tecnologias e Ferramentas
- [x] **Python 3** — runtime do agente (stdlib: `argparse`, `pathlib`, `json`, `uuid`)
- [x] **PyYAML** — parse dos blocos YAML embutidos nos contratos `.md`
- [x] **OpenAI SDK** (`gpt-4o-mini`, `response_format=json_object`) — planejador e geração de dados das ferramentas
- [x] **python-dotenv** — carga da `OPENAI_API_KEY`
- [x] **Contratos Markdown/YAML** — definição declarativa do agente

## Pré-requisitos
- **Python 3.10+** e `pip`
- (Opcional) **`OPENAI_API_KEY`** em `runtime/.env` — sem ela o agente roda com planejador e ferramentas mock

## Como executar
```bash
cd disciplinas/04-criacao-de-agentes/projects/001-contratos/runtime

# 1. dependências
pip install -r requirements.txt

# 2. (opcional) configurar a chave da OpenAI
cp .env.example .env   # e preencher OPENAI_API_KEY

# 3. validar os contratos do agente antes de rodar
python main.py validar --agente ../monitor-agent

# 4. rodar o agente
python main.py rodar --agente ../monitor-agent --entrada "alerta de latencia no checkout"

# modos alternativos
python main.py rodar --agente ../monitor-agent --entrada "ambiguo" --modo interactive
python main.py rodar --agente ../monitor-agent --entrada "deploy falhou" --modo autonomous --evento deploy_falhou

# 5. inspecionar / reexecutar a última execução
python main.py rastreamento
python main.py replay --agente ../monitor-agent

# 6. analisar o trace com um agente analyzer (gera analise-agente.md)
#    o runtime já suporta este comando; o agente ../trace-analyzer é
#    introduzido em um projeto posterior desta disciplina
python main.py analisar --agente ../trace-analyzer
```

## Estrutura do Projeto
```
001-contratos/
├── monitor-agent/              # O AGENTE — só contratos, nenhum código
│   ├── agent.md                # identidade: nome, tipo, objetivo, contrato_saida
│   ├── skills.md               # capacidades: ferramentas com entrada/saída tipadas
│   ├── rules.md                # limites, ferramentas obrigatórias, ações sensíveis, políticas
│   ├── hooks.md                # ganchos: antes/depois de etapa e ação, em erro
│   ├── memory.md               # memória curta: o que guardar/descartar, resumo final
│   ├── commands.md             # comandos da CLI documentados como produto
│   └── contracts/
│       ├── loop.md             # ciclo: max_etapas, condições de parada
│       ├── planner.md          # formato JSON que a LLM deve retornar + regras
│       ├── toolbox.md          # registro mínimo (nome + entrada) das ferramentas liberadas
│       └── executor.md         # validar entrada, retry em falha, avaliar resultado
│
└── runtime/                    # O RUNTIME — genérico, agnóstico ao domínio
    ├── main.py                 # CLI: rodar | validar | rastreamento | replay | analisar
    ├── ciclo.py                # loop perceber→planejar→agir→avaliar + circuit breaker + KPIs
    ├── contratos.py            # carrega os .md, extrai YAML, monta o estado inicial
    ├── planejador.py           # perceber() + chamar_llm() + planejador_mock()
    ├── executor.py             # executar ferramenta, validar payload/saída, avaliar, ganchos
    ├── ferramentas.py          # gera tools a partir de skills.md (LLM ou mock)
    ├── telemetria.py           # trace ID, timing por fase, health metrics, audit logs
    ├── validador.py            # checa completude e consistência entre contratos
    └── requirements.txt
```

### Os 9 contratos do agente
| # | Arquivo | Metáfora | Pergunta que responde |
|---|---------|----------|-----------------------|
| 1 | `agent.md` | RG | Quem é o agente? |
| 2 | `contracts/loop.md` | Motor | Como ele roda em ciclo? |
| 3 | `contracts/planner.md` | Cérebro | Como ele decide o próximo passo? |
| 4 | `skills.md` | Ficha técnica | O que ele sabe fazer (com entrada/saída)? |
| 5 | `contracts/toolbox.md` | Caixa de ferramentas | O que ele pode usar (recorte das skills)? |
| 6 | `contracts/executor.md` | Braço | Como ele executa (validar, retry, avaliar)? |
| 7 | `rules.md` | Livro de regras | Quais são os limites e guardrails? |
| 8 | `hooks.md` | Sensores | O que ele observa durante a execução? |
| 9 | `memory.md` | Caderno | O que ele lembra e o que esquece? |

> **Skills vs Toolbox = saber vs poder.** `skills.md` cataloga tudo que o agente *sabe* fazer (com descrição e saída); `toolbox.md` é o recorte do que está *liberado*. O `validador.py` cruza os dois e acusa inconsistências antes de rodar.

## Como funciona
```
                          ┌─────────────────── runtime genérico ───────────────────┐
contratos/*.md ──load──▶  │  PERCEBER ──▶ PLANEJAR(LLM) ──▶ [circuit breaker] ──▶   │
(monitor-agent)           │     ▲                                AGIR(ferramenta) ──▶ AVALIAR │
                          │     └──────────────── repete até objetivo / parada ◀────┘ │
                          └──────────────┬───────────────────────────────────────────┘
                                         ▼
                                    trace.json  (telemetria: timing, tokens, health, audit)
```

1. **Carregar** — `contratos.py` lê os nove `.md`, extrai o YAML de cada um e monta o estado inicial (limites, tipo do agente, ferramentas).
2. **Perceber** — monta o contexto da etapa: entrada, evento, histórico de ferramentas e evidências já coletadas.
3. **Planejar** — a LLM recebe um system prompt construído a partir dos contratos (sem conhecer o domínio em código) e devolve JSON: chamar ferramenta, finalizar ou perguntar ao usuário.
4. **Circuit breaker** — `validar_resposta_llm` rejeita respostas malformadas; quando possível, **autocorrige** (ex.: nome de ferramenta usado como `proxima_acao`) ou faz fallback para a próxima ferramenta não usada.
5. **Guardrails antes de agir** — limite total/por-ferramenta de chamadas, detecção de estagnação, confirmação humana para `acoes_sensiveis`, validação de payload contra o schema de `skills.md`.
6. **Agir** — `ferramentas.py` executa a tool; com API key, a LLM gera dados realistas conforme o schema de saída; sem ela, gera mock tipado.
7. **Avaliar** — verifica a saída contra o schema (qualidade `completa`/`parcial`/`falha`) e decide se o objetivo foi atingido. `FINALIZAR` só é permitido após as `ferramentas_obrigatorias`.
8. **Telemetria** — cada etapa exibe um painel de KPIs em tempo real e tudo é persistido em `trace.json` (health metrics, performance por fase, audit logs).

## Conceitos trabalhados
- [x] **Agente orientado a contratos** — comportamento declarado em Markdown/YAML, runtime agnóstico ao domínio
- [x] **Loop de agente** — perceber → planejar → agir → avaliar com condições de parada explícitas
- [x] **Structured output forçado** — LLM obrigada a responder JSON (`response_format=json_object` + circuit breaker)
- [x] **Circuit breaker com autocorreção** — valida e conserta a decisão da LLM antes de executar
- [x] **Guardrails** — ferramentas obrigatórias, limites (etapas/tempo/tokens/chamadas), detecção de estagnação, confirmação humana
- [x] **Validação de schema** — payload de entrada e dados de saída checados contra `skills.md`
- [x] **Telemetria estruturada** — trace ID, timing por fase, health metrics e audit logs em `trace.json`
- [x] **Modos de operação** — `task_based`, `interactive`, `goal_oriented`, `autonomous`
- [x] **Execução offline** — planejador e ferramentas mock quando não há `OPENAI_API_KEY`
- [x] **Meta-agente** — o runtime já traz o comando `analisar`, que roda um agente sobre o trace de outro e emite relatório `.md` (o `trace-analyzer` chega em projeto posterior)

## Aprendizados
- [x] Separar contrato (o que o agente é) de runtime (como ele roda) torna a criação de um novo agente um exercício de **escrever YAML**, não de programar — o mesmo runtime serve qualquer domínio.
- [x] Forçar JSON estruturado não basta: é preciso um **circuit breaker** que valide e, quando der, autocorrija a resposta da LLM antes de passá-la ao executor.
- [x] Guardrails (`ferramentas_obrigatorias`, `acoes_sensiveis`, limites de estagnação/tempo/tokens) são o que separa um agente seguro de um loop perigoso — e cabem inteiramente em contrato.
- [x] Telemetria não é enfeite: sem trace ID, health metrics e audit logs, não dá para auditar nem confiar nas decisões autônomas do agente.
- [x] Um planejador mock determinístico mantém o projeto **executável e testável sem custo de API**, separando a mecânica do loop da inteligência da LLM.

## Referências
- [OpenAI API — Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [PyYAML](https://pyyaml.org/wiki/PyYAMLDocumentation)
- [python-dotenv](https://github.com/theskumar/python-dotenv)
