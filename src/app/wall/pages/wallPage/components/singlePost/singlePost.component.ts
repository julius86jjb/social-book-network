import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, Input, InputSignal, OnInit, ViewChild, WritableSignal, effect, inject, input, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { PickerComponent } from '@ctrl/ngx-emoji-mart';


import { Comment, UserId, Post } from '../../../../interfaces/post.interface';
import { User } from '../../../../../auth/interfaces/user.interface';
import { AuthService } from '../../../../../auth/services/auth.service';
import { EmojiComponent } from '../../../../components/emoji/emoji.component';
import { PostService } from '../../../../services/post.service';
import { UserNamePipe } from '../../../../pipes/userName.pipe';
import { UserAvatarPipe } from '../../../../pipes/userAvatar.pipe';
import { CommentComponent } from './components/comment/comment.component';
import { Observable, of } from 'rxjs';

@Component({
  selector: 'wall-single-post',
  standalone: true,
  imports: [
    CommonModule,
    PickerComponent,
    EmojiComponent,
    ReactiveFormsModule,
    UserNamePipe,
    UserAvatarPipe,
    CommentComponent
  ],
  host: {
    "(window:click)": "onClickOutside()"
  },
  styleUrl: './singlePost.component.css',
  templateUrl: './singlePost.component.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})


export class SinglePostComponent {

  @ViewChild('txtComment') public inputComment: ElementRef<HTMLInputElement> = {} as ElementRef;

  public authService = inject(AuthService)
  public postService = inject(PostService)
  public singlePost = signal(this.post)
  public user: Observable<User | undefined> = of(undefined);

  _post!: Post;

  @Input()
  public get post(): Post {
    return this._post;
  }
  public set post(post: Post) {

    this._post = post;
    this.singlePost.set(post);
    this.user = this.authService.getUserById(this.post.userId)

  }

  public showTooltip: WritableSignal<boolean> = signal<boolean>(false);
  public showMenu = signal<boolean>(false);
  public displayCommentMenu = signal<boolean>(false);
  public loading = signal<boolean>(false);

  public newCommentForm: FormGroup = new FormGroup({
    text: new FormControl<string>('', Validators.required)
  });

  public afterChangeAvatar = effect(() => {
    if (!this.authService.user()) return;

    if (this.authService.user()!.id === this.post.userId) {
      this.user = of(this.authService.user()!);
      this.cd.markForCheck();
    }
  })

  constructor(
    private cd: ChangeDetectorRef
  ) {
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
    this.postService.delete(this.singlePost())
      .subscribe();
  }


  onUpdateLikes(action: 'addLike' | 'dislike') {

    this.postService.updateLikes(this.singlePost(), action)
      .subscribe();
  }

  onAddComment() {

    this.postService.addComment(this.singlePost(), this.newCommentForm.controls['text'].value)
      .subscribe();
    this.newCommentForm.patchValue({
      text: this.newCommentForm.controls['text'].reset()
    })
  }

  deleteComment(idComment: string) {
    this.postService.deleteComment(this.singlePost(), idComment)
      .subscribe();
  }



  public fillColor(): string {

    switch (this.newCommentForm.valid) {
      case true:
        return 'fillSvgValid';
      case false:
        return 'fillSvgInvalid';
    }
  }


  hasLiked(): boolean {
    const likes: UserId[] = this.post!.likes
    return likes.some((userId: UserId) => userId === this.currentUser.id);
  }


  public addEmojiToInput(event: any): void {
    console.log('hi');

    const emoji = event.emoji.native
    this.inputComment.nativeElement.value += emoji;
    this.newCommentForm.patchValue({
      text: this.newCommentForm.controls['text'].value + ' ' + emoji
    })
  }

}
