# Exemplo 002 — Por Dentro do Runtime

> Mergulho nos internos do runtime de agentes da disciplina: o mesmo código de [001-contratos](../001-contratos/README.md), mas com a perspectiva invertida — agora você abre o motor e mapeia cada linha de YAML do contrato à linha de Python que a executa.

## Contexto
- Disciplina: Criação de Agentes
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição
O projeto [001-contratos](../001-contratos/README.md) entregou nove contratos Markdown e o agente rodou. Este projeto explica **como**: cada módulo Python do `runtime/` lê um pedaço dos contratos e executa o ciclo. A tese da aula é direta — **cada linha de YAML que você escreveu tem uma linha de Python que a lê.**

O código-fonte do agente (`monitor-agent/`) e do runtime (`runtime/`) é o mesmo de 001-contratos; o que muda é o foco didático. Em vez de "como declarar um agente", a pergunta aqui é "como o runtime, sem saber nada sobre o domínio, transforma contratos em comportamento". O runtime não conhece latência, deploy ou incidente — ele só sabe ler contratos e executar o loop **perceber → planejar → validar (circuit breaker) → executar → avaliar**.

O eixo central é a rastreabilidade **contrato → código**: `rules.md → limites.max_etapas` vira o `while` em `ciclo.py`; `executor.md → tentar_novamente_em_falha` vira o retry em `executor.py`; `skills.md → entrada` vira a checagem em `validar_payload`; `rules.md → politicas` é injetado no prompt em `chamar_llm`. Entender esse mapeamento é o que permite **debugar qualquer agente**: dado um `trace.json`, achar no código a decisão que gerou cada etapa.

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
O conjunto de comandos é o mesmo de 001-contratos. A diferença está em **abrir cada módulo** e mapear o que o trace registra.
```bash
cd disciplinas/04-criacao-de-agentes/projects/002-runtime/runtime

# dependências
pip install -r requirements.txt

# (opcional) configurar a chave da OpenAI
cp .env.example .env   # e preencher OPENAI_API_KEY

# validar os contratos e rodar o agente
python main.py validar --agente ../monitor-agent
python main.py rodar --agente ../monitor-agent --entrada "alerta de latencia no servico de pagamentos"

# inspecionar a última execução (e mapear trace → código)
python main.py rastreamento
python main.py replay --agente ../monitor-agent
```

> **O desafio da aula:** abra `ciclo.py`, encontre a função `rodar` e identifique as 5 fases. Depois abra o `trace.json` da última execução e, para cada etapa, encontre o código que gerou aquela decisão. Se você consegue mapear trace → código, sabe debugar qualquer agente.

## Estrutura do Projeto
```
002-runtime/
├── monitor-agent/          # os 9 contratos (idênticos a 001-contratos)
│   ├── agent.md  skills.md  rules.md  hooks.md  memory.md  commands.md
│   └── contracts/  loop.md  planner.md  toolbox.md  executor.md
│
└── runtime/                # foco desta aula — os módulos do motor
    ├── contratos.py        # carrega os 9 .md, extrai YAML, monta o estado inicial
    ├── ciclo.py            # orquestra o loop + circuit breaker + painel de KPIs
    ├── planejador.py       # perceber() + chamar_llm() + planejador_mock()
    ├── ferramentas.py      # constrói as tools a partir de skills.md (LLM ou mock)
    ├── executor.py         # valida payload, executa, dispara hooks, avalia
    ├── telemetria.py       # trace_id, timing por fase, health metrics, audit logs
    ├── validador.py        # valida o cruzamento entre os 9 contratos
    ├── main.py             # CLI: rodar | validar | rastreamento | replay | analisar
    └── requirements.txt
```

## Como funciona

### Os módulos do runtime
| Módulo | Responsabilidade |
|--------|------------------|
| `contratos.py` | `carregar_yaml_do_md` extrai o bloco YAML de cada `.md`; `carregar_contratos` devolve um dict de 9 chaves; `criar_estado` monta a "folha em branco" (contadores zerados, limites lidos das `rules`, histórico vazio) |
| `ciclo.py` | função `rodar` — o loop principal; a cada iteração checa `max_etapas`, `limite_tempo_segundos`, limite por ferramenta/total e estagnação (`sem_progresso`); `exibir_kpis` imprime o painel ao fim de cada etapa |
| `planejador.py` | `perceber(estado)` monta o contexto (alerta, tipo, evento, histórico, progresso); `chamar_llm` constrói o system prompt a partir dos contratos e chama a LLM em modo JSON; `planejador_mock` roda sem API key |
| `ferramentas.py` | `construir_ferramenta(habilidade)` transforma uma skill do contrato numa função executável que pede à LLM dados realistas conforme o schema de saída — a implementação é gerada, o contrato não muda |
| `executor.py` | `executar_gancho` (hooks), `validar_payload` (tipos vs `skills.md`), `executar` (com retry se configurado) e `avaliar` (classifica qualidade `completa`/`parcial`/`falha` e fecha o feedback loop) |
| `telemetria.py` | classe `Telemetria`: `trace_id` único, eventos com timestamp, duração por fase, tokens por chamada; emite 4 streams no `trace.json` |

