import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnInit, computed, inject, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { NewPostFormComponent } from './components/newPostForm/newPostForm.component';
import { SinglePostComponent } from './components/singlePost/singlePost.component';
import { PostService } from '../../services/post.service';
import { ModalType, ModalUploadService } from '../../services/modalUpload.service';
import { ModalUploadComponent } from '../../components/modalUpload/modalUpload.component';
import { TopbarComponent } from '../../components/topbar/topbar.component';
import { Post } from '../../interfaces/post.interface';




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
  public errorMessage: string = '';
  public loading = signal<boolean>(false);

  public posts = this.postService.posts;

  ngOnInit(): void {
    this.getPosts()
  }

  getPosts() {
    this.loading.set(true);
    this.postService.getPosts()
      .subscribe({
        next: (posts: Post[]) => {
          if (posts.length === 0) {
            this.postService.havePosts.set(false);
            this.loading.set(false);
            return;
          }
          this.postService.havePosts.set(true)
          this.loading.set(false);
        },
        error: () => {
          this.postService.havePosts.set(false);
          this.loading.set(false);
        }
      })
  }


  onOpenModal() {
    this.modalService.openModal(ModalType.newpost);
  }

}
