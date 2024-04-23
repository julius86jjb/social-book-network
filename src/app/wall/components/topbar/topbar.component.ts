import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { ModalType, ModalUploadService } from '../../services/modalUpload.service';

@Component({
  selector: 'wall-topbar-topbar',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './topbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(window:click)": "onClickOutside()"
  },

})
export class TopbarComponent {

  public showMenu: boolean = false
  private authService = inject(AuthService);
  private modalUploadService = inject(ModalUploadService);

  toogleProfileMenu($event: any) {
    $event.stopPropagation();
    this.showMenu = !this.showMenu
  }

  onClickOutside() {
    this.showMenu = false
  }

  onLogout() {
    this.authService.logout()
  }

  get user() {
    return this.authService.user();
  }

  onOpenModal() {
    this.modalUploadService.openModal(ModalType.changeavatar)
    this.showMenu = false;
  }


}
