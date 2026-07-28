# Capability: CFP Dashboard

### Requirement: Dashboard Submission Listing
The system SHALL provide a dashboard view that lists all submitted talks from the Call for Papers (CFP) platform.

#### Scenario: Successful retrieval of submissions
- **WHEN** the `CfpDashboardComponent` is initialized
- **THEN** it SHALL send a `GET` request to `/api/speakers`
- **THEN** it SHALL update a `submissions` signal with the received `SpeakerDTO[]`

#### Scenario: Displaying submission details
- **WHEN** the `submissions` signal contains data
- **THEN** the UI SHALL render a list containing the `name`, `talkTitle`, and `isGDE` status for each speaker

### Requirement: Reactive State Management
The dashboard MUST use Angular Signals to manage the list of submissions and any loading or error states.

#### Scenario: Loading state
- **WHEN** the dashboard is fetching data
- **THEN** it SHALL display a loading indicator or message

#### Scenario: Error state
- **WHEN** the API request fails
- **THEN** it SHALL display a user-friendly error message using an element with `role="alert"`
