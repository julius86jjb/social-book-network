import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, InputSignal, Output, computed, inject, input, type OnInit } from '@angular/core';
import { switchMap } from 'rxjs';
import { User } from '../../../../../auth/interfaces/user.interface';
import { AuthService } from '../../../../../auth/services/auth.service';
import { NotificationType } from '../../../../interfaces/notification.interface';
import { NotificationService } from '../../../../services/notification.service';
import { UserService } from '../../../../services/user.service';

@Component({
  selector: 'app-user-item',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './userItem.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserItemComponent implements OnInit {

  private authService = inject(AuthService);
  private userService = inject(UserService);
  private notificationService = inject(NotificationService);

  @Output() loaded = new EventEmitter<number>();
  public index: InputSignal<number> = input.required<number>();
  public user: InputSignal<User> = input.required<User>();

  public isFollowing = computed(() => this.currentUser?.following.includes(this.user().id))


  constructor() { }

  get currentUser(): User | undefined {
    return this.authService.currentUser;
  }


  ngOnInit(): void {
    this.loaded.emit(this.index())
  }

  onFollow() {
    const updatedUser = { ...this.user(), followers: [...this.user().followers, this.currentUser!.id] }
    this.userService.updateUserById(updatedUser).pipe(
      switchMap(() => this.authService.updateCurrentUser({ ...this.currentUser!, following: [...this.currentUser!.following, this.user().id] }, false)),
    ).subscribe(() => this.notificationService.createNotification(this.user().id, NotificationType.follow, '',)
      .subscribe());
  }

  onUnfollow() {
    this.userService.updateUserById(
      { ...this.user(), followers: this.user().followers.filter((userId: string) => userId !== this.currentUser!.id) })
      .pipe(
        switchMap((user: User) => this.authService.updateCurrentUser({
          ...this.currentUser!,
          following: this.currentUser!.following.filter((userId: string) => userId !== user.id)
        }, false)),
      ).subscribe()
  }

}
