import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const url_destino = state.url;
  localStorage.setItem('url', url_destino);

  if (authService.user() !== null) {
    return true;
  };

  router.navigateByUrl('/login');

  return false;
};
