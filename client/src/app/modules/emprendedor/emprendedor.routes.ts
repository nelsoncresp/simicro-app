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
      {
        path: 'estado-cuenta',
        loadComponent: () => import('./components/mi-estado-de-cuenta/mi-estado-de-cuenta.component').then(m => m.MiEstadoDeCuentaComponent)
      },
      {
        path: 'mi-emprendimiento',
        loadComponent: () => import('./components/mi-emprendimiento/mi-emprendimiento.component').then(m => m.MiEmprendimientoComponent)
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];