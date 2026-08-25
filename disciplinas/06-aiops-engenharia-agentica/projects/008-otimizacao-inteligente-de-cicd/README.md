# Exemplo 008 — Otimização Inteligente de CI/CD

> Um agente de plataforma lê um workflow de GitHub Actions sem cache, reescreve o YAML e estima a economia. A dica que o enunciado dá de presente não muda o diagnóstico — muda a solução, para pior.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Um agente com o papel de *Engenheiro de Platform e CI/CD* recebe um workflow de GitHub Actions que roda `npm install` do zero a cada push, identifica o desperdício e devolve o YAML reescrito com cache, mais uma estimativa do tempo economizado.

O trabalho automatizado aqui é **otimização de pipeline**: a distância entre "o build demora" e "esta linha é a causa, troque por esta". É um problema com resposta conhecida — cache de dependências em CI é prática documentada há uma década —, e essa é justamente a razão de ele ser interessante como exercício: dá para checar o que o agente produziu contra um padrão externo, o que quase nenhuma aula da trilha permite.

O pipeline é o mais simples possível: um agente, uma task, uma tool, uma volta. O que rende a aula é o **enunciado**, não a orquestração. A task entrega o diagnóstico pronto entre parênteses — `(dica: falta de cache)` — e pede que o agente o "identifique"; oito execuções controladas mostram que a dica é redundante para o diagnóstico e ativa para a solução.

O GitHub Actions não entra: nenhum runner é acionado, `data/workflow_lento.yaml` é fixture de um repositório fictício (sem `package.json` nem lockfile em lugar nenhum), `analyze_workflow_yaml` é um `open().read()` que não parseia YAML, e o resultado não é escrito nem validado por `actionlint`. A estimativa de economia que o enunciado pede não tem baseline algum por trás.

**O que esta aula acrescenta à trilha:** `get_cicd_agent` (8º papel), `cicd.py` com a tool `analyze_workflow_yaml` declarada inline e `data/workflow_lento.yaml`, a entrada do pipeline.

## Tecnologias e Ferramentas

- [x] **Python 3.12** — runtime dos agentes
- [x] **CrewAI** (`crewai`, `crewai[tools]`) — orquestração `Agent`/`Task`/`Crew`
- [x] **`@tool` decorator do CrewAI** — a tool desta aula é declarada no entrypoint, não em `tools/`
- [x] **LiteLLM** — camada de abstração de LLM usada pelo CrewAI
- [x] **Groq** — motor de inferência (free tier); modelo em `GROQ_MODEL`, default `qwen/qwen3.6-27b`
- [x] **GitHub Actions** — **apenas o formato do workflow**; nenhum runner é acionado
- [x] **pytest** — testes dos helpers herdados
- [x] **uv (workspace)** — ambiente único compartilhado por todas as aulas da disciplina

## Pré-requisitos

