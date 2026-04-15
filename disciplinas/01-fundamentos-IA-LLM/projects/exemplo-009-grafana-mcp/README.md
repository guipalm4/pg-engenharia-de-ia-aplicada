# Exemplo 009 — Grafana MCP + Observabilidade + Diagnóstico de Bugs com IA

> Demonstra como usar o **Grafana MCP** para investigar bugs de produção diretamente do IDE, consultando métricas (Prometheus), logs (Loki) e traces (Tempo) de uma aplicação Node.js instrumentada com OpenTelemetry.

## Contexto
- Disciplina: Fundamentos de IA e LLMs
- Período: Abril/2026
- Autor: guipalm4

## Descrição

Este exemplo explora o **Grafana MCP** como ferramenta de diagnóstico assistido por IA: em vez de abrir o Grafana no browser e navegar manualmente entre dashboards, o agente consulta métricas, logs e traces diretamente do IDE usando linguagem natural.

O projeto é composto por uma aplicação Node.js/Fastify (**alumnus**) com instrumentação OpenTelemetry completa e uma stack de observabilidade containerizada (Prometheus, Loki, Tempo, Grafana, OpenTelemetry Collector). A aplicação expõe um cenário intencional de bug de produção — **DB Leaky Connections** — onde conexões com o banco de dados são adquiridas mas nunca liberadas, causando timeout a partir da 3ª requisição.

O fluxo principal do exemplo é: executar a stack, provocar o bug, e então usar prompts no IDE (via Grafana MCP) para diagnosticar a causa raiz cruzando métricas, logs e traces — chegando ao arquivo e linha exatos do problema sem abrir nenhuma interface gráfica.

O arquivo `prompts/prompt.md` documenta o cenário de investigação passo a passo, e `prompts/grafana-mcp-prompts.md` traz prompts reutilizáveis para explorar Prometheus, Loki e Tempo via MCP.

## Tecnologias e Ferramentas
- [x] Node.js 22 + TypeScript (native strip types — sem transpilação)
- [x] Fastify — web framework da aplicação demo
- [x] PostgreSQL 16 — banco de dados da aplicação
- [x] OpenTelemetry SDK — instrumentação automática de traces, métricas e logs
- [x] OpenTelemetry Collector — hub central de telemetria (OTLP/gRPC)
- [x] Prometheus — coleta e armazenamento de métricas
- [x] Grafana Loki — agregação de logs
- [x] Grafana Tempo — backend de tracing distribuído
- [x] Grafana — visualização e correlação de observabilidade
- [x] Blackbox Exporter — monitoramento de disponibilidade de endpoints
- [x] Grafana MCP — integração com IDE para consultar observabilidade via linguagem natural
- [x] Docker Compose — orquestração de toda a stack

## Pré-requisitos

- Docker e Docker Compose instalados
- Node.js 22+
- **Grafana MCP configurado no IDE** (Windsurf ou Claude Code)

### Configurando o Grafana MCP

Adicione ao arquivo de configuração MCP do seu IDE (`~/.codeium/windsurf/mcp_config.json` ou equivalente):

```json
{
  "mcpServers": {
    "grafana": {
      "type": "sse",
      "url": "http://localhost:8000/mcp"
    }
  }
}
```

O MCP fica disponível após subir a stack com `npm run docker:infra:up`.

## Como executar

```bash
cd alumnus

# Subir toda a stack de observabilidade
npm run docker:infra:up

# (opcional) Subir também a aplicação demo via Docker
npm run docker:app

# Ou rodar a aplicação demo localmente
npm start
```

### Provocando o bug de DB Leaky Connections

```bash
# Primeiras 2 requisições retornam 200
curl http://localhost:9000/students/db-leaky-connections
curl http://localhost:9000/students/db-leaky-connections

# 3ª requisição em diante retorna 500 (pool esgotado)
curl http://localhost:9000/students/db-leaky-connections

# Resetar as conexões vazadas para testar novamente
curl -X POST http://localhost:9000/students/db-leaky-connections/reset
```

### Investigando via Grafana MCP (no IDE)

```
Estou vendo erros 500 no endpoint /students/db-leaky-connections.

Por favor, investigue e forneça um relatório dos últimos 15 minutos:
1. Métricas Prometheus — requisições com status 500 e tempos de resposta
2. Logs Loki — mensagens de erro e stack traces correlacionados
3. Traces Tempo — spans com erro e hierarquia de operações
4. Causa raiz — arquivo e linha exatos do problema
```

### Serviços disponíveis após `docker:infra:up`

| Serviço | URL |
|---------|-----|
| Grafana | http://localhost:3000 |
| Prometheus | http://localhost:9090 |
| Loki | http://localhost:3100 |
| Tempo | http://localhost:3200 |
| Aplicação demo | http://localhost:9000 |
| OTel Collector (gRPC) | localhost:4317 |
| Blackbox Exporter | http://localhost:9115 |

### Parando a stack

```bash
npm run docker:infra:down

# Remove volumes e storage local
npm run docker:infra:cleanup
```

