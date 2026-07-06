# Exemplo 007 — De Mock para Real: Padrão Adapter e Tools REST

> Introduz o padrão Adapter no runtime de agentes: skills declaram `tipo_implementacao: rest` no contrato, o runtime despacha dinamicamente para `rest_adapter.py` (HTTP + retries + auth via header) contra uma API FastAPI local — mock continua sendo o default e convive com tools reais no mesmo agente.

## Contexto
- Disciplina: Criação de Agentes
- Período: Pós-Graduação em Engenharia de IA Aplicada — UniPDS
- Autor: guipalm4

## Descrição
Até o projeto 006, todas as ferramentas dos agentes eram mock — a LLM gerava dados sintéticos a partir do contrato da skill. Este projeto é onde o agente sai do simulador: o `monitor-agent` passa a falar com APIs reais **sem que isso vire um `if/else` em Python para cada nova fonte**. A solução é o **padrão Adapter** com três responsabilidades em três arquivos: o contrato declara o tipo (`skills.md`), o runtime despacha (`ferramentas.py`), o adapter conecta (`adapters/rest_adapter.py`). O agente não muda.

O `skills.md` do `monitor-agent` ganha três campos novos por habilidade: `tipo_implementacao` (`rest` | `database` | `mcp` | `mock`; ausente = `mock`, backward compatible), `conexao` (metadados do adapter: `endpoint`, `metodo`, `timeout_segundos`, `retries`, `autenticacao`) e `limites` (rate limit declarado no contrato, ex.: `chamadas_por_minuto`). Três skills viram REST (`consultar_metricas`, `buscar_logs`, `historico_deploys`) e uma permanece mock (`relatorio_incidente`) — **mock e real convivem no mesmo agente**, cada habilidade evolui no seu ritmo.

No runtime, a função `_resolver_adapter` em `ferramentas.py` é o ponto único de despacho: lê `tipo_implementacao` e importa dinamicamente o adapter correspondente; se o módulo não existe (`ImportError`), degrada graciosamente para mock e o agente continua rodando. Os ramos `database` e `mcp` já estão abertos no resolver mesmo sem adapters implementados — adicionar Postgres ou MCP amanhã é criar `adapters/<nome>_adapter.py`, sem tocar no executor nem no agente (Open-Closed). O `rest_adapter.py` só conecta: lê o bloco `conexao` do contrato, monta a URL com `API_BASE_URL` do `.env`, injeta `API_KEY` no header `X-API-Key` quando `autenticacao: header_api_key`, mapeia argumentos em português do contrato para query params em inglês da API, executa com retry no número de tentativas declarado e devolve o resultado com marcas de proveniência (`_adapter: "rest"`, `_latencia_ms`) — ele não decide qual tool chamar (planejador faz), não valida se deveria chamar (rules fazem), não loga (hooks fazem).

Do outro lado do fio está `api_local/server.py`: uma API FastAPI em `http://localhost:8100` com 3 endpoints (`/api/v1/metrics`, `/api/v1/logs`, `/api/v1/deploys`) que casam com as 3 skills REST. Os dados são fixos e didáticos — ao contrário do mock, que sorteia tudo, os valores são consistentes entre execuções e auditáveis contra a fonte (abrir o endpoint no navegador). Isso torna o `trace.json` verificável: cada resultado de tool REST carrega `_adapter: "rest"` e latência de HTTP real, enquanto os resultados mock não têm a marca. Secrets ficam fora do contrato: `autenticacao: header_api_key` é declarado no `.md`, a chave vive no `.env`.

