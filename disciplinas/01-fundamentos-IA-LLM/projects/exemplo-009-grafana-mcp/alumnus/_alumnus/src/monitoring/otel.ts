import { diag, DiagConsoleLogger, DiagLogLevel } from '@opentelemetry/api'

import { NodeSDK } from '@opentelemetry/sdk-node'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc'

import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { FastifyOtelInstrumentation } from '@fastify/otel'
import { KnexInstrumentation } from '@opentelemetry/instrumentation-knex'
import {
  PeriodicExportingMetricReader
} from '@opentelemetry/sdk-metrics'

import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-grpc'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-grpc'

import { BatchSpanProcessor } from '@opentelemetry/sdk-trace-base'
import { BatchLogRecordProcessor } from '@opentelemetry/sdk-logs'
import type { Config } from '../types.ts'

let _sdk: NodeSDK | null = null

async function initOtel (config: Config): Promise<void> {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR)
  const serviceName = config.APPNAME

  const traceExporter = new OTLPTraceExporter()
  const metricExporter = new OTLPMetricExporter()
  const logExporter = new OTLPLogExporter()

  const metricReader = new PeriodicExportingMetricReader({
    exporter: metricExporter,
    exportIntervalMillis: 3000
  })

  const spanProcessor = new BatchSpanProcessor(traceExporter, {
    maxQueueSize: 2048,
    maxExportBatchSize: 512,
    scheduledDelayMillis: 5000,
    exportTimeoutMillis: 30000
  })

  _sdk = new NodeSDK({
    serviceName,
    traceExporter,
    metricReader,
    spanProcessor,
    logRecordProcessor: new BatchLogRecordProcessor(logExporter),
    instrumentations: [
      // Avoid double-instrumenting
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fastify': { enabled: false },
        '@opentelemetry/instrumentation-knex': { enabled: false },
      }),
      new FastifyOtelInstrumentation({
        registerOnInitialization: true
      }),
      new KnexInstrumentation(),
    ]
  })

  _sdk.start()
}

async function shutDownOtel (): Promise<void> {
  if (_sdk == null) throw new Error('OpenTelemetry SDK not initialized')
  await _sdk.shutdown()
}

export {
  initOtel,
  shutDownOtel
}
