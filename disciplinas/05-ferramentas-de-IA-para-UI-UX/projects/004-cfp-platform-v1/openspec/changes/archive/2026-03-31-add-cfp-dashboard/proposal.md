## Why

Provide a secure dashboard for administrators to view and manage all submitted talks from the Call for Papers (CFP) platform in real-time, improving the talk selection process.

## What Changes

- **Backend (NestJS)**: Add a new `GET` endpoint to the `SpeakerController` (or `CfpController`) that returns an array of `SpeakerDTO`, allowing retrieval of all submitted data.
- **Frontend (Angular 21)**: 
    - Create a new `CfpDashboardComponent` using Angular Signals (`WritableSignal<SpeakerDTO[]>`) for reactive state management.
    - Implement a semantic HTML table/list to display the submissions, adhering to the existing "glassmorphism" design tokens.
    - Add a new "dashboard" route in `app.routes.ts`.
    - Add a navigation button in the `CfpSubmissionComponent` to allow users to navigate between the form and the dashboard.

## Capabilities

### New Capabilities
- `cfp-dashboard`: A new capability for listing and viewing all submitted talks, including speaker details and talk titles.

### Modified Capabilities
- `cfp-submission`: Modified to include a navigation link/button to the dashboard, ensuring seamless transition between submission and viewing.

## Impact

- **api**: New `GET` route in `SpeakerController` and corresponding method in `SpeakerService`.
- **frontend**: New component, updated routing, and minor UI update to the submission form.
- **shared-types**: Reuses existing `SpeakerDTO`.
