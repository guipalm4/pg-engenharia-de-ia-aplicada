## ADDED Requirements

### Requirement: Event Registration Success Flow

#### Scenario: Valid Event Submission
- **WHEN** the user navigates to `/event/new` 
- **AND** fills the following fields:
  - `name`: "Alvaro Neto Conference"
  - `address`: "Main Street, 456"
  - `capacity`: "200"
  - `date`: "2026-06-15"
- **AND** clicks the "Cadastrar Evento" button
- **THEN** the registration status MUST transition to Success, and a success message MUST be displayed.

### Requirement: Form Validation

#### Scenario: Submitting Empty Form
- **WHEN** the user navigates to `/event/new`
- **AND** clicks "Cadastrar Evento" without filling any fields
- **THEN** native validation error messages MUST appear for all required fields.
