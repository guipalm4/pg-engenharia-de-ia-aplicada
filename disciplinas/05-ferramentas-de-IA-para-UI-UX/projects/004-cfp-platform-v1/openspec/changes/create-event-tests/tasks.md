## 1. Setup and Preparation

- [ ] 1.1 Verify Cypress configuration in `frontend-e2e`. (Note: The project currently appears to use Playwright, so we may need to sync or add Cypress support).
- [ ] 1.2 Create directory `frontend-e2e/src/e2e` if it does not exist.

## 2. Implement E2E Tests

- [ ] 2.1 Create file `frontend-e2e/src/e2e/event-registration.cy.ts`.
- [ ] 2.2 Implement "Success Scenario":
    - Navigate to `/event/new`.
    - Fill `#nome`, `#endereco`, `#capacidade`, `#data`.
    - Click `.submit-btn`.
    - Assert success message is visible.
- [ ] 2.3 Implement "Error Scenario":
    - Navigate to `/event/new`.
    - Submit form empty.
    - Assert `.error-text` messages appear.

## 3. Verification

- [ ] 3.1 Run tests locally via `npx nx e2e frontend-e2e` (Ensure Cypress target is correctly mapped).
- [ ] 3.2 Confirm tests pass for both scenarios.

## Rule of Gold Compliance
- [ ] 3.3 Verify code uses traditional Cypress commands (`cy.get`, `cy.contains`, `should`).
