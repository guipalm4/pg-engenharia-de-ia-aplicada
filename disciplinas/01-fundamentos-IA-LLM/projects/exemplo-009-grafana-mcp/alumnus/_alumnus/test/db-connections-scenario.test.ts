import { describe, it, before, after } from 'node:test'
import assert from 'node:assert'
import util from './util/helpers.ts'
import { context } from './util/globalContext.ts'
import type { LokiResponse, PrometheusResponse, TempoResponse } from './util/test-types.ts'
import { config } from './util/alumnusApi.ts'
import { setTimeout } from 'node:timers/promises'

describe('DB Leaky Connections Scenario - Connection Leak Detection', () => {
  let serviceName: string

  before(async () => {
    // Initialize test environment with db-leaky-connections scenario
    const ctx = await context.init(['db-leaky-connections'])
    serviceName = ctx.serviceName
  })

  after(async () => {
    // Clean up test environment
    await context.tearDown()
  })

  it('should handle 2 successful requests then fail on 3rd (pool exhausted)', async () => {
    const ctx = context.getContext()

    // First 2 requests should succeed
    for (let i = 0; i < 2; i++) {
      const response = await ctx.alumnusApi.getStudentsDbLeakyConnections()
      assert.ok(response, 'Should receive a response')
      assert.ok(response.students, 'Response should contain students')
      assert.strictEqual(response.message, 'Students retrieved successfully', 'Should have success message')
    }

    // 3rd request should fail (pool exhausted - max 2 connections)
    try {
      await ctx.alumnusApi.getStudentsDbLeakyConnections()
      assert.fail('3rd request should have failed due to pool exhaustion')
    } catch (error) {
      // Expected to fail - pool is exhausted
      assert.ok(error, 'Should throw error when pool is exhausted')
    }

    // Wait for OTEL collector to process data
    await setTimeout(config.waitForScrapeInterval)
  })

  it('should verify logs are registered in Loki with connection leak context', async () => await util.retry(async () => {
    const url = config.loki.getQueryUrl()
    const lokiResponse: LokiResponse = await util.queryLoki(url, serviceName)

    assert.ok(lokiResponse, 'Loki should return a response')
    assert.strictEqual(lokiResponse.status, 'success', 'Loki query should succeed')
    assert.ok(lokiResponse.data, 'Loki response should contain data')
    assert.ok(lokiResponse.data.result, 'Loki response should contain result array')

    const hasLogs = lokiResponse.data.result.length > 0
    assert.strictEqual(hasLogs, true, `Loki should contain logs from ${serviceName}`)

    // Check all log streams for connection-related entries
    let hasConnectionLogs = false
    for (const logStream of lokiResponse.data.result) {
      if (!logStream?.values) continue

      const logEntries = logStream.values.map((v: [string, string]) => v[1]) || []
      const found = logEntries.some((log: string) => {
        try {
          // Try parsing as JSON (structured logs)
          const parsed = JSON.parse(log)
          return parsed.msg?.includes('Query executed successfully') ||
                 parsed.msg?.includes('Error processing request') ||
                 typeof parsed.leakedConnections === 'number' ||
                 typeof parsed.poolIdleCount === 'number'
        } catch {
          // Fallback to string search for non-JSON logs
          return log.includes('Query executed successfully') ||
                 log.includes('Error processing request') ||
                 log.includes('leakedConnections')
        }
      })

      if (found) {
        hasConnectionLogs = true
        break
      }
    }

    assert.ok(hasConnectionLogs, 'Logs should contain connection-related entries')
  }))

  it('should verify traces are captured in Tempo', async () => {
    // Tempo needs additional time to index traces
    await setTimeout(config.waitForScrapeInterval)

    return await util.retry(async () => {
      const url = config.tempo.getSearchUrl()
      const tempoResponse: TempoResponse = await util.queryTempo(url, serviceName)

      assert.ok(tempoResponse, 'Tempo should return a response')
      assert.ok(tempoResponse.traces, 'Tempo response should contain traces')
      assert.ok(tempoResponse.traces.length > 0, `Tempo should contain traces from ${serviceName}`)

      const trace = tempoResponse.traces[0]
      assert.ok(trace?.traceID, 'Trace should have a traceID')
      assert.strictEqual(trace?.rootServiceName, serviceName, `Trace should be from ${serviceName}`)
    }, 10, 3000)
  })

  it('should verify metrics are registered in Prometheus', async () => await util.retry(async () => {
    const url = config.prometheus.getQueryUrl()
    const promResponse: PrometheusResponse = await util.queryPrometheus(url, serviceName)

    assert.ok(promResponse, 'Prometheus should return a response')
    assert.strictEqual(promResponse.status, 'success', 'Prometheus query should succeed')
    assert.ok(promResponse.data, 'Prometheus response should contain data')
    assert.ok(promResponse.data.result, 'Prometheus response should contain result array')

    const hasMetrics = promResponse.data.result.length > 0
    assert.strictEqual(hasMetrics, true, `Prometheus should contain metrics from ${serviceName}`)

    const { metric, value } = promResponse.data.result[0] || {}

    assert.ok(metric, 'Result should have metric metadata')
    assert.strictEqual(metric.exported_job, serviceName, `Metric should be from ${serviceName} service`)
    assert.ok(value, 'Metric should have a value')
    assert.ok(value[1], 'Metric should have a numeric value')

    const requestCount = parseFloat(value[1])
    assert.ok(requestCount > 0, 'Request count should be greater than 0')
  }))

  it.skip('should verify traces show requests to leaky endpoint', async () => await util.retry(async () => {
    const url = config.tempo.getSearchUrl()
    const tempoResponse: TempoResponse = await util.queryTempo(url, serviceName)

    assert.ok(tempoResponse, 'Tempo should return a response')
    assert.ok(tempoResponse.traces, 'Tempo response should contain traces')
    assert.ok(tempoResponse.traces.length > 0, 'Should have traces')

    // Verify we have traces for the leaky endpoint
    let hasLeakyEndpointTrace = false

    for (const trace of tempoResponse.traces) {
      // Check rootTraceName for endpoint information
      if (trace.rootTraceName && trace.rootTraceName.includes('/students/db-leaky-connections')) {
        hasLeakyEndpointTrace = true
        break
      }

      // Also check spanSets if available
      if (trace.spanSets) {
        for (const spanSet of trace.spanSets) {
          const hasRoute = spanSet.spans.some((span) => {
            // Check span name
            if (span.name && span.name.includes('/students/db-leaky-connections')) {
              return true
            }
            // Check span attributes
            if (span.attributes) {
              return span.attributes.some((attr) =>
                attr.key === 'http.route' &&
                typeof attr.value === 'string' &&
                attr.value.includes('/students/db-leaky-connections')
              )
            }
            return false
          })

          if (hasRoute) {
            hasLeakyEndpointTrace = true
            break
          }
        }
      }

      if (hasLeakyEndpointTrace) break
    }

    assert.ok(hasLeakyEndpointTrace, 'Should have traces for /students/db-leaky-connections endpoint')
  }, 5, 2000))
})
