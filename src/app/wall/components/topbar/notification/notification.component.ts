import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, computed, inject, output } from '@angular/core';
import { TopbarService } from '../../../services/topbar.service';
import { RouterModule } from '@angular/router';
import { NotificationService } from '../../../services/notification.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { TimeAgoPipe } from "../../../../shared/pipes/timeAgo.pipe";
import { LazyImageComponent } from "../../../../shared/components/lazyImage/lazyImage.component";
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NotificationItemComponent } from "./notificationItem/notificationItem.component";
import { Notification } from '../../../interfaces/notification.interface';
import { switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-notification',
  standalone: true,
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    RouterModule,
    TimeAgoPipe,
    LazyImageComponent,
    NotificationItemComponent
  ],
})
export class NotificationComponent implements OnInit {


  private notificationService = inject(NotificationService);
  private authService = inject(AuthService);
  private destroyRef = inject(DestroyRef)

  public topbarService = inject(TopbarService);
  public notifications = this.notificationService.notifications
  public myNotifications = computed(() => this.notifications().filter(not => not.userId === this.currentUser.id && !not.deleted))

  ngOnInit(): void {
    this.getNotifications()
  }


  getNotifications() {
    this.notificationService.notifications.set([])
    this.notificationService.getNotifications(0)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe();
  }

  public getMoreNotifications(i: number) {
    if (i === this.notificationService.notifications().length - 1) {
      this.notificationService.getNotifications(i + 1).pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe();
    }
  }

  get currentUser() {
    return this.authService.user()!
  }


  onToogleNotificationMenu() {
    this.topbarService.toogleNotificationMenu()
  }


  onCloseNotifications() {
    this.topbarService.toogleNotificationMenu()
  }

  onDeleteNotification(not: Notification) {

    this.notificationService.deleteNotification(not).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe()
  }

}
