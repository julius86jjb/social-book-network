import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, EventEmitter, Input,
  InputSignal,
  OnInit,
  Output,
  ViewChild, computed, inject, input, signal
} from '@angular/core';
import { v4 as uuidv4 } from 'uuid';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';

import { Post, Comment } from '../../../../interfaces/post.interface';
import { User } from '../../../../../auth/interfaces/user.interface';
import { AuthService } from '../../../../../auth/services/auth.service';
import { EmojiComponent } from '../../../../components/emoji/emoji.component';
import { PostService } from '../../../../services/post.service';
import { CommentComponent } from './components/comment/comment.component';
import { UserNamePipe } from '../../../../pipes/userName.pipe';
import { UnderlineDirective } from '../../../../../shared/directives/underline.directive';
import { TimeAgoPipe } from '../../../../../shared/pipes/timeAgo.pipe';
import { LazyImageComponent } from '../../../../../shared/components/lazyImage/lazyImage.component';
import { ModalUploadService } from '../../../../services/modalUpload.service';
import { UserAvatarPipe } from '../../../../pipes/userAvatar.pipe';
import { Observable, map, switchMap, tap } from 'rxjs';
import { NotificationType, Notification } from '../../../../interfaces/notification.interface';
import { NotificationService } from '../../../../services/notification.service';

@Component({
  selector: 'wall-single-post',
  standalone: true,
  imports: [
    CommonModule,
    PickerComponent,
    EmojiComponent,
    ReactiveFormsModule,
    CommentComponent,
    UserNamePipe,
    UserAvatarPipe,
    UnderlineDirective,
    TimeAgoPipe,
    LazyImageComponent,
  ],
  host: {
    "(window:click)": "onClickOutside()"
  },
  styleUrl: './singlePost.component.css',
  templateUrl: './singlePost.component.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class SinglePostComponent implements OnInit {

  public authService = inject(AuthService);
  public postService = inject(PostService);
  private modalUploadService = inject(ModalUploadService);
  private notificationService = inject(NotificationService);
  destroyRef = inject(DestroyRef)

  @Output() loaded = new EventEmitter<number>();
  @Output() userUpdated = new EventEmitter<string>();
  @ViewChild('txtComment') public inputComment: ElementRef<HTMLInputElement> = {} as ElementRef;

  public index: InputSignal<number> = input.required<number>();
  public post: InputSignal<Post> = input.required<Post>();
  public showAllComments = signal<boolean>(false)

  public showTooltip = signal<boolean>(false);
  public showMenu = signal<boolean>(false);
  public displayCommentMenu = signal<boolean>(false);

  public newCommentForm: FormGroup = new FormGroup({
    text: new FormControl<string>('', [Validators.required])
  });

  public hasLiked = computed(() => this.post().likes.includes(this.currentUser.id))


  constructor() { }

  ngOnInit() {
    this.loaded.emit(this.index());
  }

  get currentUser() {
    return this.authService.user()!
  }

  viewAllComments() {
    this.showAllComments.set(true);
  }

  viewLessComments() {
    this.showAllComments.set(false);
  }

  onClickOutside() {
    this.showMenu.set(false);
    this.displayCommentMenu.set(false);
  }


  toogleProfileMenu($event: any) {
    $event.stopPropagation();
    this.showMenu.set(!this.showMenu())
  }

  onDeletePost() {
    this.showMenu.set(false);
    this.postService.delete(this.post()).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  onUpdateLikes() {
    this.postService.update({ ...this.post(), likes: [...this.post().likes, this.authService.user()!.id] }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((post: Post) =>
      this.notificationService.createNotification(post.userId, NotificationType.likedPost, post.message || '',).subscribe()
    );
  }

  onUpdateDislikes() {
    this.postService.update({
      ...this.post(), likes: this.post().likes
        .filter((userId: string) => userId !== this.authService.user()!.id)
    }).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe()
  }


  onAddComment() {
     const postToUpdate: Post = {
      ...this.post(),
      comments: [
        ...this.post().comments,
        { id: uuidv4(), userId: this.authService.user()!.id, message: this.newCommentForm.controls['text'].value, likes: [], date: new Date() }
      ]
    }
    if (this.newCommentForm.invalid) return;

    this.postService.update(postToUpdate)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe((post: Post) => this.notificationService.createNotification(post.userId, NotificationType.commentOn, post.message || '',).subscribe());
    this.newCommentForm.patchValue({
      text: this.newCommentForm.controls['text'].reset()
    })
    this.showAllComments.set(true);
  }



  deleteComment(idComment: string) {
    this.post().comments = this.post().comments
      .filter((comment: Comment) => comment.id !== idComment)
    this.postService.update(this.post()).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }


  updateCommentLikes(action: string, comment: Comment) {
    switch (action) {
      case 'addLike':
        this.post().comments.find(_comment => comment.id === _comment.id)?.likes
          .push(this.currentUser.id)
        break;
      case 'dislike':
        const newLikes = comment.likes.filter((userId: string) => userId !== this.authService.user()!.id)
        this.post().comments = this.post().comments.map((_comment) => {
          if (comment.id === _comment.id) {
            return {
              ..._comment,
              likes: newLikes
            }
          } else return _comment
        })
        break;
    }
    this.postService.update(this.post()).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe((post: Post) => this.notificationService.createNotification(comment.userId, NotificationType.likedComment, comment.message || '',).subscribe());
  }

  fillColor(): string {
    switch (this.newCommentForm.valid) {
      case true:
        return 'fillSvgValid';
      case false:
        return 'fillSvgInvalid';
    }
  }

  addEmojiToInput(event: any): void {
    const emoji = event.emoji.native
    this.inputComment.nativeElement.value += emoji;
    this.newCommentForm.patchValue({
      text: this.newCommentForm.controls['text'].value + ' ' + emoji
    })
  }

  onOpenModal() {
    this.modalUploadService.loadPost(this.post())
  }

  onOpenUserModal() {
    this.modalUploadService.loadUser(this.post().userId)
  }

  onCloseModal() {
    this.modalUploadService.closeModal();
  }

}
