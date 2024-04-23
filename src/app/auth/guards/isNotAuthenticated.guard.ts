import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const isNotAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject (AuthService);
  const router = inject( Router);

  if (authService.user() !== null) {
    router.navigateByUrl('/wall');
    return false;
  };

  return true;
};
