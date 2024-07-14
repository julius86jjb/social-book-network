import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, OnDestroy, ViewChild, computed, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NgClickOutsideDirective } from 'ng-click-outside2';
import { AuthService } from '../../../auth/services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { TopbarService } from '../../services/topbar.service';
import { NotificationComponent } from './notification/notification.component';
import { ProfileDropdownComponent } from "./profileDropdown/profileDropdown.component";

@Component({
  selector: 'wall-topbar-topbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    NotificationComponent,
    NgClickOutsideDirective,
    ProfileDropdownComponent
],
  templateUrl: './topbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,



})
export class TopbarComponent implements OnDestroy {

  @ViewChild('toogleProfileButton') toogleProfileButton: ElementRef = {} as ElementRef
  @ViewChild('toogleNotificationButton') toogleNotificationButton: ElementRef = {} as ElementRef


  public topbarService = inject(TopbarService);
  public notificationService = inject(NotificationService);
  private authService = inject(AuthService);

  notificationsCount = computed(() => this.notificationService.notifications().filter(not => !not.readed).length)

  constructor() {
    this.notificationService.getAllNotifications()
      .subscribe()
  }

  get user() {
    return this.authService.user()!;
  }

  onToogleProfileMenu() {
    this.topbarService.toogleProfileMenu()
  }

  onToogleNotificationMenu() {
    this.topbarService.toogleNotificationMenu()
  }

  onToggleMenu() {
    this.topbarService.toggleMenu()
  }

  closeProfileDrop(event: any) {
    if (this.topbarService.showProfileMenu())
      this.topbarService.showProfileMenu.set(false);
  }

  closeNotifications(event: any) {
    if (this.topbarService.showNotificationMenu())
      this.topbarService.showNotificationMenu.set(false);
  }




  ngOnDestroy(): void {
    this.topbarService.showMenu.set(false)
    this.topbarService.showNotificationMenu.set(false)
    this.topbarService.showProfileMenu.set(false)
  }




}
