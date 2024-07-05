import { Injectable, inject } from '@angular/core';
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

  public showProfileMenu: boolean = false
  public showNotificationMenu: boolean = false
  public showMenu: boolean = false

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


  toogleProfileMenu($event: any) {
    $event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu;
    if (this.showNotificationMenu) {
      this.markNotificationsAsReaded();
    }
    this.showNotificationMenu = false;
  }

  toogleNotificationMenu($event: any) {
    $event.stopPropagation();
    this.showNotificationMenu = !this.showNotificationMenu;
    if (!this.showNotificationMenu) this.markNotificationsAsReaded()
    this.showProfileMenu = false;

  }

  // clickOutside() {
  //   console.log('clickOutside');

  //   this.showProfileMenu = false;
  //   this.showMenu = false;
  //   if (this.showNotificationMenu) {
  //     this.markNotificationsAsReaded();
  //   }
  //   this.showNotificationMenu = false;
  // }

  logout() {
    this.authService.logout();
  }


  openModal() {
    this.modalUploadService.openModal(ModalType.profile)
    this.showProfileMenu = false;
    this.showMenu = false;
  }

  toggleMenu($event: any) {
    $event.stopPropagation();
    this.showMenu = !this.showMenu
  }

}
