import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AuthService } from '../../../auth/services/auth.service';
import { ModalType, ModalUploadService } from '../../services/modalUpload.service';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'wall-topbar-topbar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule
  ],
  templateUrl: './topbar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    "(window:click)": "onClickOutside()"
  },


})
export class TopbarComponent {

  public showProfileMenu: boolean = false
  public showMenu: boolean = false
  private authService = inject(AuthService);
  private modalUploadService = inject(ModalUploadService);

  toogleProfileMenu($event: any) {
    $event.stopPropagation();
    this.showProfileMenu = !this.showProfileMenu
  }

  onClickOutside() {
    this.showProfileMenu = false
    this.showMenu = false
  }

  onLogout() {
    this.authService.logout()
  }

  get user() {
    return this.authService.user();
  }

  onOpenModal() {
    this.modalUploadService.openModal(ModalType.profile)
    this.showProfileMenu = false;
    this.showMenu = false;
  }

  toggleMenu($event: any) {
    console.log('hey!');
    $event.stopPropagation();
    this.showMenu = !this.showMenu
  }


}
