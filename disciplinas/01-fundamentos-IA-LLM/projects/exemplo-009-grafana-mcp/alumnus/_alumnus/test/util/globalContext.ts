import envConfig from '../../src/util/config.ts'
import { initServer } from '../../src/app.ts'
import { alumnusAPI, config } from './alumnusApi.ts'
import { dropDatabase } from '../../src/database/db.ts'
import { type AddressInfo } from 'node:net'
import { type FastifyInstance } from 'fastify'
import { randomUUID } from 'node:crypto'

interface Context {
  app: FastifyInstance
  appPort: number
  serviceName: string
  defaultAppEndpoint: string
  databaseUrl: string
  alumnusApi: alumnusAPI
}

export const context = {
  _context: {} as Context,
  updateContext (data: Context) {
    this._context = {
      ...this._context,
      ...data
    }
  },
  getContext () {
    return this._context
  },
  resetContext () {
    this._context = {} as Context
  },
  async init (enabledScenarios: string[] = []): Promise<Context> {
    try {
      const id = randomUUID().slice(0, 8)
      const testContext = {
        serviceName: `alumnus-test-${id}`,
      }

      const testConfig = {
        ...envConfig,
        APPNAME: testContext.serviceName,
        PORT: 0
      }

      const { app } = await initServer(testConfig, enabledScenarios)

      await app.listen({ host: '0.0.0.0', port: testConfig.PORT })
      const appPort = (app.server.address() as AddressInfo).port
      const defaultAppEndpoint = config.app.getUrl(appPort)
      const alumnusApi = new alumnusAPI(defaultAppEndpoint)

      this.updateContext({
        app,
        appPort,
        serviceName: testContext.serviceName,
        defaultAppEndpoint,
        databaseUrl: testConfig.DATABASE_URL,
        alumnusApi
      })

      await alumnusApi.checkServices()

      return this.getContext()
    } catch (error) {
      console.error('Failed to initialize test context:', error)
      await this.tearDown()
      throw error
    }
  },

  /**
     * Clean up test environment
     * - Closes application server
     * - Drops test database
     * - Resets context state
     */
  async tearDown (): Promise<void> {
    const { app, databaseUrl } = this.getContext()

    // Close app if it exists
    if (app) {
      await app.close()
    }

    // Drop test database if it exists
    if (databaseUrl) {
      try {
        await dropDatabase(databaseUrl)
      } catch (error) {
        console.error('Failed to drop test database:', error)
      }
    }

    // Reset context state
    this.resetContext()
  }

}
