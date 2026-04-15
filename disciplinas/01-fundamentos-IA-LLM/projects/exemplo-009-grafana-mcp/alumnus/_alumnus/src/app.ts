import { initOtel, shutDownOtel } from './monitoring/otel.ts'
import config from './util/config.ts'

import Fastify from 'fastify'
import { connect, seedDb } from './database/db.ts'
import { dbLeakyConnectionsScenario } from './scenarios/db-leaky-connections/main.ts'

async function initServer (customConfig = config, enabledScenarios: string[] = []) {
  await initOtel(customConfig)

  const app = Fastify({ logger: { level: customConfig.LOG_LEVEL } })
  const _db = await connect(customConfig.DATABASE_URL)
  await seedDb(_db)

  // Health check endpoint
  app.get('/health', async (_request, reply) => {
    app.log.info('health check was triggered')
    return reply.status(200).send({ message: 'ok' })
  })

  // Add ability to enable just some scenarios
  // for testing purposes
  const scenarios = [
    dbLeakyConnectionsScenario
  ].filter(scenario => enabledScenarios.length ? enabledScenarios.includes(scenario.name) : true)

  for (const scenario of scenarios) {
    await scenario.init(app, customConfig, _db)
    await scenario.registerRoutes(app, customConfig, _db)
  }

  app.addHook('onClose', async (_instance) => {
    console.log('closing...')

    await Promise.all([
      ...scenarios.map(scenario => scenario.terminate(app)),
      _db.destroy(),
      shutDownOtel()
    ])
  })

  return {
    app
  }
}

export { initServer }
