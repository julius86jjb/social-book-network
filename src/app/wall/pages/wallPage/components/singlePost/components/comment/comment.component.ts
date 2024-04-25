import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, InputSignal, OnInit, Output, effect, inject, input, signal } from '@angular/core';
import { Comment, Post } from '../../../../../../interfaces/post.interface';
import { UserNamePipe } from '../../../../../../pipes/userName.pipe';
import { UserAvatarPipe } from '../../../../../../pipes/userAvatar.pipe';
import { PostService } from '../../../../../../services/post.service';
import { AuthService } from '../../../../../../../auth/services/auth.service';
import { User } from '../../../../../../../auth/interfaces/user.interface';
import { Observable, of } from 'rxjs';


export interface commentWithAvatar {
  id: string;
  user: string;
  message: string;
  avatar: string
}


@Component({
  selector: 'single-post-comment',
  standalone: true,
  imports: [
    CommonModule,
    UserNamePipe,
    UserAvatarPipe
  ],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(window:click)": "onClickOutside()"
  },
})
export class CommentComponent {


  private postService = inject(PostService)
  public authService = inject(AuthService)


  @Output() onDeleteComment = new EventEmitter;


  public displayCommentMenu = signal<boolean>(false);

  public sComment = signal(this.comment)
  public user: Observable<User | undefined> = of(undefined);

  public showMenu = signal<boolean>(false);


  @Input()
  public set comment(comment: Comment) {
    this.sComment.set(comment);
    this.user = this.authService.getUserById(this.sComment().user)
  }

  public afterChangeAvatar = effect(() => {
    if (!this.authService.user) return;

    if (this.authService.user()!.id === this.sComment().user) {
      this.user = of(this.authService.user()!);
      this.cd.markForCheck();
    }
  })

  constructor(
    private cd: ChangeDetectorRef
  ) { }



  get currentUser() {
    return this.authService.user()!
  }

  onClickOutside() {
    this.showMenu.set(false);
    this.displayCommentMenu.set(false);
  }


  toogleProfileMenu($event: any) {
    $event.stopPropagation();
    this.showMenu.set(!this.showMenu())
  }

  deleteComment() {
    this.onDeleteComment.emit()
    this.showMenu.set(false);
  }




}