### O loop, por iteração
```
perceber → planejar(LLM) → circuit breaker → validar_payload → executar → avaliar → telemetria
   ▲                                                                                    │
   └──────────────── repete com mais contexto, até objetivo OU limite ◀────────────────┘
```

1. **`contratos.py`** carrega os 9 `.md` → dict com 9 chaves; `criar_estado` monta a folha em branco.
2. **`ferramentas.py`** lê os skills → uma função executável por habilidade.
3. **`telemetria.py`** inicializa com `trace_id` único.
4. **Loop (`ciclo.rodar`)**: `perceber` monta contexto → `chamar_llm` devolve plano JSON → **circuit breaker** valida (e autocorrige) o plano → `validar_payload` checa argumentos → `executar` roda a ferramenta → `avaliar` classifica qualidade → `telemetria` registra e os KPIs aparecem no terminal.
5. **Próxima iteração** com mais histórico e melhor contexto → melhor decisão.
6. Encerra ao atingir o objetivo **ou** um limite; `trace.json` é salvo.

### Circuit breaker (em `ciclo.py`)
Antes de mandar ao executor, valida a resposta da LLM: é dict? `proxima_acao` é uma das três válidas? Se `CHAMAR_FERRAMENTA`, a ferramenta existe? Se `PERGUNTAR_USUARIO`, tem `pergunta`? E tenta **autocorrigir** antes de desistir: ação inválida + ferramenta válida → corrige para `CHAMAR_FERRAMENTA`; ferramenta inexistente → substitui pela primeira não-usada; sem recuperação → encerra. É tolerância a falhas — não do sistema, da LLM.

### Contrato vira código — mapeamento direto
| O que você escreveu no contrato | Onde o runtime lê |
|---|---|
| `rules.md → limites.max_etapas: 10` | `criar_estado` (`contratos.py`) → `while etapa < max_etapas` (`ciclo.py`) |
| `executor.md → tentar_novamente_em_falha: true` | função `executar` (`executor.py`) faz retry |
| `hooks.md → em_erro: alerta` | `executar_gancho` (`executor.py`) dispara o alerta |
| `skills.md → entrada: { nome_servico: string }` | `validar_payload` (`executor.py`) checa o tipo |
| `rules.md → ferramentas_obrigatorias: [relatorio_incidente]` | enforcement em `ciclo.py` antes de aceitar `FINALIZAR` |
| `rules.md → politicas: [...]` | injetadas no prompt em `chamar_llm` (`planejador.py`) |

> Isso é spec-driven: a especificação dirige o comportamento, o código só obedece.

## Conceitos trabalhados
- [x] **Runtime agnóstico ao domínio** — nenhum módulo conhece latência/deploy/incidente; só lê contratos e executa
- [x] **Mapeamento contrato → código** — cada chave YAML tem um ponto de leitura no Python
- [x] **Spec-driven** — a especificação dirige o comportamento; o código apenas obedece
- [x] **Feedback loop** — `avaliar` registra qualidade no histórico; o próximo `perceber` enxerga; a decisão melhora porque o estado melhora
- [x] **Circuit breaker com autocorreção** — valida e conserta a decisão da LLM antes de executar
- [x] **Geração de tools a partir de contrato** — `construir_ferramenta` cria a implementação; o schema da skill não muda
- [x] **Observabilidade estruturada** — `telemetria.py` emite `telemetry_stream`, `audit_logs`, `health_metrics` e `performance_data`
- [x] **Debug por trace** — relacionar cada etapa do `trace.json` ao código que a produziu

## Aprendizados
- [x] O valor desta aula não é rodar o agente (igual a 001), e sim **saber onde cada decisão nasce no código** — é o que separa "usar" de "debugar" um agente.
- [x] "Markdown é documentação, YAML é máquina": o bloco YAML dentro do `.md` é o único pedaço que chega ao runtime.
- [x] A avaliação (`avaliar`) é o que fecha o ciclo — qualidade `parcial` num passo muda o contexto do passo seguinte, e a LLM decide diferente sem qualquer mudança de código.
- [x] Telemetria com `trace_id`, duração por fase e taxa de sucesso por ferramenta é o que torna o agente **auditável**: o trace mostra onde, quando e por quê algo deu errado.

## Referências
- [001-contratos](../001-contratos/README.md) — a aula anterior, focada na definição declarativa do agente
- [OpenAI API — Structured Outputs](https://platform.openai.com/docs/guides/structured-outputs)
- [PyYAML](https://pyyaml.org/wiki/PyYAMLDocumentation)
- [python-dotenv](https://github.com/theskumar/python-dotenv)
