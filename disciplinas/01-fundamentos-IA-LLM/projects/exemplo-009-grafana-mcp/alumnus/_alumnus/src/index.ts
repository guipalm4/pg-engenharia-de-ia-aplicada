import config from './util/config.ts'
import { initServer } from './app.ts'

const isProductionEnv = config.NODE_ENV === 'production'

// Start main app server
const { app } = await initServer(config)
const address = await app.listen({ host: '0.0.0.0', port: config.PORT })
const serverAddress = app.server.address()
const actualPort = typeof serverAddress === 'string'
  ? config.PORT
  : (serverAddress?.port ?? config.PORT)
console.info(`Server is running on ${address} (port: ${actualPort})`)

// Only run auto-requests in production
if (isProductionEnv) {
  setInterval(() => {
    app.log.info('requesting urls to generate spans and metrics')

    const defaultUrl = `http://localhost:${actualPort}`
    const endpoints = [
      '/students/db-leaky-connections'
    ]

    endpoints.forEach((endpoint) => {
      fetch(`${defaultUrl}${endpoint}`)
        .then(async (response) => {
          const data = await response.json()
          app.log.info(data)
        })
        .catch((err: unknown) => app.log.error({ err }, 'Error fetching endpoint'))
    })
  }, 2000)
}
