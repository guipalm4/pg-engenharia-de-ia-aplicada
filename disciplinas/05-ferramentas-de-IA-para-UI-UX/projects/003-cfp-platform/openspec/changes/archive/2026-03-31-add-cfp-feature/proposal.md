## Why

The Call for Papers (CFP) module is essential for the `cfp-platform` to fulfill its core purpose: facilitating the submission and management of conference talks. This change introduces the capability for speakers to submit their personal info and talk details directly through the platform, ensuring a structured and validated data flow.

## What Changes

- **Backend (NestJS)**: Implementation of a new `SpeakerController` and related service in the `api` app to handle `POST` requests for talk submissions. It will enforce strict payload validation via `class-validator` and the `SpeakerDTO`.
- **Frontend (Angular 21)**: Creation of a standalone `CfpSubmissionComponent` that provides a user interface for submissions. It will leverage Angular Signals for state management and include WAI-ARIA labels for accessibility.
- **Shared**: Consumption of the `SpeakerDTO` from the `shared-types` library to ensure type safety and schema consistency between the frontend and backend.

## Capabilities

### New Capabilities
- `cfp-submission`: Allows speakers to submit their talk details (name, email, title, GDE status). Includes input validation and submission feedback.

### Modified Capabilities
<!-- None -->

## Impact

- **api**: New controller and service to manage submissions. Use of Jest for unit testing with mandatory 400 Bad Request verification.
- **frontend**: New component and service integration. Use of Jest for signal and button state verification.
- **shared-types**: Source of truth for the `SpeakerDTO` contract.
