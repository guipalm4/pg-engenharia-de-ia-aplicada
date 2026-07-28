## ADDED Requirements

### Requirement: Speaker Submission Payload Validation

The API MUST enforce strict validation for all speaker submissions to ensure data integrity.

#### Scenario: Valid Submission
- **WHEN** a `POST` request is sent to `/api/speakers` with a body containing:
  - `name`: non-empty string
  - `email`: valid email format
  - `talkTitle`: non-empty string
  - `isGDE`: boolean
- **THEN** the server MUST respond with `201 Created` and include the created `SpeakerDTO`.

#### Scenario: Missing or Invalid Fields
- **WHEN** any required field is missing or the `email` format is invalid
- **THEN** the server MUST respond with `400 Bad Request` and provide structured validation errors.

### Requirement: Frontend Submission State

The UI MUST provide reactive feedback and prevent redundant submissions.

#### Scenario: Initial State and Signal Setup
- **WHEN** the `CfpSubmissionComponent` is initialized
- **THEN** it MUST set up signals for form inputs (empty) and a `submissionStatus` signal with value `'idle'`.

#### Scenario: Submitting State
- **WHEN** the user triggers the submission action
- **THEN** the `submissionStatus` signal MUST transition to `'loading'`, and the submit button MUST be disabled via its `[disabled]` property linked to the status signal.

### Requirement: WAI-ARIA Accessibility

The UI MUST be navigable and understandable for assistive technology users.

#### Scenario: Form Accessibility
- **WHEN** the form is rendered
- **THEN** all input fields MUST have associated `<label>` elements or `aria-label` attributes.
- **THEN** any error messages MUST be contained within an element with `role="alert"` or `aria-live="polite"`.
