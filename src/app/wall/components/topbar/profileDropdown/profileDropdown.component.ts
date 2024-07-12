import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TopbarService } from '../../../services/topbar.service';
import { AuthService } from '../../../../auth/services/auth.service';

@Component({
  selector: 'app-profile-dropdown',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './profileDropdown.component.html',
  styleUrl: './profileDropdown.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileDropdownComponent {

  public topbarService = inject(TopbarService);
  private authService = inject(AuthService);

  get user() {
    return this.authService.user();
  }

  onLogout() {
    this.topbarService.logout()
  }

  onOpenModal() {
    this.topbarService.openModal()
  }
  onToogleProfileMenu() {
    this.topbarService.toogleProfileMenu()
  }
}
