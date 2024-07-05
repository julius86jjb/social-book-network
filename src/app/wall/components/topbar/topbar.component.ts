import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnDestroy, computed, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { ModalType, ModalUploadService } from '../../services/modalUpload.service';
import { RouterModule } from '@angular/router';
import { NotificationComponent } from './notification/notification.component';
import { TopbarService } from '../../services/topbar.service';
import { NotificationService } from '../../services/notification.service';

@Component({
  selector: 'wall-topbar-topbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationComponent
  ],
  templateUrl: './topbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,



})
export class TopbarComponent implements OnDestroy{


  public topbarService = inject(TopbarService);
  public notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  notificationsCount = computed(() => this.notificationService.notifications().filter(not => !not.readed).length)

  constructor() {
    this.notificationService.getAllNotifications()
    .subscribe()
  }

  get user() {
    return this.authService.user();
  }

  onToogleProfileMenu($event: any) {
    this.topbarService.toogleProfileMenu($event)
  }

  onToogleNotificationMenu($event: any) {
    this.topbarService.toogleNotificationMenu($event)
  }

  onToggleMenu($event: any) {
    this.topbarService.toggleMenu($event)
  }


  onLogout() {
    this.topbarService.logout()
  }

  onOpenModal() {
    this.topbarService.openModal()
  }

  ngOnDestroy(): void {
    this.topbarService.showMenu = false;
    this.topbarService.showNotificationMenu = false;
    this.topbarService.showProfileMenu = false;
  }




}
