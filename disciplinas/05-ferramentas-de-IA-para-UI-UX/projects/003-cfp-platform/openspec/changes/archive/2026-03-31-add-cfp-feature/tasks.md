## 1. Backend Implementation (NestJS)

- [x] 1.1 Create `CreateSpeakerDto` in `api/src/app` by extending/mapping from the shared `SpeakerDTO`.
- [x] 1.2 Add `class-validator` and `class-transformer` decorators to `CreateSpeakerDto` (e.g., `@IsEmail`, `@IsNotEmpty`).
- [x] 1.3 Implement `SpeakerController` with a `POST` method that uses `@Body()` and triggers validation.
- [x] 1.4 Implement `SpeakerService` to handle business logic and in-memory persistence.
- [x] 1.5 Write Jest unit tests for `SpeakerController` specifically verifying that invalid payloads result in a `400 Bad Request`.

## 2. Frontend Implementation (Angular 21)

- [x] 2.1 Generate the `CfpSubmissionComponent` as a standalone component in the `frontend` app.
- [x] 2.2 Define signals for the form's data (`name`, `email`, `talkTitle`, `isGDE`) and the `submissionStatus`.
- [x] 2.3 Create the HTML template using semantic tags and WAI-ARIA attributes (`aria-label`, `role="alert"`).
- [x] 2.4 Implement the submission logic using `HttpClient` to communicate with the API.
- [x] 2.5 Write Jest unit tests to validate the initial state of the signals and ensure the submit button is blocked while `submissionStatus` is `'loading'`.

## 3. Integration and Verification

- [x] 3.1 Verify that the frontend correctly consumes the `SpeakerDTO` contract.
- [x] 3.2 Ensure proper error handling between the API and the UI.
- [x] 3.3 Perform a final check of all WAI-ARIA roles for accessibility compliance.
