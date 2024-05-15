import { Routes } from '@angular/router';
import { UsersPageComponent } from './pages/usersPage/usersPage.component';
import { WallLayoutComponent } from './wallLayout.component';
import WallPageComponent from './pages/wallPage/wallPage.component';

export const WALL_ROUTES: Routes = [
  {
    path: '',
    component: WallLayoutComponent,
    children: [
      { path: 'wall', component: WallPageComponent },
      { path: 'users', component: UsersPageComponent, pathMatch: 'full' },
      { path: '**', redirectTo: 'wall', pathMatch: 'full'}
    ]
  }
]
