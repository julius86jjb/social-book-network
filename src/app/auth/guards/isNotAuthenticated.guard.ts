import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';



export const isNotAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject (AuthService);
  const router = inject( Router);



  if (authService.currentUser !== undefined) {
    router.navigateByUrl('/dashboard');
    return false;
  };

  return true;
};
