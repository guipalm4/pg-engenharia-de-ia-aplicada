# Grafana MCP Tool - Example Prompts

## Infrastructure Overview
- **Application**: Node.js Fastify API with OpenTelemetry instrumentation
- **Datasources**: Prometheus (metrics), Loki (logs), Tempo (traces)
- **Services**: PostgreSQL
- **Monitoring**: Blackbox Exporter for health checks, OpenTelemetry Collector

---

## 📊 Query HTTP Request Metrics

**Prompt:**
```
Query Prometheus for HTTP request rate and latency metrics from the alumnus application over the last hour. Show me the request rate per endpoint and the p95 latency.
```

**What it does:**
- Queries `http_server_request_duration_seconds` metrics
- Shows request rates and latency percentiles
- Helps identify slow endpoints and traffic patterns

---

## 🔥 Check Firing Alerts

**Prompt:**
```
List all currently firing alerts from Prometheus and show me their severity, description, and how long they've been firing.
```

**What it does:**
- Lists alerts in "firing" state
- Shows critical infrastructure issues
- Provides alert metadata and duration

---

### Service Dependency Map
```
Query Tempo to generate a service dependency map showing all services called during a specific trace. Visualize the request flow through the microservices architecture.
```

---

## Tips for Effective Queries

1. **Time Ranges**: Always specify time ranges (e.g., "last hour", "last 30 minutes") for focused results
2. **Label Filters**: Use labels to filter metrics by service, instance, or job name
3. **Aggregations**: Use rate(), avg(), max() functions in PromQL for meaningful metrics
4. **Trace Correlation**: Leverage trace IDs in logs to jump between Loki and Tempo
5. **Alert Context**: When checking alerts, ask for severity, duration, and affected services


