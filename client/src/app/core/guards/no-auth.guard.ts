import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const noAuthGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const user = authService.currentUser();

  // Si está logueado, NO debe entrar al login
  if (authService.isAuthenticated() && user) {
    switch (user.rol) {
      case 'admin':
        return router.parseUrl('/admin/dashboard');
      case 'analista':
        return router.parseUrl('/analista/dashboard');
      case 'emprendedor':
        return router.parseUrl('/emprendedor/dashboard');
    }
  }

  return true; 
};
