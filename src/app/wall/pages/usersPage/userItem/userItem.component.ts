import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, InputSignal, Output, inject, input, type OnInit } from '@angular/core';
import { User } from '../../../../auth/interfaces/user.interface';
import { AuthService } from '../../../../auth/services/auth.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { UserService } from '../../../services/user.service';

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

  @Output() loaded = new EventEmitter<number>();
  public index: InputSignal<number> = input.required<number>();
  public user: InputSignal<User> = input.required<User>();

  constructor() {

    toObservable(this.authService.afterCurrentUserUpdate).subscribe((user: User | undefined) => {
      if (user && this.user().id === user.id)
        this.userService.updateUser(user)
    })
  }

  get currentUser() {
    return this.authService.user()!
  }


  ngOnInit(): void {
    this.loaded.emit(this.index())
  }


  onFollow() {
    this.userService.addFollow(this.user())
      .subscribe()
  }
  onUnfollow() {
    this.userService.unFollow(this.user())
      .subscribe()
  }

  isFollowing(): boolean {

    return this.currentUser.following.includes(this.user().id);
  }

}
