import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', redirectTo: '/pix', pathMatch: 'full' },
    { path: 'pix', loadComponent: () => import('./pix-transfer/pix-transfer').then(m => m.PixTransfer) },
    { path: 'extrato', loadComponent: () => import('./pix-history/pix-history.component').then(m => m.PixHistoryComponent) }
];
