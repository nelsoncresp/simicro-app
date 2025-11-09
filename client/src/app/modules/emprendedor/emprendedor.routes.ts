import { Routes } from '@angular/router';

export const EMPRENDEDOR_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/emprendedor-layout/emprendedor-layout.component').then(m => m.EmprendedorLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'perfil',
        loadComponent: () => import('./components/perfil/perfil.component').then(m => m.PerfilComponent)
      },
      {
        path: 'solicitudes',
        loadComponent: () => import('./components/solicitudes/solicitudes.component').then(m => m.SolicitudesComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];