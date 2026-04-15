# DB Leaky Connections Scenario

## Overview

Simulates a production bug where database connections are acquired but never released. Uses a pool with max 2 connections to make the leak fail quickly (3rd request times out). In production, pools have 10-100 connections, making leaks harder to detect. This demonstrates using observability (logs, traces, metrics) to identify resource leaks.

## Endpoints

- `GET /students/db-leaky-connections` - Queries students (first 2 succeed, 3rd+ timeout)
- `POST /students/db-leaky-connections/reset` - Releases leaked connections for testing

## What's Captured

- **Logs**: Error messages, stack traces (main.ts:51, main.ts:80), response times
- **Traces**: HTTP/DB operations, missing cleanup spans, error exceptions
- **Metrics**: Success/failure rates, response time distribution

## The Bug

Connections acquired via `pool.connect()` but never released with `client.release()`. Missing `finally` block causes connections to stay checked out forever.

## Usage

```bash
# Requests 1-2 succeed, request 3+ fail with "Internal Server Error"
curl http://localhost:9000/students/db-leaky-connections

# Reset to test again
curl -X POST http://localhost:9000/students/db-leaky-connections/reset
```

## Grafana MCP Investigation

Investigate 500 errors to discover the connection leak using logs, traces, and metrics:

---

**Step 1:** Query Loki for 500 errors → Find `/students/db-leaky-connections` endpoint failing

**Step 2:** Analyze pattern → First 2 requests succeed (200), 3rd+ fail (500) with timeout

**Step 3:** Check response times → Success ~15ms, failures ~1000ms (suggests resource limit of 2)

**Step 4:** Extract stack traces → Error: "timeout exceeded when trying to connect" at `main.ts:51` (pool.connect) and `main.ts:80` (handler)

**Step 5:** Understand error → pg-pool timeout means all connections are in use and none released

**Step 6:** Check traces → Database operations present, but NO cleanup/release spans

**Step 7:** Query metrics → Confirms pattern: 2 successes then 100% failures, repeats after reset

**Step 8:** Conclude root cause → Connection leak at `main.ts:80`: connections acquired but never released

**Step 9:** Identify fix → Add `finally` block with `client.release()`

**Step 10:** Verify → All requests succeed after fix, no timeouts

---

## Single Comprehensive Prompt

For a complete diagnostic report in one query:

```
I'm seeing 500 errors on the /students/db-leaky-connections endpoint for my application.

Please investigate and provide a comprehensive report from the last 15 minutes including

1. Query Prometheus metrics
   - getting requests that ended as 500 for this endpoint
   - Include response times for failure cases

2. Query Loki logs - Correlate logs with the metrics found
   - Show all error-level logs for this endpoint
   - Extract complete error messages and stack traces
   - Show the pattern of failed requests over time

3. Query Tempo traces - Correlate traces with logs and metrics
   - Get traces related to the failed requests
   - Show the span hierarchy and operations
   - Include any error spans with exception details

4. Root cause analysis
   - Based on error patterns, metrics, stack traces, and trace analysis
   - Identify the exact file and line number causing the issue

5. Finally provide the simple diagnosis table or report with the correlation between the telemetry data.
```

**Expected AI Report:**

[See incident-report-db-leaky-connections-2025-12-16.md](./incident-report-db-leaky-connections-2025-12-16.md)

---

## Summary

From generic 500 error to root cause:
1. Pattern: 2 successes → all fail (pool size = 2)
2. Stack trace: `main.ts:80` (handler) missing `client.release()`
3. Traces: DB operations but no cleanup spans
4. Fix: Add `finally { client.release() }`

## The Fix

```typescript
const client = await this.pool.connect()
try {
  const result = await client.query('SELECT * FROM students LIMIT 1')
  return reply.send({ students: result.rows })
} finally {
  client.release() // Always release, even on error
}
```
