import { CommonModule, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, Input, InputSignal, computed, inject, input } from '@angular/core';
import { UserService } from '../../../../services/user.service';
import { UserItemComponent } from '../userItem/userItem.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../../../auth/services/auth.service';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [
    CommonModule,
    UserItemComponent,
    DecimalPipe
  ],
  templateUrl: './userList.component.html',
  styleUrl: './userList.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserListComponent {

  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef)
  private authService = inject(AuthService);

  filterCriteria: InputSignal<string> = input.required({
    transform: (value: string) => value.toLowerCase(),
    alias: 'listCriteria'
  });

  public users = this.userService.users
  public filteredUsers = computed(() => this.users().filter(u => u.userName.toLowerCase().includes(this.filterCriteria())
  || u.email.toLowerCase().includes(this.filterCriteria())))


  ngOnInit(): void {
    this.getUsers();
    this.onCurrentUserUpdate();
  }

  onCurrentUserUpdate() {
    this.authService.currentUserUpdate$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.getUsers())
  }

  getUsers() {
    this.userService.users.set([])
    this.userService.getUsers(0)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe();
  }

  public getMoreUsers(i: number) {
    if (i === this.userService.users().length - 1) {
      this.userService.getUsers(i + 1).pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe();
    }
  }

  ngOnDestroy(): void {
    this.userService.users.set([])
  }
}
