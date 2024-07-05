import { Injectable, inject, signal } from '@angular/core';
import { User } from '../../auth/interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { AuthService } from '../../auth/services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {


  private baseUrl = 'http://localhost:3000/users'
  private http = inject(HttpClient);
  private authService = inject(AuthService);

  public users = signal<User[]>([])

  constructor() { }

  getUsers(i: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}`).pipe(
      map(users => users.slice(i, i + 5)),
      tap((users: User[]) => this.users.update(oldPosts => [...oldPosts, ...users])),
    )
  }

  getUserById(userId: string): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/${userId}`).pipe(
      catchError((err) => throwError(() => new Error(err)))
    )
  }

  updateUserById(user: User): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${user.id}`, user).pipe(
      tap((userUpdated: User) => this.users.update((users: User[]) =>
        users.map((_user: User) => _user.id === user.id ? userUpdated : _user)))
    )
  }

}
