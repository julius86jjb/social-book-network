import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, OnDestroy, computed, effect, inject, signal } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { catchError, of, Observable, throwError, finalize, first, tap, Observer, skip, take, map } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { Post, Comment } from '../interfaces/post.interface';
import { AuthService } from '../../auth/services/auth.service';
import { subscribe } from 'diagnostics_channel';
import { User } from '../../auth/interfaces/user.interface';


@Injectable({
  providedIn: 'root'
})
export class PostService {

  private http = inject(HttpClient);
  private baseUrl = 'http://localhost:3000/posts';
  private basePath = '/uploads/posts';
  private storage = inject(AngularFireStorage);
  private authService = inject(AuthService);

  public posts = signal<Post[]>([])
  public havePosts = signal<boolean>(true);
  public loading = signal<boolean>(false);

  constructor() { }


  get currentUser() {
    return this.authService.user()!
  }

  getPosts(i: number, type: string): Observable<Post[]> {
    return this.http.get<Post[]>(`${this.baseUrl}`)
      .pipe(
        tap((posts: Post[]) => posts.length === 0 ? this.havePosts.set(false) : this.havePosts.set(true)),
        map(posts => {

          switch (type) {
            case 'my-posts':
              return posts.filter(post => post.user.id === this.authService.user()!.id)
            case 'following':
              return posts.filter(post => this.currentUser.following.includes(post.user.id) || post.user.id === this.currentUser.id)
            default:
              return posts
          }
        }
        ),
        map(posts => posts.reverse()),
        map(posts => posts.slice(i, i + 5)),
        tap((posts: Post[]) => this.posts.update(oldPosts => [...oldPosts, ...posts])),
        catchError(this.handleError)
      )
  }


  createPost(post: Post, img: File | null): Observable<number | undefined> {
    try {
      if (!img) {

        this.savePost(post)
        return of(undefined)

      } else {

        const filePath = `${this.basePath}/${img!.name}`;
        const storageRef = this.storage.ref(filePath);
        const uploadTask = this.storage.upload(filePath, img);

        uploadTask.snapshotChanges().pipe(
          finalize(() => {
            storageRef.getDownloadURL().subscribe(downloadURL => {
              const newPost = { ...post, imageUrl: downloadURL } as Post
              this.savePost(newPost)

            })
          })
        ).subscribe();
        return uploadTask.percentageChanges();
      }
    } catch (error) {

      return of(undefined)
    }
  }

  editPost(post: Post, img: File | null): Observable<number | undefined> {
    try {
      if (!img) {

        this.update(post).subscribe()
        return of(undefined)

      } else {

        const filePath = `${this.basePath}/${img!.name}`;
        const storageRef = this.storage.ref(filePath);
        const uploadTask = this.storage.upload(filePath, img);

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
    } catch (error) {

      return of(undefined)
    }
  }


  savePost(post: Post) {
    this.http.post<Post>(`${this.baseUrl}`, post).subscribe((_post) => {
      if (this.posts()) {
        this.posts.update((posts) => [
          _post,
          ...posts!,
        ])

        if (this.posts()!.length > 0) this.havePosts.set(true);
      }
    })
  }



  update(post: Post): Observable<Post> {

    if (!post.id) throw Error('Post is required');
    return this.http.patch<Post>(`${this.baseUrl}/${post.id}`, post).pipe(
      tap((postUpdated: Post) => this.posts.update((posts: Post[]) =>
        posts.map((_post: Post) => _post.id === post.id ? postUpdated : _post)))
    )
  }


  delete(post: Post) {
    if (!post.id) throw Error('Post is required');
    return this.http.delete<Post>(`${this.baseUrl}/${post.id}`).pipe(
      tap((deletedPost: Post) => this.posts.update((posts: Post[] | undefined) => posts!
        .filter((post: Post) => post.id !== deletedPost.id))),
      tap(() => (this.posts()?.length === 0) ? this.havePosts.set(false) : this.havePosts.set(true))
    )
  }

  getPostById(postId: string): Observable<Post> {
    return this.http.get<Post>(`${this.baseUrl}/${postId}`)
  }


  updateLikes(postToUpdate: Post, action: string) {
    switch (action) {
      case 'addLike':
        postToUpdate = { ...postToUpdate, likes: [...postToUpdate.likes, this.authService.user()! as User] }
        break;
      case 'dislike':
        postToUpdate.likes = postToUpdate.likes
          .filter((user: User) => user.id !== this.authService.user()!.id)
        break;
    }
    return this.update(postToUpdate)
  }


  updateCommentLikes(post: Post, comment: Comment, action: string) {

    switch (action) {
      case 'addLike':
        post.comments.find(_comment => comment.id === _comment.id)?.likes
          .push(this.currentUser)
        break;
      case 'dislike':
        const newLikes = comment.likes.filter((user: User) => user.id !== this.authService.user()!.id)
        post.comments = post.comments.map((_comment) => {
          if (comment.id === _comment.id) {

            return {
              ..._comment,
              likes: newLikes
            }
          } else return _comment
        })
        break;
    }
    return this.update(post)
  }

  addComment(postToUpdate: Post, textComment?: string) {
    postToUpdate = {
      ...postToUpdate,
      comments: [
        ...postToUpdate.comments,
        { id: uuidv4(), user: this.authService.user()! as User, message: textComment!, likes: [], date: new Date() }
      ]
    }
    return this.update(postToUpdate)
  }

  deleteComment(postToUpdate: Post, commentId: string) {
    postToUpdate.comments = postToUpdate.comments
      .filter((comment: Comment) => comment.id !== commentId)
    return this.update(postToUpdate)
  }



  private handleError(err: HttpErrorResponse): Observable<never> {
    // in a real world app, we may send the server to some remote logging infrastructure
    // instead of just logging it to the console
    let errorMessage = '';
    if (err.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      errorMessage = `An error occurred: ${err.error.message}`;
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      errorMessage = `Server returned code: ${err.status}, error message is: ${err.message
        }`;
    }
    console.error(errorMessage);
    return throwError(() => errorMessage);
  }

}
