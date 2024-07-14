import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TopbarService } from '../../../services/topbar.service';
import { AuthService } from '../../../../auth/services/auth.service';
import { User } from '../../../../auth/interfaces/user.interface';
import { Router } from '@angular/router';

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
  private router = inject(Router)


  get user(): User | undefined {
    return this.authService.currentUser;
  }

  onLogout() {
    this.authService.logout()
    this.router.navigate(['/login']);
  }

  onOpenModal() {
    this.topbarService.openModal()
  }
  onToogleProfileMenu() {
    this.topbarService.toogleProfileMenu()
  }
}
