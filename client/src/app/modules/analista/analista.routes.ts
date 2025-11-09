import { Routes } from '@angular/router';

export const ANALISTA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/analista-layout/analista-layout.component').then(m => m.AnalistaLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'solicitudes',
        loadComponent: () => import('./components/solicitudes/solicitudes.component').then(m => m.SolicitudesComponent)
      },
      {
        path: 'evaluaciones',
        loadComponent: () => import('./components/evaluaciones/evaluaciones.component').then(m => m.EvaluacionesComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];