# Exemplo 012 — Projeto Final: Orquestração Hierárquica

> Crew do CrewAI em processo hierárquico: um agente gerente recebe um incidente que atravessa SRE, segurança e custos, delega cada frente ao especialista correspondente e consolida as respostas num relatório executivo.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Todas as aulas anteriores montaram pipelines **sequenciais**: o desenvolvedor escreve uma `Task` por agente e o CrewAI as executa na ordem declarada. Aqui o desenho se inverte. Existe **uma única task**, escrita como missão de negócio, e quem decide o que fazer com ela é um agente — o `Nexus Manager`, instanciado com `allow_delegation=True` e registrado na Crew como `manager_agent`.

O cenário é um incidente multidomínio: o `checkout-api` fora do ar com erro 500 no Kubernetes, um backdoor crítico detectado no pacote XZ e um salto de 40% no custo de infraestrutura na última hora. Três especialistas ficam disponíveis na Crew — `SRE On-Call (Troubleshooting Expert)`, `Analista de DevSecOps AI` e `Consultor de FinOps Cloud` — mas nenhum recebe task própria. Cabe ao manager ler a missão, escolher a quem perguntar o quê e produzir a entrega final.

O mecanismo de delegação é o ponto da aula. Ao ativar `Process.hierarchical`, o CrewAI injeta no manager duas ferramentas sintéticas — `delegate_work_to_coworker` e `ask_question_to_coworker` — cuja descrição já vem preenchida com a lista de `role` dos agentes disponíveis. Delegar, portanto, é uma chamada de tool como outra qualquer: o manager escreve o nome do papel, a pergunta e o contexto; o CrewAI instancia uma sub-execução daquele agente e devolve a resposta como resultado da ferramenta.

Esta aula acrescenta o entrypoint `projeto_final.py` e a fábrica `get_nexus_manager_agent` em `core/agents.py`; `tools/` e `tests/` vêm das aulas anteriores sem alteração.

## Tecnologias e Ferramentas

- [x] **Python 3.12** — runtime dos agentes
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — `Process.hierarchical`, `manager_agent` e as tools de delegação entre agentes
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** — motor de inferência (free tier); modelo em `GROQ_MODEL`, default `qwen/qwen3.6-27b`
- [x] **pytest** — testes herdados das aulas 003–005
- [x] **uv (workspace)** — ambiente único compartilhado por todas as aulas da disciplina

> Os três especialistas são instanciados **sem tools**: o incidente inteiro está descrito na task, e cada um responde com o conhecimento do modelo. Nada é executado contra cluster, scanner ou API de billing.

## Pré-requisitos

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python e as dependências
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`)

> ⚠️ **O `cd` faz parte do comando.** Parar em `projects/` em vez da pasta da aula dá `ModuleNotFoundError: core`, porque os imports `core.*` resolvem pelo diretório do script.

## Como executar

```bash
cd disciplinas/06-aiops-engenharia-agentica/projects

# setup (uma vez para todas as aulas)
cp .env.example .env && $EDITOR .env   # cole a GROQ_API_KEY
uv sync --all-packages

cd 012-projeto-final-orquestracao-hierarquica

# pipeline hierárquico
uv run projeto_final.py

# testes (não precisam de API key)
uv run pytest -v
```

Funcionando, o terminal abre com `🚀 [NEXUS-BOT] INICIANDO OPERAÇÃO HIERÁRQUICA...`, mostra o painel `🤖 Agent Started` do `Nexus Manager` e, em seguida, painéis `🔧 Tool Execution Started` da ferramenta `delegate_work_to_coworker` intercalados com painéis dos especialistas acionados. Ao fim, `Crew Completion` e o relatório executivo consolidado sob `🏆 RELATÓRIO FINAL DO PROJETO INTEGRADO`.

## Estrutura do Projeto

```
012-projeto-final-orquestracao-hierarquica/
├── projeto_final.py              # entrypoint: os três especialistas, o manager,
│                                 #   a missão multidomínio e a Crew hierárquica
├── core/
│   ├── agents.py                 # fábricas das aulas 001–011 + get_nexus_manager_agent
│   └── llm_config.py             # Groq + RateLimitAwareLLM (herdado)
├── tools/                        # tools das aulas 001–006 (não usadas neste pipeline)
├── tests/                        # testes herdados das aulas 003–005
└── pyproject.toml                # membro virtual do workspace uv; pythonpath = ["."]
```

## Como funciona

```
missão multidomínio (K8s fora do ar + backdoor XZ + custo +40%)
   │  Task única, sem `agent=` atribuído
   ▼
