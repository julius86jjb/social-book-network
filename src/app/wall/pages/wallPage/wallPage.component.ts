import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, ElementRef, OnDestroy, OnInit, Renderer2, ViewChild, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PostService } from '../../services/post.service';
import { ModalType, ModalUploadService } from '../../services/modalUpload.service';
import { NewPostFormComponent } from './components/newPostForm/newPostForm.component';
import { SinglePostComponent } from './components/singlePost/singlePost.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { AuthService } from '../../../auth/services/auth.service';
import { SelectPostsComponent } from './components/selectPosts/selectPosts.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { PostFormComponent } from './components/postForm/postForm.component';
import { ProfileFormComponent } from './components/profileForm/profileForm.component';
import { UserModalComponent } from './components/userModal/userModal.component';
import { TopbarService } from '../../services/topbar.service';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TopbarComponent,
    RouterModule,
    NewPostFormComponent,
    SinglePostComponent,
    SelectPostsComponent,
    ModalComponent,
    PostFormComponent,
    ProfileFormComponent,
    UserModalComponent
  ],
  templateUrl: './wallPage.component.html',
  styleUrl: './wallPage.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WallPageComponent implements OnInit, OnDestroy {

  // @ViewChild('modalsContainer')
  // modalsContainer!: ElementRef;
  // @ViewChild(NewPostFormComponent)
  // postFormComponent!: NewPostFormComponent;
  // @ViewChild(PostFormComponent)
  // postModalComponent!: PostFormComponent;
  // @ViewChild(ProfileFormComponent)
  // profileModalComponent!: ProfileFormComponent;
  // @ViewChild(UserModalComponent)
  // userModalComponent!: UserModalComponent;

  // private renderer = inject(Renderer2);


  public modalService = inject(ModalUploadService);
  private postService = inject(PostService)
  private topbarService = inject(TopbarService)
  private authService = inject(AuthService)
  destroyRef = inject(DestroyRef)

  public posts = this.postService.posts;
  public postsType = signal<string>('following')

  constructor() {


  }

  ngOnInit() {
    this.onCurrentUserUpdate();
    // this.renderer.listen('window', 'click', (e: Event) => {
    //   if (e.target !== this.postFormComponent.toogleButtonInput.nativeElement
    //       && this.modalsContainer.nativeElement.contains(e.target)
    //       && !this.postModalComponent.modal.nativeElement.contains(e.target)
    //       && !this.profileModalComponent.modal.nativeElement.contains(e.target)
    //       && !this.userModalComponent.modal.nativeElement.contains(e.target)) {
    //         this.modalService.closeModal();
    //       }
    // });
  }

  onCurrentUserUpdate() {

    this.authService.currentUserUpdate$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.getPosts())
  }


  getPosts() {
    this.postService.posts.set([])
    this.postService.getPosts(0, this.postsType())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe();
  }

  onChangeCategory(type: string) {
    this.postsType.set(type);
    this.getPosts()
  }

  getMorePosts(i: number) {
    if (i === this.posts().length - 1) {
      this.postService.getPosts(i + 1, this.postsType()).pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe();
    }
  }

  onOpenModal() {
    this.modalService.openModal(ModalType.post);
  }

  ngOnDestroy(): void {
    this.postService.posts.set([])
  }
}


