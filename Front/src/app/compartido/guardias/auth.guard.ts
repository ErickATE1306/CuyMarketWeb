import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { StorageService } from '../servicios/storage.service';

export const authGuard: CanActivateFn = (route, state) => {
  const storageService = inject(StorageService);
  const router = inject(Router);
  
  const user = storageService.getUser();
  
  if (user) {
    return true;
  }
  
  router.navigate(['/auth/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
