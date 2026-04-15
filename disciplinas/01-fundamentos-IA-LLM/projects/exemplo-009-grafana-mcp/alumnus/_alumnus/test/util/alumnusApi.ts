import assert from 'node:assert'
import util from './helpers.ts'
import envVar from 'env-var'

export const config = {
  loki: {
    baseUrl: envVar.get('LOKI_URL').default('http://0.0.0.0:3100').required().asString(),
    queryPath: '/loki/api/v1/query_range',
    readyPath: '/ready',
    // Helper to build full URL
    getQueryUrl () {
      return new URL(this.queryPath, this.baseUrl)
    },
    getReadyUrl () {
      return `${this.baseUrl}${this.readyPath}`
    }
  },
  tempo: {
    baseUrl: envVar.get('TEMPO_URL').default('http://0.0.0.0:3200').required().asString(),
    searchPath: '/api/search',
    readyPath: '/ready',
    // Helper to build full URL
    getSearchUrl () {
      return new URL(this.searchPath, this.baseUrl)
    },
    getReadyUrl () {
      return `${this.baseUrl}${this.readyPath}`
    }
  },
  prometheus: {
    baseUrl: envVar.get('PROMETHEUS_URL').default('http://0.0.0.0:9090').required().asString(),
    queryPath: '/api/v1/query',
    healthyPath: '/-/healthy',
    // Helper to build full URL
    getQueryUrl () {
      return new URL(this.queryPath, this.baseUrl)
    },
    getHealthyUrl () {
      return `${this.baseUrl}${this.healthyPath}`
    }
  },
  app: {
    host: '127.0.0.1',
    endpoints: {
      health: '/health',
      students: '/students',
      studentsLoadBalancer: '/students/loadbalancer',
      studentsRedisCache: '/students/redis-cache',
      studentsWorkerThreads: '/students/async-worker-threads',
      studentsDbLeakyConnections: '/students/db-leaky-connections',
      studentsDbLeakyConnectionsHealth: '/students/db-leaky-connections/health'
    },
    // Helper to build app URLs
    getUrl (port: number, endpoint: string = '') {
      return `http://${this.host}:${port}${endpoint}`
    }
  },
  waitForScrapeInterval: envVar.get('WAIT_FOR_SCRAPE_INTERVAL').default(5000).required().asIntPositive()
}

export class alumnusAPI {
  defaultAppEndpoint: string
  constructor (defaultAppEndpoint: string) {
    this.defaultAppEndpoint = defaultAppEndpoint
  }

  async checkServices (): Promise<void> {
    // Wait for main app to be ready
    const mainAppReady = await util.fetchWithRetry(`${this.defaultAppEndpoint}${config.app.endpoints.health}`)
    assert.strictEqual(mainAppReady?.ok, true, 'Main app should be ready')

    const lokiReady = await util.fetchWithRetry(config.loki.getReadyUrl())
    assert.strictEqual(lokiReady?.ok, true, 'Loki should be ready')

    const promHealth = await util.fetchWithRetry(config.prometheus.getHealthyUrl())
    assert.strictEqual(promHealth?.ok, true, 'Prometheus should be healthy')

    const tempoReady = await util.fetchWithRetry(config.tempo.getReadyUrl())
    assert.strictEqual(tempoReady?.ok, true, 'Tempo should be ready')
  }

  async getStudents (): Promise<void> {
    const response = await util.fetchWithRetry(`${this.defaultAppEndpoint}${config.app.endpoints.students}`)
    assert.ok(response?.ok, 'Request should succeed')
  }

  async getStudentsLoadBalancer (): Promise<void> {
    const response = await util.fetchWithRetry(`${this.defaultAppEndpoint}${config.app.endpoints.studentsLoadBalancer}`)
    assert.ok(response?.ok, 'Load balancer request should succeed')
  }

  async getStudentsRedisCache (): Promise<void> {
    const response = await util.fetchWithRetry(`${this.defaultAppEndpoint}${config.app.endpoints.studentsRedisCache}`)
    assert.ok(response?.ok, 'Redis cache request should succeed')
  }

  async getStudentsWorkerThreads (): Promise<void> {
    const response = await util.fetchWithRetry(`${this.defaultAppEndpoint}${config.app.endpoints.studentsWorkerThreads}`)
    assert.ok(response?.ok, 'Worker threads request should succeed')
  }

  async flushRedisCache (): Promise<void> {
    const response = await util.fetchWithRetry(`${this.defaultAppEndpoint}${config.app.endpoints.studentsRedisCache}/flush`, {
      method: 'DELETE'
    })
    assert.ok(response?.ok, 'Redis cache flush should succeed')
  }

  async getStudentsDbLeakyConnections (): Promise<{
    students: Array<{ id: number, name: string, course?: string }>
    message: string
  }> {
    const response = await util.fetchWithRetry(`${this.defaultAppEndpoint}${config.app.endpoints.studentsDbLeakyConnections}`)

    // If response is not OK, throw error with status code and message
    if (!response?.ok) {
      if (!response) {
        throw new Error('No response received')
      }
      const errorData = await response.json() as { error?: string, message?: string }
      const error = new Error(errorData.message || errorData.error || 'Request failed') as Error & { statusCode: number }
      error.statusCode = response.status
      throw error
    }

    return await response.json() as Promise<{
      students: Array<{ id: number, name: string, course?: string }>
      message: string
    }>
  }

  async getDbLeakyConnectionsHealth (): Promise<{
    leakedConnections: number
    status: string
    message: string
  }> {
    const response = await util.fetchWithRetry(`${this.defaultAppEndpoint}${config.app.endpoints.studentsDbLeakyConnectionsHealth}`)
    assert.ok(response?.ok, 'DB leaky connections health request should succeed')
    return await response.json() as Promise<{
      leakedConnections: number
      status: string
      message: string
    }>
  }
}
