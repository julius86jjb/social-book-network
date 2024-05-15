import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnDestroy, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PostService } from '../../services/post.service';
import { ModalType, ModalUploadService } from '../../services/modalUpload.service';
import { NewPostFormComponent } from './components/newPostForm/newPostForm.component';
import { SinglePostComponent } from './components/singlePost/singlePost.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { AuthService } from '../../../auth/services/auth.service';
import { SelectPostsComponent } from './components/selectPosts/selectPosts.component';
import { map, tap } from 'rxjs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    TopbarComponent,
    RouterModule,
    NewPostFormComponent,
    SinglePostComponent,
    SelectPostsComponent
  ],
  templateUrl: './wallPage.component.html',
  styleUrl: './wallPage.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WallPageComponent implements OnDestroy {


  public modalService = inject(ModalUploadService);
  public postService = inject(PostService)
  public authService = inject(AuthService)
  destroyRef = inject(DestroyRef)

  public posts = this.postService.posts;
  public postsType = signal<string>('following')

  constructor() {
    this.postService.getPosts(0, this.postsType())
      .pipe(
        tap(posts => this.posts.set(posts)),
        takeUntilDestroyed(this.destroyRef),
      ).subscribe();
  }

  onChangeCategory(type: string) {
    this.postService.posts.set([])
    this.postsType.set(type);
    this.postService.getPosts(0, this.postsType())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe();
  }




  getPosts(i: number) {

    if (i === this.posts().length - 1) {
      this.postService.getPosts(i + 1, this.postsType()).pipe(
        takeUntilDestroyed(this.destroyRef),
      ).subscribe();
    }
  }

  onOpenModal() {
    this.modalService.openModal(ModalType.newPost);
  }

  ngOnDestroy(): void {
    this.postService.posts.set([])
  }





}


