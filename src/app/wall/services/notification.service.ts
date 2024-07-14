import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Observable, map, tap } from 'rxjs';
import { environments } from '../../../environments/environments';
import { AuthService } from '../../auth/services/auth.service';
import { Notification, NotificationType } from '../interfaces/notification.interface';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {


  private http = inject(HttpClient);
  private baseUrl: string =`${environments.baseUrl}/notifications` ;
  private authService = inject(AuthService);

  public notifications = signal<Notification[]>([])
  public allNotifications = signal<Notification[]>([])

  constructor() { }

  get currentUser() {
    return this.authService.user()!
  }

  getNotifications(i: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.baseUrl).pipe(
      map((nots: Notification[]) => nots.filter(not => not.userId === this.currentUser.id && !not.deleted)),
      map((nots: Notification[]) => nots.sort((a, b) => new Date(b.date).valueOf() - new Date(a.date).valueOf())),
      map((nots: Notification[]) => nots.slice(i, i + 6)),
      tap((nots: Notification[]) => this.notifications.update(oldNots => [...oldNots, ...nots]))
    )
  }

  getAllNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.baseUrl).pipe(
      tap((nots: Notification[]) => this.allNotifications.set(nots))
    )
  }

  createNotification(userId: string, type: NotificationType, content: string): Observable<Notification> {
    const newNot: Notification = {
      userId: userId,
      type: type,
      readed: false,
      date: new Date(),
      generatedById: this.currentUser.id,
      content: content,
      deleted: false
    } as Notification
    return this.http.post<Notification>(this.baseUrl, newNot).pipe(
      tap((newNot: Notification) => {
        if (newNot.userId === this.currentUser.id) this.notifications.update(notifications => [...notifications, newNot])
      }),
      tap((newNot: Notification) =>
        this.allNotifications.update(notifications => [...notifications, newNot]))
    )
  }

  updateNotification(not: Notification): Observable<Notification> {
    return this.http.put<Notification>(`${this.baseUrl}/${not.id}`, not).pipe(
      tap((notUpdated: Notification) => this.notifications.update((nots: Notification[]) =>
        nots.map((_not: Notification) => _not.id === not.id ? notUpdated : _not))),
      tap((notUpdated: Notification) => this.allNotifications.update((nots: Notification[]) =>
        nots.map((_not: Notification) => _not.id === not.id ? notUpdated : _not)))
    )
  }

  deleteNotification(not: Notification) {
    return this.http.delete<Notification>(`${this.baseUrl}/${not.id}`).pipe(
      tap(() => this.notifications.update((nots: Notification[]) =>
        nots.filter((_not: Notification) => _not.id !== not.id))),
      tap(() => this.allNotifications.update((nots: Notification[]) =>
        nots.filter((_not: Notification) => _not.id !== not.id)))
    )
  }
}
