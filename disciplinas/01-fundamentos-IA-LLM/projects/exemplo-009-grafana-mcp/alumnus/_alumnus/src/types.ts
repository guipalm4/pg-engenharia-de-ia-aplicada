import type { FastifyInstance } from 'fastify'
import type { Knex } from 'knex'

export interface Config {
  NODE_ENV: string
  PORT: number
  LOG_LEVEL: string
  DATABASE_URL: string
  OTEL_EXPORTER_OTLP_ENDPOINT: string
  OTEL_PROPAGATORS: string
  OTEL_METRICS_EXPORTER: string
  APPNAME: string
}

export type AppInstance = FastifyInstance
export type DatabaseConnection = Knex

export interface Student {
  id: number
  name: string
  courseId?: number
  course?: string
}