## Tecnologias e Ferramentas
- [x] **Python 3** — runtime do agente (stdlib: `argparse`, `pathlib`, `json`, `time`, `uuid`)
- [x] **FastAPI + Uvicorn** — API local de monitoramento (`api_local/server.py`) com dados consistentes entre execuções
- [x] **Requests** — cliente HTTP do `rest_adapter.py` (GET/POST com timeout e retries declarados no contrato)
- [x] **PyYAML** — parse dos contratos `.md` e da eval suite
- [x] **OpenAI SDK** (`gpt-4o-mini`, `response_format=json_object`) — planejador e skills mock via LLM
- [x] **python-dotenv** — carga de `OPENAI_API_KEY`, `API_BASE_URL` e `API_KEY`
- [x] **Contratos Markdown/YAML** — definição declarativa de agentes, skills e agora conexões (`conexao`, `limites`)

## Pré-requisitos
- **Python 3.10+** e `pip`
- (Opcional) **`OPENAI_API_KEY`** em `runtime/.env` — sem ela o planejador roda em modo mock determinístico
- **`API_BASE_URL`** e **`API_KEY`** em `runtime/.env` (ver `runtime/.env.example`) — apontam para a API local em `http://localhost:8100`

## Como executar
Dois terminais.

**Terminal 1** — sobe a API local:
```bash
cd disciplinas/04-criacao-de-agentes/projects/007-de-mock-para-real
pip install -r runtime/requirements.txt
python api_local/server.py
# Uvicorn running on http://0.0.0.0:8100
```

**Terminal 2** — roda o agente:
```bash
cd disciplinas/04-criacao-de-agentes/projects/007-de-mock-para-real/runtime
cp .env.example .env   # preencher API_BASE_URL/API_KEY (e opcionalmente OPENAI_API_KEY)
python main.py rodar --agente ../monitor-agent --entrada "alerta de latência no checkout"
```

O que muda no log:
```
[ferramentas] consultar_metricas → rest
[ferramentas] buscar_logs → rest
[ferramentas] historico_deploys → rest
```
E no `trace.json`, cada resultado de tool REST traz `"_adapter": "rest"` e `"_latencia_ms"`.

## Estrutura do Projeto
```
007-de-mock-para-real/
├── api_local/                     # NOVO
│   └── server.py                  # FastAPI :8100 — /metrics, /logs, /deploys (dados fixos, auditáveis)
│
├── monitor-agent/
│   └── skills.md                  # 3 skills viram REST (+ tipo_implementacao, conexao, limites); 1 fica mock
│
├── runtime/
│   ├── adapters/                  # NOVO
│   │   ├── __init__.py
│   │   └── rest_adapter.py        # criar_funcao_rest: HTTP + retries + auth via header + marcas _adapter/_latencia_ms
│   ├── ferramentas.py             # _resolver_adapter despacha por tipo_implementacao (fallback mock em ImportError)
│   ├── .env.example               # API_BASE_URL, API_KEY — secrets fora do contrato
│   ├── requirements.txt           # + requests, fastapi, uvicorn
│   └── ciclo.py  planejador.py  benchmark.py  ...   # papéis inalterados (pequenas limpezas)
│
├── architectures/                 # react, plan_execute, reflect — inalterados desde 005/006
├── evals/                         # dataset + suite — inalterados desde 006
└── backlog-decomposer/  trace-analyzer/   # inalterados
```

## Como funciona
O resolver é o ponto único de despacho — contrato declara, runtime resolve, adapter conecta:
```
construir_registro_ferramentas(habilidades):
  para cada habilidade:
    tipo = habilidade.tipo_implementacao (default: "mock")
    tipo == "rest"     -> import adapters.rest_adapter  -> criar_funcao_rest(habilidade)
    tipo == "database" -> import adapters.db_adapter    -> (slot aberto, ainda sem adapter)
    tipo == "mcp"      -> import adapters.mcp_adapter   -> (slot aberto, ainda sem adapter)
    ImportError em qualquer ramo -> construir_ferramenta(habilidade)   # fallback mock
    tipo ausente/mock            -> construir_ferramenta(habilidade)   # comportamento das U1/U2

criar_funcao_rest(habilidade) -> funcao(argumentos):
  1. lê endpoint, metodo, timeout_segundos, retries do bloco conexao
  2. monta URL com API_BASE_URL (.env)
  3. autenticacao == header_api_key -> injeta API_KEY (.env) no header X-API-Key
  4. mapeia argumentos do contrato (pt) para query params da API (en)
  5. executa com retry (timeout/conexão recusada re-tentam até 'retries')
  6. retorna {sucesso, dados, _adapter: "rest", _latencia_ms, _tokens}
```

