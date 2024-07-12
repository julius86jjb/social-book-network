import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, inject, input, ViewChild } from '@angular/core';
import { ModalUploadService } from '../../../../services/modalUpload.service';
import { LazyImageComponent, LazyImageType } from '../../../../../shared/components/lazyImage/lazyImage.component';
import { User } from '../../../../../auth/interfaces/user.interface';

@Component({
    selector: 'app-user-modal',
    standalone: true,
    templateUrl: './userModal.component.html',
    styleUrl: './userModal.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        LazyImageComponent
    ]
})
export class UserModalComponent {

  @ViewChild('modal') public modal: ElementRef = {} as ElementRef


  public modalUploadService = inject(ModalUploadService);

  public userData = input<User | null>(null);
  public lazyImageType = LazyImageType;

  onCloseModal() {
    this.modalUploadService.closeModal();
  }
}

