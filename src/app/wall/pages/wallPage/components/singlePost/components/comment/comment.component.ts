import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, EventEmitter, Input, InputSignal, OnInit, Output, effect, inject, input, signal } from '@angular/core';
import { Comment } from '../../../../../../interfaces/post.interface';
import { UserNamePipe } from '../../../../../../pipes/userName.pipe';
import { UserAvatarPipe } from '../../../../../../pipes/userAvatar.pipe';
import { PostService } from '../../../../../../services/post.service';
import { AuthService } from '../../../../../../../auth/services/auth.service';
import { User } from '../../../../../../../auth/interfaces/user.interface';
import { Observable, of } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { TimeAgoPipe } from '../../../../../../../shared/pipes/timeAgo.pipe';


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
    UserAvatarPipe,
    TimeAgoPipe
  ],
  templateUrl: './comment.component.html',
  styleUrl: './comment.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(window:click)": "onClickOutside()"
  },
})
export class CommentComponent{


  private postService = inject(PostService)
  public authService = inject(AuthService)
  destroyRef = inject(DestroyRef)


  @Output() onDeleteComment = new EventEmitter();
  @Output() onUpdateLikesComment = new EventEmitter<string>();
  @Output() onUpdateComment = new EventEmitter<User>();


  public displayCommentMenu = signal<boolean>(false);

  public comment: InputSignal<Comment> = input.required<Comment>();
  public showMenu = signal<boolean>(false);
  public showTooltip = signal<boolean>(false);


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

  onUpdateCommentLikes(action: 'addLike' | 'dislike') {
    this.onUpdateLikesComment.emit(action)
  }

  hasLiked(): boolean {
    const likes: string[] = this.comment().likes
    return likes.some((userId: string) => userId === this.currentUser.id);
  }




}
