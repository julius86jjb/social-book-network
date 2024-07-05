import { Injectable, inject, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FileUpload } from '../interfaces/file-upload.model';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, finalize } from 'rxjs';
import { Post } from '../interfaces/post.interface';
import { PostService } from './post.service';
import { User } from '../../auth/interfaces/user.interface';
import { UserService } from './user.service';

export enum ModalType {
  post = 'post',
  profile = 'profile',
  user = 'user'
}


@Injectable({
  providedIn: 'root'
})
export class ModalUploadService {

  private basePath = '/uploads';
  private storage = inject(AngularFireStorage);
  private postService = inject(PostService);
  private userService = inject(UserService);
  public visible = signal<boolean>(false);
  public modalType = signal(ModalType.profile)
  public post = signal<Post | null>(null)
  public user = signal<User | null>(null)

  public img: string = '../../../assets/images/drag.png'

  constructor() { }

  openModal(type: ModalType) {
    this.modalType.set(type);
    this.visible.set(true);
  }

  closeModal() {
    this.post.set(null)
    this.visible.set(false);
  }

  loadPost(post: Post) {
    this.post.set(post);
    this.openModal(ModalType.post)
  }


  loadUser(userId: string) {
    this.userService.getUserById(userId)
      .subscribe((user: User) => this.user.set(user))
    this.openModal(ModalType.user)
  }

  // removeImage() {
  //   const newPost: Post = {
  //     ...this.post()!,
  //     imageUrl: undefined
  //   }
  //   this.post.set(newPost)
  // }




}
