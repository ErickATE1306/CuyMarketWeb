import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const expectedRole = route.data['role'];

  // Usar el método hasRole del servicio que maneja la lógica de validación
  if (authService.hasRole(expectedRole)) {
    return true;
  }

  router.navigate(['/']); // O a una página de acceso denegado
  return false;
};
