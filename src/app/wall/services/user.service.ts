import { Injectable, inject, signal } from '@angular/core';
import { User } from '../../auth/interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { Observable, map, switchMap, tap } from 'rxjs';
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

  get currentUser() {
    return this.authService.user()!
  }

  getUsers(i: number): Observable<User[]> {
    return this.http.get<User[]>(`${this.baseUrl}`).pipe(
      map(users => users.slice(i, i + 5)),
      tap((users: User[]) => this.users.update(oldPosts => [...oldPosts, ...users])),
    )
  }

  updateUser(user: User): void {
    if (!user.id) throw Error('User is required');

    this.users.update((users: User[]) =>
      users.map((_user: User) => _user.id === user.id ? user : _user))
  }

  addFollow(user: User) {
    const updatedUser = { ...user, followers: [...user.followers, this.currentUser.id] }
    const newCurrentUser: User = { ...this.currentUser, following: [...this.currentUser.following, user.id] }
    return this.updateUserById(updatedUser).pipe(
      switchMap(() => this.authService.updateCurrentUser(newCurrentUser)),
    )
  }

  unFollow(user: User) {
    user.followers = user.followers.filter((userId: string) => userId !== this.currentUser.id)
    const newCurrentUser: User = {
      ...this.currentUser,
      following: this.currentUser.following.filter((userId: string) => userId !== user.id)
    }
    return this.updateUserById(user).pipe(
      switchMap(() => this.authService.updateCurrentUser(newCurrentUser)),
    )
  }


  updateUserById(user: User): Observable<User> {
    return this.http.patch<User>(`${this.baseUrl}/${user.id}`, user).pipe(
      tap((userUpdated: User) => this.users.update((users: User[]) =>
        users.map((_user: User) => _user.id === user.id ? userUpdated : _user)))
    )
  }

}
