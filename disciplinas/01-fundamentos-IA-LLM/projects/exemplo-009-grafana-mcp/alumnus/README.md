# N|Sentinel Infrastructure

[![alumnus E2E Tests](https://github.com/erickwendel/actions/workflows/alumnus-tests.yaml/badge.svg)](https://github.com/erickwendel/actions/workflows/alumnus-tests.yaml)

This directory contains the complete observability and monitoring infrastructure for N|Sentinel, including distributed tracing, metrics collection, log aggregation, and alerting.

## 🏗️ Architecture Overview

```
┌─────────────┐
│  Demo App   │ ──────┐
└─────────────┘       │
                      │ OTLP (gRPC)
                      ▼
            ┌──────────────────────┐
            │ OpenTelemetry        │
            │ Collector            │
            │ (Central Hub)        │
            └──────────────────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        │             │             │             │
        ▼             ▼             ▼             ▼
   ┌────────┐   ┌────────┐   ┌────────┐   ┌────────┐
   │ Tempo  │   │  Loki  │   │ Prom   │   │        │
   │(Traces)│   │ (Logs) │   │(Metrics)│   │        │
   └────────┘   └────────┘   └────────┘   └────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                      │
                      ▼
                ┌──────────┐
                │ Grafana  │
                │(Visualize)│
                └──────────┘
```

> **Important Note**: Applications only send telemetry data to the **OpenTelemetry Collector** using OTLP protocol. The collector then distributes this data to the appropriate backend systems (Tempo, Loki, Prometheus) based on the data type.

## 📦 Components

### 🔄 OpenTelemetry Collector (`otel-collector/`)
**Central telemetry data hub** that receives, processes, and exports observability data.

**Responsibilities**:
- Receives OTLP data (traces, metrics, logs) from applications via gRPC (port 4317)
- Distributes traces to **Tempo**
- Forwards logs to **Loki** via OTLP
- Exports metrics to **Prometheus**
- Exposes its own metrics on port 8889

**Configuration**: `otel-collector/otel-collector-config.yaml`

**Ports**:
- `4317`: OTLP gRPC receiver (applications send data here)
- `8889`: Prometheus metrics exporter (exposed to host)

**Data Flow**:
```
Application → OTLP (gRPC) → Collector → {
    Traces  → Tempo
    Logs    → Loki
    Metrics → Prometheus
}
```

---

### 📊 Prometheus (`prometheus/`)
**Metrics collection and alerting engine** that scrapes and stores time-series data.

**Responsibilities**:
- Scrapes metrics from OpenTelemetry Collector (port 8889)
- Monitors service health via Blackbox Exporter
- Evaluates alerting rules
- Stores metrics with exemplar support for trace correlation
- Provides query interface for Grafana

**Configuration**:
- `prometheus/prometheus.yaml`: Scrape configs and feature flags
- `prometheus/alerts.yaml`: Alerting rules for service availability and performance

**Features Enabled**:
- OTLP write receiver
- Remote write receiver
- Exemplar storage (links metrics to traces)
- Native histograms

**Ports**: `9090` (Web UI and API, exposed to host)

---

### 🔍 Tempo (`tempo/`)
**Distributed tracing backend** optimized for high-volume trace storage.

**Responsibilities**:
- Receives traces from OpenTelemetry Collector via OTLP
- Stores traces efficiently using object storage format
- Provides trace query API for Grafana
- Supports trace-to-logs and trace-to-metrics correlation

**Configuration**: `tempo/tempo-config.yaml`

**Ports**:
- `3200`: HTTP API (Grafana queries here, exposed to host)
- `4317`: OTLP gRPC receiver (from collector, internal only)

**Storage**: Local filesystem (`./storage/tempo`)

---

###  Loki (`loki/`)
**Log aggregation system** designed for efficient log storage and querying.

**Responsibilities**:
- Receives logs from OpenTelemetry Collector via OTLP
- Indexes logs by labels (not full-text)
- Provides LogQL query interface
- Correlates logs with traces via trace IDs

**Configuration**: `loki/loki-config.yaml`

**Ports**:
- `3100`: HTTP API (Grafana queries here, exposed to host)
- OTLP endpoint: `http://loki:3100/otlp/v1/logs`

**Storage**: Local filesystem (`./storage/loki`)

---

### 📈 Grafana (`grafana/`)
**Unified observability platform** for visualization and exploration.

**Responsibilities**:
- Visualizes metrics from Prometheus
- Explores traces from Tempo
- Queries logs from Loki
- Displays alerts and dashboards
- Correlates traces, logs, and metrics

**Configuration**:
- `grafana/provisioning/datasources/`: Datasource configurations
- `grafana/provisioning/dashboards/`: Dashboard provisioning
- `grafana/dashboards/`: Dashboard JSON files
- `grafana/alerting/`: Alert rules

**Dashboards**:
1. **Service Monitoring Dashboard**: Infrastructure health and blackbox monitoring
2. **HTTP Metrics OpenTelemetry**: Application performance metrics
3. **Traces Overview**: Quick access to tracing tools

**Datasources**:
- **Prometheus**: Metrics and alerting
- **Loki**: Log aggregation with trace correlation
- **Tempo**: Distributed tracing with service maps

**Ports**: `3000` (Web UI, exposed to host)

**Access**: http://localhost:3000 (auto-login enabled as Admin)

---

### 🔲 Blackbox Exporter (`blackbox/`)
**External monitoring** for service availability and performance.

**Responsibilities**:
- Probes HTTP endpoints for availability and response time
- Tests TCP connectivity (databases)
- Performs ICMP pings for network connectivity
- Exposes probe results as Prometheus metrics

**Configuration**: `blackbox/blackbox.yaml`

**Probe Modules**:
- `http_2xx`: HTTP health checks
- `tcp_connect`: TCP port connectivity
- `icmp_ping`: Network reachability

**Ports**: `9115` (Metrics endpoint, exposed to host)

---

### 🗄️ Demo Application (`_alumnus/`)
**Sample Node.js application** demonstrating OpenTelemetry instrumentation.

**Features**:
- Fastify web framework
- PostgreSQL database integration
- Full OpenTelemetry instrumentation (traces, metrics, logs)
- Auto-instrumentation for HTTP, database, and framework
- Custom span attributes and metrics

**Instrumentation**:
- Uses `@opentelemetry/sdk-node` for automatic instrumentation
- Sends all telemetry to OpenTelemetry Collector via OTLP/gRPC
- Includes Knex and Fastify instrumentations

**Endpoints**:
- `GET /health`: Health check
- `GET /students`: Sample endpoint with database queries

**Ports**: `9000` (HTTP API, exposed to host)

**Database**: `alumnus-postgres` (PostgreSQL 16)
- **Host Port**: `5433` (mapped to container port 5432)
- **Connection**: `postgresql://alumnus:alumnus_dev_password@localhost:5433/alumnus_app`
- **Internal Connection**: `postgresql://alumnus:alumnus_dev_password@alumnus-postgres:5432/alumnus_app`

---

## 🚀 Getting Started

### Prerequisites
- Docker and Docker Compose
- Node.js 22+ (for running tests locally)

### Docker Compose Files

This project uses multiple Docker Compose files for different purposes:

- **`docker-compose.yaml`**: Main compose file that includes the infrastructure and spins up the demo application
- **`docker-compose-infra.yaml`**: Infrastructure-only services (for running tests locally without the app)
- **`docker-compose.test.yaml`**: Runs the E2E tests in a containerized environment (includes infrastructure + test runner)
- **`_alumnus/`**: Contains the demo application code and tests

### Starting the Infrastructure

**Option 1: Full Stack (Infrastructure + Demo App)**
```bash
# Starts all infrastructure services AND the demo application
docker compose up

# Check service status
docker compose ps
```

**Option 2: Infrastructure Only (for local testing)**
```bash
# Starts only the infrastructure services (no demo app)
# Useful when you want to run tests locally against the infrastructure
docker compose -f docker-compose-infra.yaml up

# In another terminal, run tests
cd _alumnus
npm test
```

**Option 3: Run Tests in Container**
```bash
# Runs tests in a containerized environment with all dependencies
# This is what CI/CD uses - ensures consistent test environment
docker compose -f docker-compose.test.yaml up --abort-on-container-exit

```


### Accessing Services

| Service | URL | Description |
|---------|-----|-------------|
| Grafana | http://localhost:3000 | Main observability dashboard |
| Prometheus | http://localhost:9090 | Metrics and alerts |
| Tempo | http://localhost:3200 | Tempo API |
| Loki | http://localhost:3100 | Loki API |
| Demo App | http://localhost:9000 | Sample application |
| Demo App PostgreSQL | localhost:5433 | PostgreSQL database (user: alumnus, db: alumnus_app) |
| OTel Collector (gRPC) | localhost:4317 | OTLP receiver endpoint |
| OTel Collector (metrics) | http://localhost:8889/metrics | Collector's own metrics |
| Blackbox Exporter | http://localhost:9115 | Probe metrics |

### Configuring MCP Integration

After starting the infrastructure with `pnpm alumnus:infra:up`, you can integrate Grafana with Windsurf's MCP (Model Context Protocol) to query metrics, logs, traces, and alerts directly from your IDE.

**Add this configuration to your Windsurf MCP config** (`~/.codeium/windsurf/mcp_config.json`):

```json
{
  "mcpServers": {
    "grafana": {
			"type": "sse",
			"url": "http://localhost:8000/mcp"
		}
}
```

**Example Prompts to Try:**

```
List all currently firing alerts from Prometheus

Query Prometheus for HTTP request rate from the alumnus application over the last hour

Search Loki logs for error messages in the last 30 minutes with trace IDs

Find slow database queries in Tempo traces where PostgreSQL operations took longer than 500ms

Query Tempo directly for traces with high latency in the last hour
```

For more example prompts and use cases, see [`grafana-mcp-prompts.md`](./docs/grafana-mcp-prompts.md).

### Stopping Services

```bash
# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

---

## 📊 Monitoring & Alerting

### Monitored Services

#### HTTP Health Checks (via Blackbox)
- Grafana: `http://grafana:3000/api/health`
- Prometheus: `http://prometheus:9090/-/healthy`
- Loki: `http://loki:3100/ready`
- Tempo: `http://tempo:3200/ready`

#### TCP Connectivity
- PostgreSQL: `postgres:5432`
- Demo App PostgreSQL: `alumnus-postgres:5432`

#### Network Connectivity (ICMP)
All services are monitored via ICMP ping for basic network reachability.

#### OpenTelemetry Collector
- Monitored via Prometheus scraping on port 8889
- Exposes metrics about received and exported telemetry

### Alert Rules

**Critical Alerts**:
- `ServiceDown`: HTTP service unavailable for 1+ minute
- `DatabaseDown`: Database unreachable for 1+ minute
- `HighErrorRate`: Error rate > 10% for 5 minutes
- `OpenTelemetryCollectorDown`: Collector unavailable for 1+ minute

**Warning Alerts**:
- `ServiceUnreachable`: ICMP ping failure for 2+ minutes
- `SlowResponseTime`: Response time > 1s for 5 minutes
- `HighMemoryUsage`: Memory usage > 80%

**Configuration**: See `prometheus/alerts.yaml` and `grafana/alerting/alerts.yaml`

## 🔗 Data Correlation

### Traces → Logs
- Trace IDs are automatically extracted from logs
- Click trace ID in Loki to jump to Tempo
- Configured via Loki's `derivedFields`

### Traces → Metrics
- Exemplars link metrics to traces
- Prometheus stores trace IDs with metric samples
- Click exemplar in Grafana to view trace

### Logs → Traces
- Tempo's `tracesToLogsV2` configuration
- Automatically queries Loki for logs matching trace ID
- Shows logs in trace timeline

---

## 📁 Directory Structure

```
infra/
├── README.md                          # This file
├── docker-compose.yml                 # Infrastructure services
│
├── _alumnus/                          # Sample application
│   ├── Dockerfile
│   ├── package.json
│   └── src/
│       ├── index.js                   # Application code
│       ├── otel.js                    # OpenTelemetry setup
│       └── db.js                      # Database connection
│
├── otel-collector/
│   └── otel-collector-config.yaml     # Collector configuration
│
├── prometheus/
│   ├── prometheus.yaml                # Scrape configs
│   └── alerts.yaml                    # Alert rules
│
├── tempo/
│   └── tempo-config.yaml              # Tempo configuration
│
├── loki/
│   └── loki-config.yaml               # Loki configuration
│
├── blackbox/
│   └── blackbox.yaml                  # Probe configurations
│
└── grafana/
    ├── provisioning/
    │   ├── datasources/
    │   │   └── datasources.yaml       # Datasource configs
    │   └── dashboards/
    │       └── dashboards.yaml        # Dashboard provisioning
    ├── dashboards/
    │   ├── service-monitoring.json    # Infrastructure dashboard
    │   └── app-metrics.json           # Application metrics
    └── alerting/
        └── alerts.yaml                # Grafana alert rules
```

---

## 🛠️ Troubleshooting

### OpenTelemetry Collector Not Receiving Data

**Check application configuration**:
```bash
# Verify OTLP endpoint
echo $OTEL_EXPORTER_OTLP_ENDPOINT
# Should be: http://opentelemetry-collector:4317
```

**Check collector logs**:
```bash
docker compose logs opentelemetry-collector
```

### Traces Not Appearing in Tempo

**Verify collector is forwarding traces**:
```bash
# Check collector metrics
curl http://localhost:8889/metrics | grep otelcol_exporter_sent_spans
```

**Check Tempo logs**:
```bash
docker compose logs tempo
```

### Metrics Not in Prometheus

**Check Prometheus targets**:
- Visit http://localhost:9090/targets
- Ensure `otel-collector-metrics` target is UP

**Check collector metrics endpoint**:
```bash
curl http://localhost:8889/metrics
```

### Logs Not in Loki

**Verify Loki is receiving data**:
```bash
# Check Loki metrics
curl http://localhost:3100/metrics | grep loki_distributor_lines_received_total
```

**Check collector logs for errors**:
```bash
docker compose logs opentelemetry-collector | grep -i loki
```

### Grafana Datasource Issues

**Recreate Grafana container**:
```bash
docker compose up -d --force-recreate grafana
```

**Check datasource health**:
- Grafana → Configuration → Data sources
- Test each datasource connection

---

## 📚 Additional Resources

### Documentation
- [OpenTelemetry Collector](https://opentelemetry.io/docs/collector/)
- [Prometheus](https://prometheus.io/docs/)
- [Grafana Tempo](https://grafana.com/docs/tempo/)
- [Grafana Loki](https://grafana.com/docs/loki/)
- [Blackbox Exporter](https://github.com/prometheus/blackbox_exporter)

---
