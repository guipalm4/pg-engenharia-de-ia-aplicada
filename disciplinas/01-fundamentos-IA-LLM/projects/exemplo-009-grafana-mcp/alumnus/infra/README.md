# alumnus Observability Infrastructure

This directory contains the complete observability stack for the alumnus application, including monitoring, logging, tracing, and alerting components.

## Components

### Monitoring & Metrics
- **Prometheus** - Metrics collection and storage
- **Grafana** - Visualization and dashboards
- **Blackbox Exporter** - Endpoint health monitoring

### Logging
- **Loki** - Log aggregation and querying
- **Promtail** - Log shipping (configured separately)

### Tracing
- **Tempo** - Distributed tracing backend
- **OpenTelemetry Collector** - Telemetry data collection and export

### Supporting Services
- **PostgreSQL** - Application database

## Quick Start

### Start Infrastructure

Docker Compose version must be 2.1.1 or higher.

```bash
npm run docker:infra:up
```

Or directly with docker compose:
```bash
docker compose -f infra/docker-compose-infra.yaml up -d
```

### Stop Infrastructure

```bash
npm run docker:infra:down
```

### View Logs

```bash
npm run docker:infra:logs
```

### Cleanup (removes volumes)

```bash
npm run docker:infra:cleanup
```

## Access Services

Once the infrastructure is running, access the following services:

| Service | URL | Credentials |
|---------|-----|-------------|
| Grafana | [http://localhost:3000](http://localhost:3000) | - |
| Prometheus | [http://localhost:9090](http://localhost:9090) | - |
| Loki | [http://localhost:3100](http://localhost:3100) | - |
| Tempo | [http://localhost:3200](http://localhost:3200) | - |

## Grafana Dashboards

Pre-configured dashboards are available in Grafana:

1. **Application Metrics** - HTTP request rates, latency, error rates
2. **Service Monitoring** - System metrics, resource usage

## Prometheus Alerts

Alert rules are configured for:
- High error rates (>5%)
- High latency (p95 >1s)
- Service unavailability

## Configuration Files

- `docker-compose-infra.yaml` - Main infrastructure composition
- `grafana/` - Dashboards, datasources, and alerting
- `prometheus/` - Scrape configs and alert rules
- `loki/` - Log aggregation configuration
- `tempo/` - Trace storage configuration
- `otel-collector/` - OpenTelemetry Collector configuration
- `blackbox/` - Health check configuration

## Troubleshooting

### Services not starting

Check logs:
```bash
npm run docker:infra:logs
```

### Port conflicts

Ensure the following ports are available:
- 3000 (Grafana)
- 3100 (Loki)
- 3200 (Tempo)
- 5432 (PostgreSQL)
- 9090 (Prometheus)
- 9115 (Blackbox Exporter)

### Reset everything

```bash
npm run docker:infra:cleanup
npm run docker:infra:up
```
