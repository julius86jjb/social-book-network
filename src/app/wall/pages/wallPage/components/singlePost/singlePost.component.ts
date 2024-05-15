import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, EventEmitter, Input,
  InputSignal,
  OnInit,
  Output,
  ViewChild, effect, inject, input, signal
} from '@angular/core';
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
import { ModalType, ModalUploadService } from '../../../../services/modalUpload.service';

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
    UnderlineDirective,
    TimeAgoPipe,
    LazyImageComponent
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
  destroyRef = inject(DestroyRef)

  @Output() loaded = new EventEmitter<number>();
  @Output() userUpdated = new EventEmitter<string>();
  @ViewChild('txtComment') public inputComment: ElementRef<HTMLInputElement> = {} as ElementRef;

  public index: InputSignal<number> = input.required<number>();
  public post: InputSignal<Post> = input.required<Post>();
  public allComments = signal<boolean>(false)

  public showTooltip = signal<boolean>(false);
  public showMenu = signal<boolean>(false);
  public displayCommentMenu = signal<boolean>(false);

  public newCommentForm: FormGroup = new FormGroup({
    text: new FormControl<string>('', [Validators.required])
  });

  // public afterChangeAvatar = effect(() => {
  //   if (!this.currentUser) return;
  //   if (this.currentUser.id === this.post().userId) this.user.set(this.currentUser)

  // }, { allowSignalWrites: true });

  constructor() {
    toObservable(this.authService.afterCurrentUserUpdate).subscribe((user: User | undefined) => {
      if (user) {
        const userUpdated: User = this.post().user.id === user.id ? user : this.post().user;
        const commentsUpdated: Comment[] = this.post().comments.map(_comment => _comment.user.id === user.id ? { ..._comment, user: user } : _comment)
        this.postService.update({
          ...this.post(),
          user: userUpdated,
          comments: commentsUpdated
        }).subscribe()
      }
    })
  }

  ngOnInit() {
    this.loaded.emit(this.index());
  }

  get currentUser() {
    return this.authService.user()!
  }

  viewAllComments(){
    this.allComments.set(true);
  }

  viewLessComments() {
    this.allComments.set(false);
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
    )
      .subscribe();
  }


  onUpdateLikes(action: 'addLike' | 'dislike') {

    this.postService.updateLikes(this.post(), action).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  onAddComment() {

    if (this.newCommentForm.invalid) return;

    this.postService.addComment(this.post(), this.newCommentForm.controls['text'].value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
    this.newCommentForm.patchValue({
      text: this.newCommentForm.controls['text'].reset()
    })

    this.allComments.set(true);
  }

  deleteComment(idComment: string) {
    this.postService.deleteComment(this.post(), idComment).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }


  updateCommentLikes(action: string, comment: Comment) {
    this.postService.updateCommentLikes(this.post(), comment, action).pipe(
      takeUntilDestroyed(this.destroyRef),
    ).subscribe();
  }

  updateComments(user: User, comment: Comment) {
    const commentsUpdated: Comment[] = this.post().comments.map(_comment => _comment.user.id === user.id ? { ..._comment, user: user } : _comment)
    const postToUpdate = {
      ...this.post(),
      comments: commentsUpdated
    }
    this.postService.update(postToUpdate).subscribe();
  }



  fillColor(): string {

    switch (this.newCommentForm.valid) {
      case true:
        return 'fillSvgValid';
      case false:
        return 'fillSvgInvalid';
    }
  }


  hasLiked(): boolean {
    const likes: User[] = this.post().likes
    return likes.some((user: User) => user.id === this.currentUser.id);
  }


  addEmojiToInput(event: any): void {

    const emoji = event.emoji.native
    this.inputComment.nativeElement.value += emoji;
    this.newCommentForm.patchValue({
      text: this.newCommentForm.controls['text'].value + ' ' + emoji
    })
  }

  onOpenModal() {
    this.modalUploadService.openModal(ModalType.editPost, this.post().id);
  }

}
