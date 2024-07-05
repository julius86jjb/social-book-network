import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { ModalUploadService } from '../../../../services/modalUpload.service';
import { LazyImageComponent } from '../../../../../shared/components/lazyImage/lazyImage.component';
import { User } from '../../../../../auth/interfaces/user.interface';
import { UserAvatarPipe } from "../../../../pipes/userAvatar.pipe";

@Component({
    selector: 'app-user-modal',
    standalone: true,
    templateUrl: './userModal.component.html',
    styleUrl: './userModal.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        LazyImageComponent,
        UserAvatarPipe
    ]
})
export class UserModalComponent {

  public modalUploadService = inject(ModalUploadService);

  public userData = input<User | null>(null)

  onCloseModal() {
    this.modalUploadService.closeModal();
  }
}

