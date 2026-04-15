/**
 * Type definitions for test utilities
 */

export interface LokiStream {
  stream: Record<string, string>
  values: Array<[string, string]>
}

export interface LokiResponse {
  status: string
  data: {
    result: LokiStream[]
  }
}

export interface PrometheusMetric {
  exported_job: string
  [key: string]: string
}

export interface PrometheusResult {
  metric: PrometheusMetric
  value: [number, string]
}

export interface PrometheusResponse {
  status: string
  data: {
    result: PrometheusResult[]
  }
}

export interface TempoTrace {
  traceID: string
  rootServiceName: string
  rootTraceName: string
  startTimeUnixNano: string
  durationMs: number
  spanSets?: Array<{
    spans: Array<{
      spanID: string
      name: string
      attributes?: Array<{ key: string, value: unknown }>
    }>
  }>
}

export interface TempoResponse {
  traces: TempoTrace[]
}
