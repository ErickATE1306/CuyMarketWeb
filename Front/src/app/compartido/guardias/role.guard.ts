import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../servicios/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const expectedRole = route.data['role'];

  // Si el usuario NO está autenticado
  if (!authService.isAuthenticated()) {
    // Permitir acceso solo si es la ruta de cliente (área pública)
    if (expectedRole && expectedRole.toLowerCase() === 'cliente') {
      return true;
    }
    // Para admin y empleado, redirigir al login
    router.navigate(['/auth/login']);
    return false;
  }

  // Si el usuario SÍ está autenticado, verificar que el rol ACTIVO coincida
  if (authService.hasActiveRole(expectedRole)) {
    return true;
  }

  // Si el usuario tiene un rol activo pero intenta acceder a otra área
  const activeRole = authService.getActiveRole();
  console.warn(`Access denied. Active role: ${activeRole}, Expected: ${expectedRole}`);
  
  // Redirigir al dashboard correspondiente a su rol activo
  if (activeRole) {
    if (activeRole.toUpperCase().includes('ADMIN')) {
      router.navigate(['/admin/dashboard']);
    } else if (activeRole.toUpperCase().includes('EMPLEADO')) {
      router.navigate(['/empleado/gestion-pedidos']);
    } else if (activeRole.toUpperCase().includes('CLIENTE')) {
      router.navigate(['/cliente/inicio']);
    } else {
      router.navigate(['/auth/login']);
    }
  } else {
    router.navigate(['/auth/login']);
  }
  
  return false;
};