Nexus Manager  (allow_delegation=True, manager_agent da Crew)
   │
   │  o CrewAI injeta as tools:
   │    delegate_work_to_coworker(coworker, task, context)
   │    ask_question_to_coworker(coworker, question, context)
   │  com a lista de coworkers montada a partir das `role`
   │
   ├──▶ "SRE On-Call (Troubleshooting Expert)"  ──▶ sub-execução ──▶ diagnóstico
   ├──▶ "Analista de DevSecOps AI"              ──▶ sub-execução ──▶ triagem do CVE
   └──▶ "Consultor de FinOps Cloud"             ──▶ sub-execução ──▶ causa do pico
   │
   ▼
relatório executivo consolidado  (saída da Crew)
```

1. **Uma task, nenhum dono declarado** — a `Task` não recebe `agent=`. No processo hierárquico o executor é sempre o `manager_agent` (`Crew._get_agent_to_use`), e é a ausência de `task.agent` que faz `Crew._update_manager_tools` montar a lista de coworkers a partir de `agents`, e não do próprio dono da task.
2. **Delegação como tool** — `AgentTools` gera `delegate_work_to_coworker` e `ask_question_to_coworker`; a descrição de cada uma já traz os `role` disponíveis, de modo que o manager escolhe o destinatário escrevendo o nome do papel.
3. **Sub-execução** — cada delegação roda o especialista como um agente completo, com task e contexto próprios, e devolve o texto da resposta como resultado da ferramenta.
4. **Consolidação** — de posse das respostas, o manager escreve o `expected_output` da missão: o relatório executivo. A saída da Crew é o texto dele, não a concatenação dos especialistas.

## Conceitos trabalhados

- [x] **Processo hierárquico** — `Process.hierarchical` troca a ordem declarada por decisão de runtime de um agente coordenador
- [x] **Manager agent** — `manager_agent` define quem executa a task e quem tem permissão de delegar
- [x] **`allow_delegation`** — é o flag que injeta as ferramentas de delegação; sem ele o manager não tem como chamar ninguém
- [x] **Delegação por `role`** — o coworker é endereçado pelo texto do papel, o que faz do `role` uma chave de roteamento, não só uma descrição
- [x] **Task orientada a missão** — a task descreve um objetivo de negócio multidomínio, não um passo de pipeline
- [x] **Especialistas sob demanda** — agentes ficam disponíveis na Crew sem task própria e só rodam quando o manager os aciona
- [x] **Consolidação executiva** — o `expected_output` do manager é um relatório único, e não a soma das saídas parciais

## Aprendizados

- [x] No processo hierárquico, deixar a `Task` sem `agent=` não é descuido: preencher esse campo faz o CrewAI montar a lista de coworkers a partir dele, e o manager passa a enxergar apenas a si mesmo como destino de delegação.
- [x] Delegar é chamar uma tool, então a escolha do especialista fica sujeita ao mesmo tipo de erro de qualquer tool call — nome de coworker que não bate com nenhum `role`, argumentos incompletos, chamada repetida.
- [x] O `role` de cada agente deixa de ser prosa e vira endereço: papéis parecidos ou genéricos aumentam a chance de o manager escrever um destinatário que não existe.
- [x] Cada delegação é uma execução de agente inteira, com prompt e resposta próprios, de modo que o custo do hierárquico cresce com o número de especialistas consultados — e não com o número de tasks escritas.
- [x] O manager não é obrigado a consultar todo mundo: com uma única task e liberdade de decisão, ele pode responder por conta própria as frentes que julgar cobertas, o que torna a instrução de coordenação parte do design da missão.

## Referências

- [CrewAI Docs — Hierarchical Process](https://docs.crewai.com/en/learn/hierarchical-process)
- [CrewAI Docs — Agents](https://docs.crewai.com/en/concepts/agents)
- [CrewAI Docs — Tasks](https://docs.crewai.com/en/concepts/tasks)
- [CVE-2024-3094 — backdoor no `xz`/`liblzma`](https://nvd.nist.gov/vuln/detail/CVE-2024-3094)
- [Google SRE Book — Incident Response](https://sre.google/sre-book/managing-incidents/)
