import { setTimeout } from 'node:timers/promises'
import type { LokiResponse, PrometheusResponse, TempoResponse } from './test-types.ts'

/**
 * Retry helper function to execute a test function multiple times
 */
async function retry<T> (fn: () => Promise<T>, retries: number = 3, delay: number = 2000): Promise<T> {
  let lastError: unknown
  for (let i = 0; i < retries; i++) {
    try {
      return await fn()
    } catch (error: unknown) {
      lastError = error
      if (i < retries - 1) {
        await setTimeout(delay)
      }
    }
  }
  return await Promise.reject(lastError)
}

/**
 * Helper function to make HTTP requests with retry logic
 */
async function fetchWithRetry (url: string, options: RequestInit = {}, retries: number = 3): Promise<Response | undefined> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options)
      return response
    } catch (error: unknown) {
      if (i === retries - 1) throw error
      await setTimeout(1000)
    }
  }
}

/**
 * Query Loki for logs matching the service name
 */
async function queryLoki (url: URL, serviceName: string): Promise<LokiResponse> {
  const now = Date.now()
  const oneHourAgo = now - (60 * 60 * 1000)

  const query = `{service_name="${serviceName}"}`

  url.searchParams.append('query', query)
  url.searchParams.append('start', (oneHourAgo * 1000000).toString()) // nanoseconds
  url.searchParams.append('end', (now * 1000000).toString()) // nanoseconds
  url.searchParams.append('limit', '100')

  const response = await fetchWithRetry(url.toString())
  return await (response?.json() as Promise<LokiResponse>)
}

/**
 * Query Tempo for traces matching the service name
 * Uses tags parameter which is more reliable than TraceQL queries for recent traces
 */
async function queryTempo (url: URL, serviceName: string): Promise<TempoResponse> {
  const now = Date.now()
  const oneHourAgo = now - (60 * 60 * 1000)

  // Use tags parameter for more reliable querying of recent traces
  url.searchParams.append('tags', `service.name=${serviceName}`)
  url.searchParams.append('start', Math.floor(oneHourAgo / 1000).toString()) // seconds
  url.searchParams.append('end', Math.floor(now / 1000).toString()) // seconds

  const response = await fetchWithRetry(url.toString())

  return await (response?.json() as Promise<TempoResponse>)
}

/**
 * Query Prometheus for metrics matching the service name
 */
async function queryPrometheus (url: URL, serviceName: string): Promise<PrometheusResponse> {
  // Query for HTTP request metrics from the alumnus
  const query = `http_client_request_duration_seconds_count{exported_job="${serviceName}"}`

  url.searchParams.append('query', query)

  const response = await fetchWithRetry(url.toString())

  return await (response?.json() as Promise<PrometheusResponse>)
}

export default {
  retry,
  fetchWithRetry,
  queryLoki,
  queryTempo,
  queryPrometheus
}
