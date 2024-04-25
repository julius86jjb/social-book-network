import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component, DestroyRef, ElementRef, Input,
  OnInit,
  ViewChild, WritableSignal, effect, inject, input, signal
} from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';

import { Observable, delay, of, switchMap, tap } from 'rxjs';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';

import { UserId, Post } from '../../../../interfaces/post.interface';
import { User } from '../../../../../auth/interfaces/user.interface';
import { AuthService } from '../../../../../auth/services/auth.service';
import { EmojiComponent } from '../../../../components/emoji/emoji.component';
import { PostService } from '../../../../services/post.service';
import { CommentComponent } from './components/comment/comment.component';
import { UserNamePipe } from '../../../../pipes/userName.pipe';

@Component({
  selector: 'wall-single-post',
  standalone: true,
  imports: [
    CommonModule,
    PickerComponent,
    EmojiComponent,
    ReactiveFormsModule,
    CommentComponent,
    UserNamePipe
  ],
  host: {
    "(window:click)": "onClickOutside()"
  },
  styleUrl: './singlePost.component.css',
  templateUrl: './singlePost.component.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class SinglePostComponent implements OnInit {

  destroyRef = inject(DestroyRef)

  @ViewChild('txtComment') public inputComment: ElementRef<HTMLInputElement> = {} as ElementRef;

  public authService = inject(AuthService);
  public postService = inject(PostService);


  public post = input.required<Post>()
  // public user: Observable<User | undefined> = of(undefined);
  // user = signal<User | null>(null);

  public showTooltip = signal<boolean>(false);
  public showMenu = signal<boolean>(false);
  public displayCommentMenu = signal<boolean>(false);

  public newCommentForm: FormGroup = new FormGroup({
    text: new FormControl<string>('', Validators.required)
  });

  dataSeriesId = input.required<string>();


  public user = toSignal(
    toObservable(this.dataSeriesId).pipe(switchMap((id) => this.getUser(id))),
    {initialValue: null}
  )

  private getUser(id: string) {
    console.log('hello');

    return this.authService.getUserById(id).pipe(delay(1000));
  }

  // public afterChangeAvatar = effect(() => {
  //   if (!this.authService.user()) return;

  //   if (this.authService.user()!.id === this.post().userId) {
  //     this.user = of(this.authService.user()!);
  //     this.cd.markForCheck();
  //   }
  // })

  ngOnInit() {
    // this.user = this.authService.getUserById(this.post().userId)
    console.log(this.user());
  }

  constructor(
    private cd: ChangeDetectorRef,
  ) {
    console.log(this.user());

    // effect(() => {
    //   this.authService.getUserById(this.post().userId)
    //     .subscribe((u) => this.user.set(u));
    // });
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
    )
      .subscribe();
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
