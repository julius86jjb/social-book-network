import { environments } from './../../../environments/environments';
import { Injectable, inject, signal } from '@angular/core';
import { User } from '../interfaces/user.interface';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, defaultIfEmpty, filter, finalize, of, switchMap, tap } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFireStorage } from '@angular/fire/compat/storage';



@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient)
  private router = inject(Router)
  private baseUrl: string =`${environments.baseUrl}` ;
  private basePath = '/uploads/avatars';
  private storage = inject(AngularFireStorage)

  public user = signal<User | undefined>(undefined);

  public currentUserUpdate: Subject<User> = new Subject<User>();
  currentUserUpdate$: Observable<User> = this.currentUserUpdate.asObservable();

  constructor() {
    this.loadFromLocalStorage();
  }

  private setAuthentication(user: User | undefined): boolean {
    this.user.set(user);
    this.saveLocalStorage(user);
    return true;
  }

  private saveLocalStorage(user: User | undefined) {
    if (user)
      localStorage.setItem('user', JSON.stringify(user));
  }

  private loadFromLocalStorage() {
    localStorage.getItem('user')
      ? this.user.set(JSON.parse(localStorage.getItem('user')!))
      : this.user.set(undefined)
  }

  register(user: any): Observable<User> {
    return this.http.post<User>(`${this.baseUrl}/users`, user);
  }

  login(email: string, password: string): Observable<User | undefined> {
    return this.http.get<User[]>(`${this.baseUrl}/users`)
      .pipe(
        switchMap((users: User[]) => users),
        filter((user: User) => (user.email === email && user.password === password)),
        tap((user: User | undefined) => this.setAuthentication({ ...user!, last_login: new Date() })),
        defaultIfEmpty(undefined)
      )
  }

  changeAvatar(user: User, img: File): Observable<User | undefined> {

    try {
      const filePath = `${this.basePath}/${img.name}`;
      const storageRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, img);

      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          storageRef.getDownloadURL().subscribe(downloadURL => {
            const userUpdate = {
              ...user,
              avatar: downloadURL
            } as User
            this.updateCurrentUser(userUpdate, true)
              .subscribe()
          })
        })
      ).subscribe();
      return of(this.user());

    } catch (error) {
      return of(undefined);
    }
  }

  updateCurrentUser(user: User, reloadPost: boolean): Observable<User> {
    return this.http.patch(`${this.baseUrl}/users/${this.user()!.id}`, user).pipe(
      tap((userUpdated: any) => this.user.set(userUpdated)),
      tap((userUpdated: any) => {
        if (reloadPost) this.currentUserUpdate.next(userUpdated)
      }),
      tap(() => this.saveLocalStorage(this.user())),
    )
  }

  logout() {
    this.router.navigate(['/login']);
    localStorage.removeItem('user');
    this.user.set(undefined);
  }
}
