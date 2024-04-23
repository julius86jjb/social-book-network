import { Injectable, inject, signal } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, defaultIfEmpty, filter, finalize, isEmpty, map, mergeMap, of, switchMap, tap, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { PostService } from '../../wall/services/post.service';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient)
  private router = inject(Router)
  private baseUrl = 'http://localhost:3000';
  private basePath = '/uploads/avatars';
  private storage = inject(AngularFireStorage)


  public user = signal<User | null>(null);


  constructor() {
    this.loadFromLocalStorage();
  }

  register(user: User): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }

  login(email: string, password: string): Observable<User | null> {

    return this.http.get<User[]>(`${this.baseUrl}/users`)
      .pipe(
        switchMap((users: User[]) => users),
        // mergeMap((users: User[]) => users),
        // concatMap((users: User[]) => users),
        filter((user: User) => (user.email === email && user.password === password)),
        tap((user: User | null) => this.setAuthentication({...user!, last_login: new Date()})),
        defaultIfEmpty(null)

        // map((users: User[]) => users.filter((user: User) => user.email === email && user.password === password)),
        // tap((users: User[]) => users.length ? this.user.set(users[0]) : this.user.set(undefined)),
        // tap((users: User[]) => this.saveLocalStorage(users[0])),
        // map((users: User[]) => users[0])
      )
  }

  private setAuthentication(user: User | null): boolean {
    this.user.set(user);
    this.saveLocalStorage(user);
    return true;
  }

  logout() {
    this.router.navigate(['/login']);
    localStorage.removeItem('user');
    this.user.set(null);
  }

  saveLocalStorage(user: User | null) {
    if (user)
      localStorage.setItem('user', JSON.stringify(user));
  }

  loadFromLocalStorage() {
    localStorage.getItem('user')
      ? this.user.set(JSON.parse(localStorage.getItem('user')!))
      : this.user.set(null)
  }



  changeAvatar(img: File): Observable<number | undefined> {

    try {
      const filePath = `${this.basePath}/${img.name}`;
      const storageRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, img);

      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          storageRef.getDownloadURL().subscribe(downloadURL => {
            const userUpdate = {
              ...this.user(),
              avatar: downloadURL
            } as User
            this.updateUser(userUpdate).subscribe()
          })
        })
      ).subscribe();

      return uploadTask.percentageChanges();

    } catch (error) {
      console.log(error);
      return of(undefined);
    }

  }


  updateUser(user: User): Observable<User> {
    return this.http.patch(`${this.baseUrl}/users/${this.user()!.id}`, user).pipe(
      tap((userUpdated: any) => this.user.set(userUpdated)),
      tap(() => this.saveLocalStorage(this.user())),
    )
  }


  checkAuthStatus(): Observable<boolean> {

    const user = localStorage.getItem('user');

    if (!user) {
      this.logout();
      return of(false);
    }

    return of(true);
  }

  getUserById(userId: string) {
    return this.http.get<User>(`${this.baseUrl}/users/${userId}`).pipe(
      catchError((err) => throwError(() => new Error(err)))
    )
  }




}
