import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';

import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PostService } from '../../services/post.service';
import { ModalType, ModalUploadService } from '../../services/modalUpload.service';
import { NewPostFormComponent } from './components/newPostForm/newPostForm.component';
import { SinglePostComponent } from './components/singlePost/singlePost.component';
import { ModalUploadComponent } from '../../components/modalUpload/modalUpload.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { AuthService } from '../../../auth/services/auth.service';
import { User } from '../../../auth/interfaces/user.interface';




@Component({
  standalone: true,
  imports: [
    CommonModule,
    TopbarComponent,
    RouterModule,
    ModalUploadComponent,
    NewPostFormComponent,
    SinglePostComponent,
  ],
  templateUrl: './wallPage.component.html',
  styleUrl: './wallPage.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class WallPageComponent implements OnInit {


  public modalService = inject(ModalUploadService);
  public postService = inject(PostService)
  public authService = inject(AuthService)
  destroyRef = inject(DestroyRef)

  public posts = this.postService.posts;
  id = signal('1');

  ngOnInit(): void {
    this.postService.loading.set(true)
    this.postService.getPosts()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => this.postService.loading.set(false));
  }


  onOpenModal() {
    this.modalService.openModal(ModalType.newpost);
  }



}


