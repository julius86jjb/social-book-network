import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, inject, signal, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../../auth/services/auth.service';
import { ModalUploadService, ModalType } from '../../../../services/modalUpload.service';
import { ModalUploadComponent } from '../../../../components/modalUpload/modalUpload.component';

@Component({
  selector: 'wall-new-post-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ModalUploadComponent,

  ],
  templateUrl: './newPostForm.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPostFormComponent{

  private modalUploadService = inject(ModalUploadService);
  private authService = inject(AuthService);

  onOpenModal() {
    this.modalUploadService.openModal(ModalType.newpost);
  }

  get user() {
    return this.authService.user();
  }


}
