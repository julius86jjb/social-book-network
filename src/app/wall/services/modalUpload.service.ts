import { Injectable, inject, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FileUpload } from '../interfaces/file-upload.model';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, finalize } from 'rxjs';
import { Post } from '../interfaces/post.interface';
import { PostService } from './post.service';

export enum ModalType {
  newPost = 'newPost',
  profile = 'profile',
  editPost = 'editPost'
}


@Injectable({
  providedIn: 'root'
})
export class ModalUploadService {

  private basePath = '/uploads';
  private storage = inject(AngularFireStorage);
  private postService = inject(PostService);
  public visible = signal<boolean>(false);
  public modalType = signal(ModalType.editPost)
  public post = signal<Post | undefined>(undefined)

  public img: string = '../../../assets/images/drag.png'

  constructor() { }

  openModal(type: ModalType, postId?: string) {
    if (postId) {
      this.postService.getPostById(postId!)
        .subscribe(_post => this.post.set(_post))
    }
    this.modalType.set(type);
    this.visible.set(true);
  }

  closeModal() {
    this.visible.set(false);
  }




}
