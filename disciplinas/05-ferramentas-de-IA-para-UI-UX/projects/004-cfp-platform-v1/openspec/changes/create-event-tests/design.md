## Context

The Event Registration feature allows organizers to register new venues. Currently, there are no automated E2E tests for this flow.

## Goals / Non-Goals

**Goals:**
- Implement a success scenario for event registration.
- Implement an error scenario for empty form submission.
- Adhere to traditional Cypress syntax (`cy.get`, `cy.contains`, `should`).

**Non-Goals:**
- Using AI-based testing libraries.
- Testing the dashboard view (already covered by other tests or out of scope for this change).

## Decisions

- **Selector Strategy**: Use `id` and `class` selectors defined in the component template (`#nome`, `#endereco`, `#capacidade`, `#data`, `.submit-btn`).
- **Test File Location**: `frontend-e2e/src/e2e/event-registration.cy.ts`.
- **Base URL**: Assume standard configuration (usually `http://localhost:4200`).

## Risks / Trade-offs

- **Backend Dependency**: The success scenario depends on the API being available.
- **Dynamic Data**: Use fixed or generated strings for fields to ensure repeatability.
