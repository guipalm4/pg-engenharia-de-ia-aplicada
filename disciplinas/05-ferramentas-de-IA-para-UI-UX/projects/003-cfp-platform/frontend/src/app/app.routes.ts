import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: 'event/new',
    loadComponent: () =>
      import('./event-registration/event-registration.component').then(
        (m) => m.EventRegistrationComponent
      ),
  },
  {
    path: 'talks/new',
    loadComponent: () =>
      import('./cfp-submission/cfp-submission.component').then(
        (m) => m.CfpSubmissionComponent
      ),
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./cfp-dashboard/cfp-dashboard.component').then(
        (m) => m.CfpDashboardComponent
      ),
  },
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
];
