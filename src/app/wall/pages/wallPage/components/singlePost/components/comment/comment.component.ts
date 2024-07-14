import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, InputSignal, Output, computed, inject, input, signal } from '@angular/core';
import { User } from '../../../../../../../auth/interfaces/user.interface';
import { AuthService } from '../../../../../../../auth/services/auth.service';
import { TimeAgoPipe } from '../../../../../../../shared/pipes/timeAgo.pipe';
import { Comment } from '../../../../../../interfaces/post.interface';
import { UserDataPipe } from "../../../../../../pipes/userData.pipe";
import { PostService } from '../../../../../../services/post.service';


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
    TimeAgoPipe,
    UserDataPipe
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
  public hasLikedComment = computed(() => this.comment().likes.includes(this.currentUser.id))


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





}
