## 1. Backend Implementation (NestJS)

- [x] 1.1 Verify/Implement `GET /speakers` endpoint in `SpeakerController` returning `SpeakerDTO[]`.
- [x] 1.2 Ensure `SpeakerService.findAll()` correctly retrieves the in-memory speakers list.

## 2. Frontend Dashboard Component (Angular 21)

- [x] 2.1 Generate `CfpDashboardComponent` as a standalone component.
- [x] 2.2 Inject `HttpClient` and implement `fetchSpeakers()` method.
- [x] 2.3 Setup `submissions = signal<SpeakerDTO[]>([])` for state management.
- [x] 2.4 Implement the dashboard template using semantic HTML and glassmorphism CSS (reusing tokens).
- [x] 2.5 Handle loading and error states using signals and ARIA-compliant elements.

## 3. Routing and Navigation

- [x] 3.1 Register the `/dashboard` route in `app.routes.ts` pointing to `CfpDashboardComponent`.
- [x] 3.2 Add a \"View Dashboard\" button to `CfpSubmissionComponent` template.
- [x] 3.3 Style the navigation button to match the existing form's action buttons.

## 4. Verification

- [x] 4.1 Perform a test submission and verify it appearing on the dashboard.

