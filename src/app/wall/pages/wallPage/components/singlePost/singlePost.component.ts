import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy, Component, DestroyRef, ElementRef, Input,
  OnInit,
  ViewChild, effect, inject, input, signal
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';

import { UserId, Post, Comment } from '../../../../interfaces/post.interface';
import { User } from '../../../../../auth/interfaces/user.interface';
import { AuthService } from '../../../../../auth/services/auth.service';
import { EmojiComponent } from '../../../../components/emoji/emoji.component';
import { PostService } from '../../../../services/post.service';
import { CommentComponent } from './components/comment/comment.component';
import { UserNamePipe } from '../../../../pipes/userName.pipe';
import { UnderlineDirective } from '../../../../../shared/directives/underline.directive';

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
    UnderlineDirective
  ],
  host: {
    "(window:click)": "onClickOutside()"
  },
  styleUrl: './singlePost.component.css',
  templateUrl: './singlePost.component.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class SinglePostComponent implements OnInit{


  @ViewChild('txtComment') public inputComment: ElementRef<HTMLInputElement> = {} as ElementRef;

  destroyRef = inject(DestroyRef)
  public authService = inject(AuthService);
  public postService = inject(PostService);

  public post = input.required<Post>();
  public user = signal<User | undefined>(undefined);
  // public user = toSignal(
  //   toObservable(this.post).pipe(switchMap((post) => this.getUserById(post.userId)))
  // )


  public showTooltip = signal<boolean>(false);
  public showMenu = signal<boolean>(false);
  public displayCommentMenu = signal<boolean>(false);

  public newCommentForm: FormGroup = new FormGroup({
    text: new FormControl<string>('', Validators.required)
  });

  public afterChangeAvatar = effect(() => {
    if (!this.currentUser) return;
    if (this.currentUser.id === this.post()?.userId) this.user.set(this.currentUser)

  }, { allowSignalWrites: true });


  ngOnInit() {
    this.postService.loading.set(true);
      this.authService.getUserById(this.post().userId)
        .subscribe((u) => {
          this.user.set(u);
          this.postService.loading.set(false);
        });
  }
  constructor() {
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
    )
      .subscribe();
  }

  onAddComment() {

    this.postService.addComment(this.post(), this.newCommentForm.controls['text'].value)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
    this.newCommentForm.patchValue({
      text: this.newCommentForm.controls['text'].reset()
    })
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



  fillColor(): string {

    switch (this.newCommentForm.valid) {
      case true:
        return 'fillSvgValid';
      case false:
        return 'fillSvgInvalid';
    }
  }


  hasLiked(): boolean {
    const likes: UserId[] = this.post().likes
    return likes.some((userId: UserId) => userId === this.currentUser.id);
  }


  addEmojiToInput(event: any): void {
    console.log('hi');

    const emoji = event.emoji.native
    this.inputComment.nativeElement.value += emoji;
    this.newCommentForm.patchValue({
      text: this.newCommentForm.controls['text'].value + ' ' + emoji
    })
  }

}
