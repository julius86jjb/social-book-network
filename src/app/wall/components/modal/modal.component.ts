
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, HostListener, ElementRef, ViewChild} from '@angular/core';
import { ModalUploadService } from '../../services/modalUpload.service';
import { ClickOutsideDirective } from '../../../shared/directives/clickOutside.directive';
@Component({
  selector: 'wall-modal-upload',
  standalone: true,
  imports: [
    CommonModule,
    ClickOutsideDirective
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {

  @ViewChild('modal') public modal: ElementRef = {} as ElementRef

  public modalUploadService = inject(ModalUploadService);

  onCloseModal() {
    this.modalUploadService.closeModal();

  }

}
