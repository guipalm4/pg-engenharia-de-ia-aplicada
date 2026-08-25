# Exemplo 008 — Otimização Inteligente de CI/CD

> Um agente de plataforma lê um workflow de GitHub Actions que instala dependências do zero a cada push, reescreve o YAML com cache e estima o tempo economizado.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Um agente com o papel de *Engenheiro de Platform e CI/CD* recebe um workflow de GitHub Actions que roda `npm install` do zero a cada push, identifica o desperdício e devolve o YAML reescrito com cache, mais uma estimativa do tempo economizado.

O trabalho automatizado aqui é **otimização de pipeline**: a distância entre "o build demora" e "esta linha é a causa, troque por esta". É um problema com resposta conhecida — cache de dependências em CI é prática documentada há uma década —, e essa é justamente a razão de ele ser interessante como exercício: dá para checar o que o agente produziu contra um padrão externo, o que quase nenhuma aula da trilha permite.

O pipeline é o mais simples possível: um agente, uma task, uma tool, uma volta. O que rende a aula é o **enunciado**, não a orquestração: a task entrega o diagnóstico pronto entre parênteses — `(dica: falta de cache)` — e pede que o agente o "identifique". Uma dica assim é redundante para o diagnóstico, que o modelo alcança sozinho, e decisiva para a solução, porque nomeia a técnica e fecha o espaço de resposta em volta dela.

O GitHub Actions entra apenas como formato: nenhum runner é acionado, `data/workflow_lento.yaml` é fixture de um repositório fictício — sem `package.json` nem lockfile —, `analyze_workflow_yaml` é um `open().read()` que não parseia YAML, e o resultado sai como texto no terminal, sem passar por um validador.

Esta aula acrescenta o `get_cicd_agent` (8º papel), o `cicd.py` com a tool `analyze_workflow_yaml` declarada inline e o `data/workflow_lento.yaml`, a entrada do pipeline.

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

Funcionando, o terminal mostra o painel `🤖 Agent Started`, a linha `Tool analyze_workflow_yaml executed with result: name: CI Checkout Service...` confirmando a leitura do workflow, e o painel `✅ Agent Final Answer` com o YAML reescrito, a explicação técnica e a estimativa de economia. Nada é escrito em disco.

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
│                                 #   nenhuma é usada neste pipeline
├── tests/                        # testes herdados das aulas 003–005
└── pyproject.toml                # idêntico ao da 007, só muda o `name`
```

> `tools/file_writer.py`, herdada da 002, é o que separaria este exercício do da 003: entregá-la ao agente faria o YAML otimizado virar arquivo em disco, e um artefato em disco é o que um validador como o `actionlint` consegue ler.

## Como funciona

```
uv run cicd.py
   │
   ├─ PROJECT_ROOT = dirname(abspath(__file__))            ← raiz da aula
   ├─ yaml_workflow_path = PROJECT_ROOT/data/workflow_lento.yaml
   │
   ├─ @tool("analyze_workflow_yaml")
   │      def analyze_workflow_yaml(file_path: str) -> str:
   │          return open(file_path).read()                ← texto cru, sem parse de YAML
   │
   ├─ agent = get_cicd_agent(tools=[analyze_workflow_yaml])
   │
   ├─ task = Task(description=f"""Analise o workflow em '{yaml_workflow_path}'.
   │                             Identifique por que ele está lento (dica: falta de cache).
   │                             Reescreva o trecho aplicando cache para Node.js
   │                             e explique quanto tempo estimamos economizar.""")
   │                                    ↑
   │                   o caminho entra no prompt como TEXTO, e o diagnóstico vem junto
   │
   └─ Crew(agents=[agent], tasks=[task]).kickoff()
            │
            ├─ o LLM transcreve o caminho para o argumento da tool
            │        └─ analyze_workflow_yaml(file_path="/Users/.../workflow_lento.yaml")
            │                 └─ devolve as 13 linhas do workflow ao contexto
            │
            └─ resposta final em Markdown
                     ├─ diagnóstico: `npm install` sem cache reinstala tudo a cada push
                     ├─ YAML reescrito com os mesmos 5 steps + camada de cache
                     └─ estimativa de economia de tempo
```

O workflow de entrada tem um único gargalo declarado — `run: npm install` sem nenhum passo de cache antes — e o `on: [push]` faz cada commit pagar a instalação inteira. A reescrita restaura as dependências entre execuções, e é aí que a escolha da técnica importa: `actions/cache` com chave por hash do lockfile, ou o cache que o `actions/setup-node` já embute.

## Conceitos trabalhados

- [x] **Agente especialista em plataforma** — o 8º papel da trilha, com `goal` de reduzir tempo de build
- [x] **Tool declarada inline no entrypoint** — mesmo padrão da 007, sem passar por `tools/`
- [x] **Arquivo como entrada do pipeline** — o caminho é montado em Python e viaja para o modelo dentro do prompt
- [x] **Cache de dependências em CI** — `actions/cache` manual vs. o cache embutido do `actions/setup-node`
- [x] **Efeito do enunciado sobre a resposta** — nomear a técnica no prompt estreita o espaço de solução que o agente explora
- [x] **Artefato executável sem validador** — YAML gerado que ninguém checa contra um linter antes de virar pipeline

## Aprendizados

- [x] Dar a resposta no prompt não economiza trabalho do modelo, escolhe por ele: nomear a técnica no enunciado prende a solução à técnica nomeada, mesmo quando existe uma mais atual para o mesmo problema
- [x] `npm ci` aborta sem `package-lock.json`, e o fixture não menciona lockfile: recomendação certa em abstrato e não verificável contra a evidência é o risco típico de LLM revisando configuração
- [x] Pedir estimativa de economia sem baseline produz número fabricado, no mesmo tom da parte correta do parecer — e número é o que se copia para um slide: uma economia de CI só se mede comparando a duração de dois runs reais
- [x] Cache de dependências em CI tem duas formas: restaurar `node_modules` por hash do lockfile com `actions/cache`, ou usar o cache que o `actions/setup-node` já embute — a segunda é menos código e não deixa chave de cache para manter
- [x] Artefato executável gerado por agente pede validador no pipeline (`actionlint`), não conferência manual depois — e cuidado: no YAML 1.1 do PyYAML a chave `on:` é lida como o booleano `True`

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [CrewAI — Tools](https://docs.crewai.com/concepts/tools)
- [GitHub Actions — Caching dependencies to speed up workflows](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [`actions/setup-node` — caching global packages data](https://github.com/actions/setup-node#caching-global-packages-data)
- [`npm ci` — documentação oficial](https://docs.npmjs.com/cli/v10/commands/npm-ci)
- [YAML 1.1 — tipo booleano (a origem do `on:` → `True`)](https://yaml.org/type/bool.html)
