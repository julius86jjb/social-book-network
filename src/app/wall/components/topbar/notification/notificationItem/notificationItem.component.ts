import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, InputSignal, OnInit, Output, inject, input, output } from '@angular/core';
import { User } from '../../../../../auth/interfaces/user.interface';
import { Notification } from '../../../../interfaces/notification.interface';
import { LazyImageComponent, LazyImageType } from "../../../../../shared/components/lazyImage/lazyImage.component";
import { UserNamePipe } from "../../../../pipes/userName.pipe";
import { TimeAgoPipe } from "../../../../../shared/pipes/timeAgo.pipe";
import { NotificationService } from '../../../../services/notification.service';
import { switchMap, tap } from 'rxjs';
import { MaxLengthPipe } from "../../../../../shared/pipes/maxLength.pipe";
import { UserDataPipe } from "../../../../pipes/userData.pipe";

@Component({
    selector: 'app-notification-item',
    standalone: true,
    templateUrl: './notificationItem.component.html',
    styleUrl: './notificationItem.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
    CommonModule,
    LazyImageComponent,
    UserNamePipe,
    TimeAgoPipe,
    MaxLengthPipe,
    UserDataPipe
]
})
export class NotificationItemComponent implements OnInit {

  notificationService = inject(NotificationService);

  @Output() loaded = new EventEmitter<number>();
  @Output() deletedNot = new EventEmitter<Notification>();
  public index: InputSignal<number> = input.required<number>();
  public notification: InputSignal<Notification> = input.required<Notification>();
  public lazyImageType = LazyImageType;


  ngOnInit(): void {
    this.loaded.emit(this.index())
  }

  deleteNotification(not: Notification) {
    this.deletedNot.emit(not);
  }
}
