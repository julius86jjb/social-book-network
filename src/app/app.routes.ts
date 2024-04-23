import { Routes } from '@angular/router';
import { isAuthenticatedGuard } from './auth/guards/isAuthenticated.guard';
import { isNotAuthenticatedGuard } from './auth/guards/isNotAuthenticated.guard';

export const routes: Routes = [
  {
    path: 'wall',
    // canActivate: [isAuthenticatedGuard],
    loadChildren: () => import('./wall/wall.routes').then(r => r.WALL_ROUTES)
  },
  {
    path: '',
    // canActivate: [isNotAuthenticatedGuard],
    loadChildren: () => import('./auth/auth.routes').then(routes => routes.AUTH_ROUTES)
  },
];
