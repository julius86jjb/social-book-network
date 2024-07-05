import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { catchError, of, Observable, throwError, finalize, first, tap, Observer, skip, take, map, switchMap, lastValueFrom, last } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { Post, Comment } from '../interfaces/post.interface';
import { AuthService } from '../../auth/services/auth.service';
import { subscribe } from 'diagnostics_channel';
import { User } from '../../auth/interfaces/user.interface';
import { NotificationService } from './notification.service';
import { NotificationType } from '../interfaces/notification.interface';


@Injectable({
  providedIn: 'root'
})
export class PostService {

  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/posts';
  private basePath = '/uploads/posts';
  private storage = inject(AngularFireStorage);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  public posts = signal<Post[]>([])
  public havePosts = signal<boolean>(true);
  public loading = signal<boolean>(false);
  public allPosts = signal<Post[]>([])


  constructor() { }


  get currentUser() {
    return this.authService.user()!
  }

  getPosts(i: number, type: string): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl)
      .pipe(
        tap((posts: Post[]) => posts.length === 0 ? this.havePosts.set(false) : this.havePosts.set(true)),
        map((posts: Post[]) => {
          switch (type) {
            case 'my-posts':
              return posts.filter(post => post.userId === this.authService.user()!.id)
            case 'following':
              return posts.filter(post => this.currentUser.following.includes(post.userId) || post.userId === this.currentUser.id)
            default:
              return posts
          }
        }),
        map((posts: Post[]) => posts.reverse()),
        map((posts: Post[]) => posts.slice(i, i + 5)),
        tap((posts: Post[]) => this.posts.update(oldPosts => [...oldPosts, ...posts])),
        catchError(this.handleError)
      )
  }

  getAllPost(): Observable<Post[]> {
    return this.http.get<Post[]>(this.baseUrl).pipe(
      tap((posts) => this.allPosts.set(posts))
    )
  }


  getPostById(postId: string): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/${postId}`)
  }


  createPost(post: Post, file: File | null): Observable<number | undefined> {

    if (!file) {
      this.savePost(post).subscribe(post => {
        this.currentUser.followers
          .forEach(followerId =>
            this.notificationService.createNotification(followerId, NotificationType.newPost, post.message || '')
              .subscribe()
          );
      })
      return of(100);

    } else {
      const filePath = `${this.basePath}/${file!.name}`;
      const storageRef = this.storage.ref(filePath);
      const uploadTask = this.storage.upload(filePath, file);

      uploadTask.snapshotChanges().pipe(
        finalize(() => {
          storageRef.getDownloadURL().subscribe(async downloadURL => {
            this.savePost({ ...post, imageUrl: downloadURL }).subscribe(post => {
              this.currentUser.followers
                .forEach(followerId =>
                  this.notificationService.createNotification(followerId, NotificationType.newPost, post.message || '')
                    .subscribe()
                );
            })

          })
        })
      ).subscribe();
      return uploadTask.percentageChanges();
    }

  }


  savePost(post: Post): Observable<Post> {
    return this.http.post<Post>(`${this.baseUrl}`, post).pipe(
      tap((newPost: Post) => this.posts.update((posts) => [newPost, ...posts])),
      tap((newPost: Post) => this.allPosts.update((posts) => [newPost, ...posts])),
      tap(() => (this.posts()!.length > 0) ? this.havePosts.set(true) : this.havePosts.set(false))
    )
  }

  editPost(post: Post, file: File | null): Observable<number | undefined> {
      if (!file) {
        this.update(post).subscribe();
        return of(100)

      } else {

        const filePath = `${this.basePath}/${file!.name}`;
        const storageRef = this.storage.ref(filePath);
        const uploadTask = this.storage.upload(filePath, file);

        uploadTask.snapshotChanges().pipe(
          finalize(() => {
            storageRef.getDownloadURL().subscribe(downloadURL => {
              const newPost = { ...post, imageUrl: downloadURL } as Post
              this.update(newPost).subscribe()
            })
          })
        ).subscribe();
        return uploadTask.percentageChanges();
      }

  }

  update(post: Post): Observable<Post> {
    if (!post.id) throw Error('Post is required');
    return this.http.put<Post>(`${this.baseUrl}/${post.id}`, post).pipe(
      tap((postUpdated: Post) => this.posts.update((posts: Post[]) =>
        posts.map((_post: Post) => _post.id === post.id ? postUpdated : _post))),
      tap((postUpdated: Post) => this.allPosts.update((posts: Post[]) =>
        posts.map((_post: Post) => _post.id === post.id ? postUpdated : _post)))
    )
  }


  delete(post: Post) {
    if (!post.id) throw Error('Post is required');
    return this.http.delete<Post>(`${this.baseUrl}/${post.id}`).pipe(
      tap((deletedPost: Post) => this.posts.update((posts: Post[] | undefined) => posts!
        .filter((post: Post) => post.id !== deletedPost.id))),
      tap((deletedPost: Post) => this.allPosts.update((posts: Post[] | undefined) => posts!
        .filter((post: Post) => post.id !== deletedPost.id))),
      tap(() => (this.posts()?.length === 0) ? this.havePosts.set(false) : this.havePosts.set(true))
    )
  }



  private handleError(err: HttpErrorResponse): Observable<never> {
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {

      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message
        }`;
    }
    return throwError(() => errorMessage);
  }

}
