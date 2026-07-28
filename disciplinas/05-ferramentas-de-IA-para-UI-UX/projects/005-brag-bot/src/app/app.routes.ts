import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'detail/:id',
    loadComponent: () => import('./detail/detail.component').then(m => m.DetailComponent)
  }
];
