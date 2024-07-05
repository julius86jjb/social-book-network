import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, OnInit, Output, ViewChild, inject, signal, AfterViewInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../../auth/services/auth.service';
import { ModalUploadService, ModalType } from '../../../../services/modalUpload.service';
import { ModalComponent } from '../../../../components/modal/modal.component';
import { TopbarService } from '../../../../services/topbar.service';

@Component({
  selector: 'wall-new-post-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ModalComponent
  ],
  templateUrl: './newPostForm.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewPostFormComponent {

  private modalUploadService = inject(ModalUploadService);
  private authService = inject(AuthService);
  private topbarService = inject(TopbarService);

  onOpenModal(type: string) {
    switch (type) {
      case 'post':
        this.modalUploadService.openModal(ModalType.post);
        break;
      case 'profile':
        this.modalUploadService.openModal(ModalType.profile);
        break;

      default:
        break;
    }

  }

  get user() {
    return this.authService.user();
  }




}
