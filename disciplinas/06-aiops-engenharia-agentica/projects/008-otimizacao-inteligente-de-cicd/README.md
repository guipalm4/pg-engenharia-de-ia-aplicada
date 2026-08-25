# Exemplo 008 — Otimização Inteligente de CI/CD

> Um agente de plataforma lê um workflow de GitHub Actions sem cache, reescreve o YAML e estima a economia. A dica que o enunciado dá de presente não muda o diagnóstico — muda a solução, para pior.

## Contexto

- Disciplina: AI-Ops e Engenharia Agêntica
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição

Um agente com o papel de *Engenheiro de Platform e CI/CD* recebe um workflow de GitHub Actions que roda `npm install` do zero a cada push, identifica o desperdício e devolve o YAML reescrito com cache, mais uma estimativa do tempo economizado.

O trabalho automatizado aqui é **otimização de pipeline**: a distância entre "o build demora" e "esta linha é a causa, troque por esta". É um problema com resposta conhecida — cache de dependências em CI é prática documentada há uma década —, e essa é justamente a razão de ele ser interessante como exercício: dá para checar o que o agente produziu contra um padrão externo, o que quase nenhuma aula da trilha permite.

O pipeline é o mais simples possível: um agente, uma task, uma tool, uma volta. O que rende a aula é o **enunciado**, não a orquestração. A task entrega o diagnóstico pronto entre parênteses — `(dica: falta de cache)` — e pede que o agente o "identifique". Oito execuções controladas mostram que a dica é redundante para o diagnóstico e ativa para a solução: com ela, o agente escreve sempre o padrão manual de cache; sem ela, sempre o moderno. Está tudo em *Aprendizados*.

## Herança

- **Esta aula acrescenta:** `get_cicd_agent` (8º papel da trilha) · `cicd.py`, que declara a tool `analyze_workflow_yaml` inline · `data/workflow_lento.yaml`, a entrada do pipeline.
- **Vem da 007 sem alteração:** todo o resto — `core/llm_config.py`, os `tests/` e as **8 tools de `tools/`, nenhuma delas usada neste pipeline**. O `data/trivy.json` da 007 saiu junto com o entrypoint que o consumia.

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

## Saída esperada

`uv run cicd.py` imprime o painel `🤖 Agent Started` com o enunciado; uma linha `Tool analyze_workflow_yaml executed with result: name: CI Checkout Service...`; e o painel `✅ Agent Final Answer` com o YAML reescrito em bloco de código, seguido da explicação técnica e da estimativa de economia. Sai com código 0 em poucos segundos e **não escreve nada em disco**.

`uv run pytest -v` deve reportar **41 passed** — são os testes herdados das aulas 003 a 005; esta aula não acrescenta testes.

**Custo medido** (`qwen/qwen3.6-27b`, 5 execuções da configuração original): **2 chamadas, 2.200–2.800 tokens**. A pior janela de 60s fica em torno de 35% do teto de 8.000 TPM, e cabem **~70 a 90 execuções** no teto diário de 200.000 tokens por modelo.

**O que é estável entre execuções** (medido em 8 runs):

- a tool é chamada exatamente uma vez;
- o diagnóstico é sempre a ausência de cache de dependências;
- o YAML devolvido é sempre sintaticamente válido e sempre tem 5 steps;
- `npm ci` é sempre recomendado.

**O que muda:** o texto da explicação, os nomes dos steps e — sempre — os números da estimativa de economia, que não têm base em dado nenhum (ver *Real vs. simulado*).

## Real vs. simulado

| Componente | Real ou simulado | O que isso implica para quem reusar |
|---|---|---|
| **Agente e inferência** | **Real** — chamada à API da Groq | é a única parte que custa e que varia |
| **GitHub Actions** | **Simulado** — nenhum runner é acionado, nada é executado | o projeto **não** demonstra integração com CI; o YAML nunca sai do terminal |
| **`data/workflow_lento.yaml`** | **Fixture válido, de repositório fictício** | não há `package.json` nem `package-lock.json` em lugar nenhum — o que derruba a recomendação que o agente sempre faz |
| **`analyze_workflow_yaml`** | **Real, mas não faz o que o nome diz** — é `open().read()` | não parseia YAML, não valida nada; a análise é 100% do LLM |
| **Estimativa de economia** | **Inventada** — não há histórico de build, tempo de runner ou baseline | "50 builds por dia", "70% de redução", "2 horas economizadas": todos números fabricados, e é o enunciado que os pede |
| **Validação do YAML gerado** | **Nenhuma** | nada roda `actionlint`, nada escreve o arquivo, nada compara com o original |

O pipeline termina sem erro em 100% das execuções porque nada é aplicado. Adequado para a aula, enganoso para quem copia.

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
- [x] Tool cujo nome promete análise mas cujo corpo é `open().read()` engana o LLM que lê esse nome para decidir usá-la
- [x] Artefato executável gerado por agente pede validador no pipeline (`actionlint`), não conferência manual depois — e cuidado: no YAML 1.1 do PyYAML a chave `on:` é lida como o booleano `True`

## Referências

- [CrewAI Docs](https://docs.crewai.com/)
- [CrewAI — Tools](https://docs.crewai.com/concepts/tools)
- [GitHub Actions — Caching dependencies to speed up workflows](https://docs.github.com/en/actions/using-workflows/caching-dependencies-to-speed-up-workflows)
- [`actions/setup-node` — caching global packages data](https://github.com/actions/setup-node#caching-global-packages-data)
- [`npm ci` — documentação oficial](https://docs.npmjs.com/cli/v10/commands/npm-ci)
- [YAML 1.1 — tipo booleano (a origem do `on:` → `True`)](https://yaml.org/type/bool.html)
