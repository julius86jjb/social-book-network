import { Injectable, inject, signal } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { ModalUploadService, ModalType } from './modalUpload.service';
import { NotificationService } from './notification.service';

@Injectable({
  providedIn: 'root'
})
export class TopbarService {

  constructor() { }

  private authService = inject(AuthService);
  private modalUploadService = inject(ModalUploadService);
  private notificationService = inject(NotificationService);

  // public showProfileMenu: boolean = false
  // public showNotificationMenu: boolean = false
  // public showMenu: boolean = false
  public showProfileMenu = signal(false);
  public showNotificationMenu = signal(false);
  public showMenu = signal(false);

  get user() {
    return this.authService.user()!;
  }

  markNotificationsAsReaded() {
    if (this.notificationService.notifications().length === 0) return;
    this.notificationService.notifications().map(not => {
      this.notificationService.updateNotification({ ...not, readed: true })
        .subscribe()
    })
  }


  toogleProfileMenu() {
    this.showProfileMenu.set(!this.showProfileMenu());
    if (this.showNotificationMenu()) {
      this.markNotificationsAsReaded();
    }
  }

  toogleNotificationMenu() {
    this.showNotificationMenu.set(!this.showNotificationMenu())
    if (!this.showNotificationMenu()) this.markNotificationsAsReaded()
  }


  logout() {
    this.authService.logout();
  }


  openModal() {
    this.modalUploadService.openModal(ModalType.profile)
    this.showProfileMenu.set(false)
    this.showMenu.set(false)
  }

  toggleMenu() {
    this.showMenu.set(!this.showMenu())
  }

}
