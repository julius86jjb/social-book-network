import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layouts/authLayout/authLayout.component';
import { LoginPageComponent } from './pages/loginPage/loginPage.component';
import { RegisterPageComponent } from './pages/registerPage/registerPage.component';

export const AUTH_ROUTES: Routes = [
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      { path: 'login', component: LoginPageComponent },
      { path: 'register', component: RegisterPageComponent },
      { path: '', redirectTo: 'login', pathMatch: 'full'}
    ]
  }
]
