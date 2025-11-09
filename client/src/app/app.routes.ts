import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';

export const routes: Routes = [
    // Auth Routes (Lazy Loading)
  {
  path: 'auth',
    loadChildren: () => import('./modules/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['admin'] },
    loadChildren: () => import('./modules/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: 'analista',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['analista'] },
    loadChildren: () => import('./modules/analista/analista.routes').then(m => m.ANALISTA_ROUTES)
  },
  {
    path: 'emprendedor',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['emprendedor'] },
    loadChildren: () => import('./modules/emprendedor/emprendedor.routes').then(m => m.EMPRENDEDOR_ROUTES)
  },
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: 'auth/login' }
];
