import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';

import { catchError, of, Observable, throwError, finalize, first, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { Post, Comment, UserId } from '../interfaces/post.interface';
import { AuthService } from '../../auth/services/auth.service';
import { subscribe } from 'diagnostics_channel';


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


  get currentUser() {
    return this.authService.user()!
  }

  constructor() { }

  getPosts(): Observable<Post[]> {

    return this.http.get<Post[]>(`${this.baseUrl}?_embed=user`)
      .pipe(
        tap((posts: Post[]) => this.posts.set(posts.reverse())),
        tap((posts: Post[]) => posts.length === 0
          ? this.havePosts.set(false)
          : this.havePosts.set(true)),
        catchError(this.handleError)

      )
  }

  savePost(post: Post) {
    this.http.post<Post>(`${this.baseUrl}`, post).subscribe((post) => {
      if (this.posts()) {
        this.posts.update((posts) => [
          post,
          ...posts!
        ])
        if (this.posts()!.length > 0) this.havePosts.set(true);
      }
    })
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

  update(post: Post) {

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
    return this.http.get<Post>(`${this.baseUrl}/posts/${postId}`)
  }


  updateLikes(postToUpdate: Post, action: string) {
    switch (action) {
      case 'addLike':
        postToUpdate = { ...postToUpdate, likes: [...postToUpdate.likes, this.authService.user()!.id as UserId] }
        break;
      case 'dislike':
        postToUpdate.likes = postToUpdate.likes
          .filter((userId: UserId) => userId !== this.authService.user()!.id as UserId)
        break;
    }
    return this.update(postToUpdate)
  }

  updateCommentLikes(post: Post, comment: Comment, action: string) {



    switch (action) {
      case 'addLike':
        post.comments.find(_comment => comment.id === _comment.id)?.likes
          .push(this.currentUser.id)
        break;
      case 'dislike':
        console.log('entra');

        const newLikes = comment.likes.filter((userId: UserId) => userId !== this.authService.user()!.id as UserId)
        console.log(comment.likes);

        console.log(newLikes);


        post.comments = post.comments.map((_comment) => {
          if (comment.id === _comment.id) {
            console.log('hey!');

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
        { id: uuidv4(), user: this.authService.user()!.id as UserId, message: textComment!, likes: [] }
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
