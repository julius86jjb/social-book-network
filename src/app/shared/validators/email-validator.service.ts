import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { AbstractControl, AsyncValidator, ValidationErrors } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { User } from '../../auth/interfaces/user.interface';
import { AuthService } from '../../auth/services/auth.service';
import { environments } from './../../../environments/environments';

@Injectable({
  providedIn: 'root'
})
export class EmailValidator implements AsyncValidator {

  private http = inject(HttpClient);
  public authService = inject(AuthService);
  private baseUrl: string =`${environments.baseUrl}/users` ;



  get currentUser(): User | undefined {
    return this.authService.currentUser;
  }

  validate(control: AbstractControl<any, any>): Observable<ValidationErrors | null> {

    const email = control.value;

    const url = `${this.baseUrl}?email=${email}`;

    return this.http.get<User[]>(url)
      .pipe(
        map((user) => {
          if (!user.length) return null;
          if (!this.currentUser) return { emailTaken: true }
          return (user[0].email !== this.currentUser?.email) ? { emailTaken: true } : null
        })
      )
  }

}
