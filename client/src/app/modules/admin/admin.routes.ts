import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./layouts/admin-layout/admin-layout.component').then(m => m.AdminLayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./components/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'emprendedores',
        loadComponent: () => import('./components/emprendedores/emprendedores.component').then(m => m.EmprendedoresComponent)
      },
      {
        path: 'usuarios',
        loadComponent: () => import('./components/usuarios/usuarios.component').then(m => m.UsuariosComponent)
      },
      {
        path: 'solicitudes',
        loadComponent: () => import('./components/solicitudes/solicitudes.component').then(m => m.SolicitudesComponent )
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];