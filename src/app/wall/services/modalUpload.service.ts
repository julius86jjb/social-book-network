import { Injectable, inject, signal } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FileUpload } from '../interfaces/file-upload.model';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable, finalize } from 'rxjs';

export enum ModalType {
  newpost = 'newpost',
  changeavatar = 'changeavatar'
}


@Injectable({
  providedIn: 'root'
})
export class ModalUploadService {

  private basePath = '/uploads';
  private storage = inject(AngularFireStorage);
  public visible = signal<boolean>(false);
  public modalType = signal(ModalType.newpost)

  public img: string = '../../../assets/images/drag.png'

  constructor() { }

  openModal(type: ModalType) {
    this.visible.set(true);
    this.modalType.set(type);
  }

  closeModal() {
    this.visible.set(false);
  }




}
