## Context

The CFP Platform currently allows speakers to submit talks via a "glassmorphism" styled form. However, there is no UI to view these submissions. This change introduces a Dashboard to list all submitted talks, using modern Angular features and maintaining the existing aesthetic.

## Goals / Non-Goals

**Goals:**
- Implement a `GET /speakers` endpoint in the NestJS backend.
- Create a `CfpDashboardComponent` in Angular 21.
- Use **Angular Signals** for reactive state management of the submissions list.
- Maintain **UI Consistency** by reusing the glassmorphism design tokens (gradients, blurs, typography).
- Add navigation between the submission form and the dashboard.

**Non-Goals:**
- Advanced filtering or sorting (v1 focus is listing).
- Authentication/Authorization (out of scope for this task, will be handled in a future change).
- Editing or deleting submissions.

## Decisions

### 1. State Management: Angular Signals
We will use `WritableSignal<SpeakerDTO[]>` to store the submissions. This provides a modern, high-performance way to handle reactivity in Angular 21, reducing the need for manual subscription management.

### 2. UI: Glassmorphism Consistency
The dashboard will use the same `.glass-card` and `.cfp-container` patterns from `cfp-submission.component.css`. The list of submissions will be rendered inside a responsive glass-style list or table.
- **Background**: `radial-gradient(circle at top left, #1c1c1e, #0a0a0c)`
- **Card**: `rgba(255, 255, 255, 0.05)` with `backdrop-filter: blur(12px)`
- **Accent**: `linear-gradient(90deg, #ff8a00, #e52e71)` for headings and buttons.

### 3. Backend: SpeakerController Expansion
The existing `SpeakerController` already has a `findAll()` method and a `GET` route. However, we will ensure it is correctly mapped to `/speakers` and returns the `SpeakerDTO[]` as required. If the user specifically wants `CfpController`, we will verify if a rename is preferred, but for now, we leverage the existing infrastructure.

## Risks / Trade-offs

- **[Risk] Visual Noise** → The glassmorphism effect can be heavy with many items. 
  - **Mitigation**: Use subtle separators and ensure sufficient padding between list items.
- **[Risk] Performance with large datasets** → Loading all speakers at once.
  - **Mitigation**: The current scale is small. For future-proofing, we will use a signal-based approach that is ready for easier integration of pagination later.
