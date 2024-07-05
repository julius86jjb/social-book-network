
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, } from '@angular/core';
import { ModalUploadService } from '../../services/modalUpload.service';

@Component({
  selector: 'wall-modal-upload',
  standalone: true,
  imports: [
    CommonModule
  ],
  templateUrl: './modal.component.html',
  styleUrl: './modal.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalComponent {

  public modalUploadService = inject(ModalUploadService);

}
