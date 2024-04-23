import { Routes } from '@angular/router';

export const WALL_ROUTES: Routes = [
  {
    path: '', loadComponent: () => import('./pages/wallPage/wallPage.component')
  },
  { path: '**', redirectTo: '' }
]
