import type { AppInstance, Config, DatabaseConnection } from '../../types.ts'

export abstract class BaseScenario {
  #initialized: boolean = false
  public readonly name: string

  constructor (name: string) {
    this.name = name
  }

  async init (app: AppInstance, config: Config, db: DatabaseConnection): Promise<void> {
    if (this.#initialized) {
      app.log.warn(`Scenario ${this.name} already initialized`)
      return
    }

    app.log.info(`Initializing scenario: ${this.name}`)
    await this._init(app, config, db)
    this.#initialized = true
    app.log.info(`Scenario ${this.name} initialized successfully`)
  }

  async registerRoutes (app: AppInstance, config: Config, db: DatabaseConnection): Promise<void> {
    if (!this.#initialized) {
      throw new Error(`Scenario ${this.name} must be initialized before registering routes`)
    }

    app.log.info(`Registering routes for scenario: ${this.name}`)
    await this._registerRoutes(app, config, db)
    app.log.info(`Routes registered for scenario: ${this.name}`)
  }

  async terminate (app: AppInstance): Promise<void> {
    if (!this.#initialized) {
      app.log.warn(`Scenario ${this.name} not initialized, skipping termination`)
      return
    }

    app.log.info(`Terminating scenario: ${this.name}`)
    await this._terminate(app)
    this.#initialized = false
    app.log.info(`Scenario ${this.name} terminated successfully`)
  }

  protected async _init (_app: AppInstance, _config: Config, _db: DatabaseConnection): Promise<void> {
    // Default: no initialization needed
  }

  protected async _registerRoutes (_app: AppInstance, _config: Config, _db: DatabaseConnection): Promise<void> {
    throw new Error(`_registerRoutes must be implemented by ${this.name}`)
  }

  protected async _terminate (_app: AppInstance): Promise<void> {
    // Default: no cleanup needed!
  }
}
