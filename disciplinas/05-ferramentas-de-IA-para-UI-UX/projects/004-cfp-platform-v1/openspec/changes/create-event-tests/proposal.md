## Why

Ensuring the reliability of the Event Registration flow is critical for the conference platform. Traditional E2E tests provide confidence that the frontend and backend integration works as expected for users.

## What Changes

I will create a new Cypress E2E test file specifically for the Event Registration screen (`/event/new`). This test will cover both a successful registration scenario and the validation of error messages when the form is submitted empty.

## Capabilities

### New Capabilities
- `event-registration-e2e`: Implementation of end-to-end tests for the Event Registration process using Cypress.

### Modified Capabilities
- (None)

## Impact

- **Frontend-E2E**: A new test file will be added to `frontend-e2e/src/e2e/event-registration.cy.ts`.
- **Infrastructure**: Existing Cypress/Nx configuration will be used to run the tests.
