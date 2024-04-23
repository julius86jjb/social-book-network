import { CommonModule } from '@angular/common';
import { AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, InputSignal, OnInit, Output, effect, inject, input, signal } from '@angular/core';
import { Comment, Post } from '../../../../../../interfaces/post.interface';
import { UserNamePipe } from '../../../../../../pipes/userName.pipe';
import { UserAvatarPipe } from '../../../../../../pipes/userAvatar.pipe';
import { PostService } from '../../../../../../services/post.service';
import { AuthService } from '../../../../../../../auth/services/auth.service';
import { User } from '../../../../../../../auth/interfaces/user.interface';


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
export class CommentComponent implements OnInit{


  private postService = inject(PostService)
  public authService = inject(AuthService)


  @Output() onDeleteComment = new EventEmitter;


  public displayCommentMenu = signal<boolean>(false);

  public sComment = signal(this.comment)
  public user: User | undefined = undefined;

  public showMenu = signal<boolean>(false);
  public avatarUrl: string = '';

  _comment!: Comment;

  @Input()
  public get comment(): Comment {
    return this._comment;
  }
  public set comment(comment: Comment) {
    this._comment! = comment;
    this.sComment.set(comment);
    this.authService.getUserById(this.comment.user)
    .subscribe(user => {
      this.user = user;
    })
  }

  public afterChangeAvatar = effect(() => {
    if (!this.authService.user) return;

    if (this.authService.user()!.id === this.comment.user) {
      this.user = this.authService.user()!;
      console.log('effect:',this.user.avatar);
      this.cd.detectChanges();
    }
  })

  constructor(
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {

    this.authService.getUserById(this.comment.user)
      .subscribe(user => {
        this.user = user;
        this.cd.detectChanges();
      })
  }


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
