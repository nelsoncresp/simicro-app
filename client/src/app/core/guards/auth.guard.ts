import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar autenticación
  if (authService.isAuthenticated()) {
    return true;
  }

  // Si no está autenticado, redirigir al login
  return router.parseUrl('/auth/login');
};