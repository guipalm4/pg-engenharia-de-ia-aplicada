import env from 'env-var'
import { randomUUID } from 'node:crypto'

const appId = randomUUID().slice(0, 4)
const defaultAppName = `alumnus_app_${appId}`

const config = {
  PORT: env.get('PORT').default(9000).asPortNumber(),
  DATABASE_URL: env.get('DATABASE_URL').default(`postgresql://alumnus:alumnus_dev_password@localhost:5433/${defaultAppName}`).required().asString(),
  APPNAME: env.get('APPNAME').default(defaultAppName).required().asString(),

  OTEL_EXPORTER_OTLP_ENDPOINT: env.get('OTEL_EXPORTER_OTLP_ENDPOINT').default('http://localhost:4317').required().asString(),
  OTEL_EXPORTER_OTLP_COMPRESSION: env.get('OTEL_EXPORTER_OTLP_COMPRESSION').default('gzip').required().asString(),
  OTEL_PROPAGATORS: env.get('OTEL_PROPAGATORS').default('tracecontext,baggage').required().asString(),
  OTEL_METRICS_EXPORTER: env.get('OTEL_METRICS_EXPORTER').default('otlp').required().asString(),

  NODE_ENV: env.get('NODE_ENV').default('production').required().asString(),
  LOG_LEVEL: env.get('LOG_LEVEL').default('info').required().asString()
}

export default config
