import { Routes } from '@angular/router';

export const ANALISTA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/analista-layout/analista-layout.component').then(m => m.AnalistaLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.AnalistaViewComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];