- **[uv](https://docs.astral.sh/uv/getting-started/installation/)** — gerencia o Python e as dependências
- Uma **chave de API da Groq** em `projects/.env` (`GROQ_API_KEY=...`)

> ⚠️ **O `cd` faz parte do comando.** Parar em `projects/` em vez da pasta da aula dá `ModuleNotFoundError: core`, porque os imports `core.*`/`tools.*` resolvem pelo diretório do script.

## Como executar

```bash
cd disciplinas/06-aiops-engenharia-agentica/projects

# setup (uma vez para todas as aulas)
cp .env.example .env && $EDITOR .env   # cole a GROQ_API_KEY
uv sync --all-packages

cd 008-otimizacao-inteligente-de-cicd

# otimização do workflow
uv run cicd.py

# testes (não precisam de API key)
uv run pytest -v
```

Funcionando, o terminal mostra o painel `🤖 Agent Started`, a linha `Tool analyze_workflow_yaml executed with result: name: CI Checkout Service...` e o painel `✅ Agent Final Answer` com o YAML reescrito, a explicação técnica e a estimativa de economia. Roda em poucos segundos com 2 chamadas ao modelo (~2.200–2.800 tokens), não escreve nada em disco, e `uv run pytest -v` reporta **41 passed**.

Entre execuções o diagnóstico é sempre a ausência de cache, o YAML sai válido com os 5 steps e `npm ci` é sempre recomendado; o que muda é o texto, os nomes dos steps e os números da estimativa.

## Estrutura do Projeto

```
008-otimizacao-inteligente-de-cicd/
├── cicd.py                       # entrypoint — e também onde vive a tool desta aula
│                                 #   @tool("analyze_workflow_yaml") declarada inline
├── data/
│   └── workflow_lento.yaml       # entrada do pipeline (13 linhas; `npm install` sem cache)
├── core/
│   ├── agents.py                 # + get_cicd_agent()  ← novo papel (o 8º da trilha)
│   └── llm_config.py             # Groq + RateLimitAwareLLM — herdado, intocado
├── tools/                        # 8 tools herdadas das aulas 001–006
│                                 #   NENHUMA é usada neste pipeline
├── tests/                        # 41 testes herdados das aulas 003–005
└── pyproject.toml                # idêntico ao da 007, só muda o `name`
```

> `tools/file_writer.py`, herdada da 002, está a um argumento de distância de fechar o ciclo: bastaria entregá-la ao agente para o YAML otimizado virar arquivo em vez de texto no terminal. A aula não faz isso, e é o que separa esta do exercício da 003.

## Conceitos trabalhados

- [x] **Agente especialista em plataforma** — o 8º papel da trilha, com `goal` de reduzir tempo de build
- [x] **Tool declarada inline no entrypoint** — mesmo padrão da 007, sem passar por `tools/`
- [x] **Arquivo como entrada do pipeline** — o caminho é montado em Python e viaja para o modelo dentro do prompt
- [x] **Cache de dependências em CI** — `actions/cache` manual vs. o cache embutido do `actions/setup-node`
- [x] **Efeito do enunciado sobre a resposta** — como uma dica bem-intencionada estreita o espaço de solução
- [x] **Geração sem validação** — o que muda quando o artefato produzido não tem validador no caminho

## Aprendizados

- [x] Dar a resposta no prompt não economiza trabalho do modelo, escolhe por ele: com a dica `(falta de cache)` o agente escreve sempre o `actions/cache` manual; sem ela chega ao mesmo diagnóstico e propõe o `setup-node` com cache embutido
- [x] Um enunciado calibrado para reproduzir o gabarito herda a idade do gabarito — sem a dica o agente ainda acrescenta otimizações que nenhuma execução guiada produziu
- [x] `npm ci` aborta sem `package-lock.json`, e o fixture não menciona lockfile: recomendação certa em abstrato e não verificável contra a evidência é o risco típico de LLM revisando configuração
- [x] Pedir estimativa de economia sem baseline produz número fabricado, no mesmo tom da parte correta do parecer — e número é o que se copia para um slide
- [x] Cache de dependências em CI tem duas formas: restaurar `node_modules` por hash do lockfile com `actions/cache`, ou usar o cache que o `actions/setup-node` já embute — a segunda é menos código e não deixa chave de cache para manter
- [x] Artefato executável gerado por agente pede validador no pipeline (`actionlint`), não conferência manual depois — e cuidado: no YAML 1.1 do PyYAML a chave `on:` é lida como o booleano `True`

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [CrewAI — Tools](https://docs.crewai.com/concepts/tools)
- [GitHub Actions — Caching dependencies to speed up workflows](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [`actions/setup-node` — caching global packages data](https://github.com/actions/setup-node#caching-global-packages-data)
- [`npm ci` — documentação oficial](https://docs.npmjs.com/cli/v10/commands/npm-ci)
- [YAML 1.1 — tipo booleano (a origem do `on:` → `True`)](https://yaml.org/type/bool.html)