## Estrutura do Projeto

```
exemplo-009-grafana-mcp/
└── alumnus/
    ├── _alumnus/                          # Aplicação demo (Node.js/Fastify/TypeScript)
    │   ├── src/
    │   │   ├── index.ts                   # Entry point
    │   │   ├── app.ts                     # Setup do servidor Fastify e cenários
    │   │   ├── types.ts                   # Tipos compartilhados
    │   │   ├── monitoring/
    │   │   │   └── otel.ts                # Inicialização do OpenTelemetry SDK
    │   │   ├── database/
    │   │   │   └── db.ts                  # Conexão e seed do PostgreSQL via Knex
    │   │   ├── util/
    │   │   │   └── config.ts              # Variáveis de ambiente tipadas
    │   │   └── scenarios/
    │   │       ├── _base/baseScenario.ts  # Classe base para cenários
    │   │       └── db-leaky-connections/
    │   │           └── main.ts            # Bug intencional: pool sem client.release()
    │   └── test/
    │       └── db-connections-scenario.test.ts
    ├── infra/                             # Stack de observabilidade
    │   ├── docker-compose-infra.yaml      # Infraestrutura (sem app)
    │   ├── otel-collector/                # Config do OpenTelemetry Collector
    │   ├── prometheus/                    # Scrape configs e alertas
    │   ├── loki/                          # Config do Loki
    │   ├── tempo/                         # Config do Tempo
    │   ├── grafana/                       # Dashboards, datasources, alertas
    │   └── blackbox/                      # Probes de disponibilidade
    └── prompts/
        ├── prompt.md                      # Investigação passo a passo do bug via MCP
        └── grafana-mcp-prompts.md         # Prompts reutilizáveis para Prometheus/Loki/Tempo
```

## Como funciona

```
Aplicação (_alumnus)
  │
  │  OTLP/gRPC (port 4317)
  ▼
OpenTelemetry Collector  ──► Tempo   (traces)
                         ──► Loki    (logs)
                         ──► Prometheus (metrics)
                                │
                                ▼
                            Grafana  ◄── Grafana MCP ◄── IDE (Claude/Windsurf)

Bug: DB Leaky Connections
  GET /students/db-leaky-connections
    → pool.connect()       # adquire conexão (max: 2)
    → client.query(...)    # executa a query
    → reply.send(...)      # retorna resposta
    → [sem client.release()] ← BUG: conexão nunca devolvida ao pool
    → na 3ª requisição: pool esgotado → timeout 1s → 500

Diagnóstico via MCP:
  Logs Loki   → 500s no endpoint, stack trace: main.ts:80
  Traces Tempo → spans de DB sem span de cleanup/release
  Metrics Prometheus → padrão: 2 sucessos → 100% falhas → reset → repete
  Conclusão → missing finally { client.release() } em main.ts:80
```

## Conceitos trabalhados
- [x] **Grafana MCP como ferramenta de diagnóstico** — o agente consulta métricas, logs e traces via linguagem natural sem sair do IDE
- [x] **OpenTelemetry auto-instrumentation** — traces e métricas capturados automaticamente para Fastify, Knex e HTTP sem código manual nos handlers
- [x] **Correlação de sinais de observabilidade** — trace IDs em logs permitem navegar de Loki para Tempo; exemplars ligam métricas a traces no Prometheus/Grafana
- [x] **Connection pool leak** — bug realista onde `pg.Pool.connect()` sem `client.release()` esgota o pool com max=2 conexões
- [x] **Cenário de bug isolado** — `BaseScenario` abstrai init/routes/terminate para registrar o bug como módulo testável
- [x] **Stack de observabilidade completa** — OTel Collector como hub central distribui traces para Tempo, logs para Loki e métricas para Prometheus

## Aprendizados
- [x] O Grafana MCP elimina o ciclo "bug → abrir browser → navegar dashboards → correlacionar manualmente" — a IA faz a correlação em um único prompt
- [x] Pool com `max: 2` torna o leak visível rapidamente (3ª requisição já falha); em produção com pools de 10-100, o mesmo bug leva horas para aparecer
- [x] Traces sem span de `cleanup` são evidência direta do vazamento — a ausência de uma operação é tão informativa quanto a presença de um erro
- [x] O padrão "2 sucessos → 100% falhas → reset → repete" em métricas identifica o pool como gargalo antes mesmo de ler os logs
- [x] `node --experimental-strip-types` elimina a etapa de build para TypeScript em Node.js 22 — suficiente para demos e cenários de teste

## Referências
- [Grafana MCP — Documentação oficial](https://grafana.com/docs/grafana-cloud/developer-resources/api-reference/mcp/)
- [OpenTelemetry SDK Node.js](https://opentelemetry.io/docs/languages/js/getting-started/nodejs/)
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)
- [Grafana Tempo](https://grafana.com/docs/tempo/)
- [Grafana Loki](https://grafana.com/docs/loki/)
- [Prometheus](https://prometheus.io/docs/)
- [pg — node-postgres](https://node-postgres.com/)

---
