## Context

The `cfp-platform` monorepo provides a framework for conference management. Currently, there is No UI or API endpoint dedicated to talk submissions (Call for Papers). We need to bridge this gap by implementing a cohesive submission flow.

## Goals / Non-Goals

**Goals:**
- Implement a `POST` endpoint in the `api` app for speaker and talk submissions.
- Enforce strict validation on the incoming payload using the `SpeakerDTO` and `class-validator`.
- Create a standalone Angular component in the `frontend` app that allows users to submit their talk details.
- Manage component state using Angular Signals.
- Ensure the submission form is fully accessible using WAI-ARIA attributes.
- Achieve high quality with Jest tests for both API validation and Frontend logic.

**Non-Goals:**
- Implementation of a persistent database (in-memory storage is sufficient for now).
- User authentication or authorization for the submission form.
- Advanced form features like file uploads (slides/resumes).

## Decisions

- **Standalone Components**: Required by Angular 21 for reduced boilerplate and better modularity.
- **Signals**: Used for managing the form's state (e.g., `isSubmitting`, `submissionError`, `formValues`).
- **NestJS DTO Validation**: Utilizing `@nestjs/common` and `class-validator` to ensure that the API rejects invalid payloads with a `400 Bad Request`.
- **WAI-ARIA**: Specifically adding `aria-labelledby`, `aria-describedby`, and `role="alert"` for submission feedback.
- **Shared Types**: Directly importing the `SpeakerDTO` interface from `@cfp-platform/shared-types` to maintain a single source of truth.

## Risks / Trade-offs

- **In-memory Storage**: Data loss on restart. This is a trade-off for speed of implementation in the current development phase.
- **Complexity of Signals**: While modern, Signals require careful handling of side-effects. We will use `effect` sparingly and focus on reactive state.
