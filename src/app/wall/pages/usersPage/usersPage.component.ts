import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { UserService } from '../../services/user.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { UserItemComponent } from './userItem/userItem.component';
import { ModalUploadComponent } from '../../components/modalUpload/modalUpload.component';


@Component({
  selector: 'app-users-page',
  standalone: true,
  imports: [
    CommonModule,
    ScrollingModule,
    UserItemComponent,
    ModalUploadComponent
  ],
  templateUrl: './usersPage.component.html',
  styleUrl: './usersPage.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsersPageComponent implements OnInit {

  private userService = inject(UserService);
  private destroyRef = inject(DestroyRef)

  public users = this.userService.users

  constructor() {
    this.userService.getUsers(0).pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe()
  }
  ngOnInit(): void {

  }

  public getUsers(i: number) {
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
