import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { StorageService } from '../servicios/storage.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  
  const user = storageService.getUser();
  
  if (!user) {
    router.navigate(['/auth/login']);
    return false;
  }
  
  const expectedRole = route.data['role'];
  
  if (user.role === expectedRole) {
    return true;
  }
  
  router.navigate(['/']);
  return false;
};