Como distinguir mock de real no trace:

| Característica | Mock | REST |
|----------------|------|------|
| Valores entre execuções | aleatórios | consistentes (mesmos da API) |
| Latência da fase `agir` | ~0ms | ms de HTTP local |
| Marca no resultado | sem `_adapter` | `_adapter: "rest"` + `_latencia_ms` |
| Auditável contra fonte | não | sim — `localhost:8100/api/v1/metrics` no navegador |

## Conceitos trabalhados
- [x] **Padrão Adapter** — contrato declara o tipo, runtime despacha (`_resolver_adapter`), adapter conecta (`rest_adapter.py`); três responsabilidades, três arquivos, agente intocado
- [x] **Backward compatibility por default** — skill sem `tipo_implementacao` cai em mock; todo o runtime das unidades anteriores continua funcionando sem alteração
- [x] **Graceful degradation** — adapter não instalado (`ImportError`) → fallback para mock com aviso no console; o agente roda mesmo incompleto
- [x] **Princípio Open-Closed** — nova fonte de dados (DB, MCP) entra como arquivo novo em `adapters/` + ramo no resolver; executor, planejador e contratos do agente não mudam
- [x] **Secrets fora do contrato** — o `.md` declara `autenticacao: header_api_key` (o *quê*), o `.env` guarda a chave (o *valor*); credenciais nunca aparecem em contratos versionados
- [x] **Proveniência no trace** — `_adapter` e `_latencia_ms` marcam cada resultado, tornando auditável quais dados vieram da API real e quais do mock
- [x] **Coexistência mock/real** — cada skill resolve seu próprio adapter, então um mesmo agente mistura tools reais e simuladas durante a migração incremental

## Aprendizados
- [x] A alternativa ingênua (`if nome_skill == "consultar_metricas": chamar_api_x()`) acopla o runtime ao agente — cada skill nova exigiria PR no runtime; declarar o adapter no contrato inverte a dependência e mantém o runtime genérico.
- [x] `import requests` direto no executor faria o executor saber sobre HTTP, autenticação e retries; o adapter isola esse conhecimento e preserva a separação que os contratos estabeleceram (planejador decide, rules validam, hooks logam, adapter conecta).
- [x] O valor didático da API local vem da **consistência**: mock sorteia valores absurdos a cada execução, a API devolve sempre os mesmos — é isso que permite auditar o `trace.json` contra a fonte e ter certeza de qual dado veio de onde.
- [x] Deixar os ramos `database` e `mcp` abertos no resolver (mesmo sem adapters) documenta a extensão futura no próprio código — o slot existe, o fallback protege, e a aula seguinte só preenche a pasta.
- [x] Retry declarado no contrato (`retries: 2`) é guardrail de conexão, não de correção: com a API fora do ar, as tentativas se esgotam e o resultado volta com `sucesso: false` e o erro descrito — o agente decide o que fazer com a falha, o adapter não esconde.

## Referências
- [001-contratos](../001-contratos/README.md) — definição declarativa do agente
- [002-runtime](../002-runtime/README.md) — internos do runtime
- [003-observabilidade](../003-observabilidade/README.md) — trace como fonte de auditoria
- [005-arquiteturas-cognitivas](../005-arquiteturas-cognitivas/README.md) — arquitetura cognitiva plugável via contrato
- [006-evals-e-frameworks-mercado](../006-evals-e-frameworks-mercado/README.md) — eval harness e comparação de arquiteturas
- [Adapter Pattern — Refactoring Guru](https://refactoring.guru/design-patterns/adapter)
- [FastAPI](https://fastapi.tiangolo.com/)
- [Requests](https://requests.readthedocs.io/)
