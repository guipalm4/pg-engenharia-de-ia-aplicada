import pg from 'pg'
import { trace } from '@opentelemetry/api'
import { BaseScenario } from '../_base/baseScenario.ts'
import type { AppInstance, Config, DatabaseConnection } from '../../types.ts'

/**
 * DB Leaky Connections scenario - simulates a production bug
 * Creates a new database connection per request but forgets to clean it up
 * This is a realistic scenario where developers accidentally leak connections
 * The leak is only visible through auto-instrumentation (traces, logs, metrics)
 */
class DbLeakyConnectionsScenario extends BaseScenario {
  // Track leaked connections for cleanup on reset/terminate
  private leakedConnections: pg.PoolClient[] = []
  // Connection pool with artificially low limit to make leak visible quickly
  private pool: pg.Pool | null = null

  constructor () {
    super('db-leaky-connections')
  }

  protected async _init (app: AppInstance, config: Config, _db: DatabaseConnection): Promise<void> {
    // Create a pool with max 2 connections to make the leak fail fast
    // In real scenarios, this would be 10-100 connections
    this.pool = new pg.Pool({
      connectionString: config.DATABASE_URL,
      max: 2, // Only 2 connections allowed - 3rd request will timeout
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 1000 // Fail after 1 second if no connection available

    })

    app.log.info({
      maxConnections: 2,
      connectionTimeout: '1s'
    }, 'DB Leaky Connections scenario initialized with limited pool')
  }

  /**
   * Create a database connection - simulates a helper function that developers might write
   * The bug: gets connection from pool but never releases it back
   */
  private async createConnection (_dbUrl: string, app: AppInstance): Promise<pg.PoolClient> {
    if (!this.pool) {
      throw new Error('Connection pool not initialized')
    }

    app.log.debug('Acquiring connection from pool')

    // Get connection from pool - will timeout after 1s if pool is exhausted
    // This simulates the real scenario where connection pool runs out
    const client = await this.pool.connect()

    // Track for cleanup on reset (simulates leaked connections)
    this.leakedConnections.push(client)

    return client
  }

  /**
   * Cleanup all leaked connections (for reset/terminate)
   */
  private async cleanupAllConnections (): Promise<number> {
    const count = this.leakedConnections.length

    for (const client of this.leakedConnections) {
      // Release connection back to pool instead of ending it
      client.release()
    }

    this.leakedConnections = []

    return count
  }

  protected async _registerRoutes (app: AppInstance, config: Config, _db: DatabaseConnection): Promise<void> {
    // Endpoint that simulates a production bug - creates connections but forgets to clean them up
    app.get('/students/db-leaky-connections', async (_request, reply) => {
      try {
        app.log.info('Processing student query request')

        // BUG: Creates a new connection for every request
        // Developer forgot to reuse connections or use a connection pool properly
        const client = await this.createConnection(config.DATABASE_URL, app)

        // Execute query - this part works fine
        const result = await client.query('SELECT * FROM students LIMIT 1')
        const students = result.rows

        // BUG: Missing cleanup! Developer forgot to call client.release()
        // In production, this might be in a try-catch without a finally block
        // or the developer might assume the connection pool handles it

        return reply.send({
          students,
          message: 'Students retrieved successfully'
        })
      } catch (error) {
        // Record exception in OpenTelemetry trace
        const span = trace.getActiveSpan()
        span?.recordException(error as Error)
        span?.setStatus({ code: 2 }) // ERROR status

        app.log.error(error, 'Error processing request')

        // BUG: Even in error path, no cleanup happens
        // Return generic error - don't reveal the connection leak issue
        return reply.status(500).send({
          error: 'Internal Server Error',
          message: 'Failed to retrieve students data'
        })
      }
    })

    // Reset endpoint - cleans up leaked connections for testing
    app.post('/students/db-leaky-connections/reset', async (_request, reply) => {
      app.log.warn('Manual reset requested - cleaning up leaked connections')

      const cleanedCount = await this.cleanupAllConnections()

      return reply.send({
        message: 'Leaked connections cleaned up',
        cleanedCount,
        remainingConnections: this.leakedConnections.length
      })
    })

  }

  protected async _terminate (app: AppInstance): Promise<void> {
    app.log.info({
      leakedConnections: this.leakedConnections.length
    }, 'Terminating db-leaky-connections scenario')

    // Clean up all leaked connections on shutdown
    await this.cleanupAllConnections()

    // Close the pool
    await this.pool?.end()
    this.pool = null

    app.log.info('DB leaky connections scenario terminated')
  }

  /**
   * Get leaked connections count (for testing/monitoring)
   */
  getLeakedConnectionsCount (): number {
    return this.leakedConnections.length
  }
}

// Export singleton instance
export const dbLeakyConnectionsScenario = new DbLeakyConnectionsScenario()
