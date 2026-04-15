# Scenarios Architecture

This directory contains all application scenarios following a standardized architecture pattern using the `BaseScenario` class.

## Architecture Overview

All scenarios extend the `BaseScenario` class which provides a consistent lifecycle:

1. **Initialization** (`init`) - Setup connections, processes, and resources
2. **Route Registration** (`registerRoutes`) - Register HTTP endpoints
3. **Termination** (`terminate`) - Cleanup resources and connections

## BaseScenario Class

Located in `_base/BaseScenario.js`, this abstract class provides:

- **Lifecycle Management**: Consistent init/terminate pattern
- **State Tracking**: Prevents double initialization
- **Error Handling**: Centralized error logging
- **Template Methods**: Protected methods (`_init`, `_registerRoutes`, `_terminate`) for subclasses

### Usage Pattern

```javascript
import { BaseScenario } from '../_base/BaseScenario.js'

class MyScenario extends BaseScenario {
  constructor () {
    super('my-scenario')
    // Initialize instance variables
  }

  async _init (app, config, db) {
    // Setup connections, processes, etc.
  }

  async _registerRoutes (app, config, db) {
    // Register HTTP routes
    app.get('/my-endpoint', async (request, reply) => {
      // Handler logic
    })
  }

  async _terminate (app) {
    // Cleanup resources
  }
}

// Export singleton instance
export const myScenario = new MyScenario()
```

**Note**: This architecture uses a hybrid approach for encapsulation:
- **`#` prefix** for truly private fields (e.g., `#initialized`) that cannot be accessed outside the class
- **`_` prefix** for protected methods (e.g., `_init`, `_registerRoutes`, `_terminate`) that need to be overridden by subclasses

JavaScript's `#` private fields cannot be overridden in subclasses, so we use the `_` convention for methods that subclasses must implement while still using `#` for internal state that should remain truly private.

## Available Scenarios

### Simple Scenario (`simple/`)
- **Purpose**: Demonstrates database query pattern variations
- **Endpoint**: `GET /students`
- **Features**:
  - Query variation counter (cycles through 3 patterns)
  - **Good Query**: Efficient JOIN operation
  - **Bad Query**: N+1 query anti-pattern
  - **Not Found**: 401 response
  - Full span instrumentation with response payloads
  - Database operations with Knex ORM

**Query Patterns**:
```javascript
// Good Query - Single JOIN
SELECT students.id, students.name, courses.name as course
FROM students
INNER JOIN courses ON courses.id = students.courseId

// Bad Query - N+1 Problem
SELECT * FROM students
// Then for each student:
SELECT * FROM courses WHERE id = student.courseId
```

## Planned Scenarios

The following scenarios will be added in future PRs:

- **Load Balancer**: Cluster-based load balancing with worker processes
- **Worker Threads**: Parallel query execution using worker threads

## Adding a New Scenario

1. **Create scenario directory**: `scenarios/my-scenario/`

2. **Create main.js**:
```javascript
import { BaseScenario } from '../_base/BaseScenario.js'

class MyScenario extends BaseScenario {
  constructor () {
    super('my-scenario')
  }

  async _init (app, config, db) {
    // Initialize resources
  }

  async _registerRoutes (app, config, db) {
    app.get('/my-endpoint', async (request, reply) => {
      // Route handler
    })
  }

  async _terminate (app) {
    // Cleanup
  }
}

export const myScenario = new MyScenario()
```

3. **Register in app.js**:
```javascript
import { myScenario } from './scenarios/my-scenario/main.js'

const scenarios = [
  // ... existing scenarios
  myScenario
]
```

## Best Practices

### Initialization
- Initialize all external connections in `_init()`
- Store connection objects as instance variables
- Handle initialization errors gracefully
- Log initialization progress

### Route Registration
- Keep route handlers focused and concise
- Use span null guards: `span?.setAttribute()`
- Extract complex logic into separate methods
- Include proper error handling

### Termination
- Close all connections and resources
- Kill child processes gracefully
- Clear instance variables
- Handle termination errors without throwing

### Instance Variables
- Store connections, processes, and state as instance variables
- Use descriptive names (e.g., `this.redisClient`, `this.workerPool`)
- Initialize to `null` in constructor
- Reset to `null` in `_terminate()`

### Error Handling
- Use try/catch blocks in async operations
- Log errors with context
- Use span null guards for OpenTelemetry
- Return appropriate HTTP status codes

## Testing

Each scenario should be testable independently:

```javascript
const scenario = new MyScenario()
await scenario.init(app, config, db)
await scenario.registerRoutes(app, config, db)
// ... test routes
await scenario.terminate(app)
```

## Benefits of This Architecture

1. **Consistency**: All scenarios follow the same pattern
2. **Maintainability**: Easy to understand and modify
3. **Testability**: Each scenario can be tested independently
4. **Extensibility**: Simple to add new scenarios
5. **Lifecycle Management**: Automatic initialization and cleanup
6. **Error Handling**: Centralized error logging and state management
