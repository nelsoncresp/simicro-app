// src/app/core/guards/role.guard.ts
import { inject } from '@angular/core';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const user = authService.currentUser();
  const requiredRoles = route.data['roles'] as string[];

  // CORREGIDO: user.rol en lugar de user.role
  if (user && requiredRoles.includes(user.rol)) {
    return true;
  }
  
  return router.parseUrl('/unauthorized');
};