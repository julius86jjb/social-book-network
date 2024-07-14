import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FilterComponent } from '../../../shared/components/filter/filter.component';
import { ModalComponent } from '../../components/modal/modal.component';
import { ModalUploadService } from '../../services/modalUpload.service';
import { PostFormComponent } from "../wallPage/components/postForm/postForm.component";
import { ProfileFormComponent } from "../wallPage/components/profileForm/profileForm.component";
import { UserModalComponent } from "../wallPage/components/userModal/userModal.component";
import { UserListComponent } from './components/userList/userList.component';


@Component({
  selector: 'app-users-page',
  standalone: true,
  templateUrl: './usersPage.component.html',
  styleUrl: './usersPage.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    CommonModule,
    ModalComponent,
    PostFormComponent,
    ProfileFormComponent,
    UserModalComponent,
    FilterComponent,
    UserListComponent,
  ]
})
export class UsersPageComponent {
  public modalService = inject(ModalUploadService);
  listFilter = signal('');
  filterLength = computed(() => this.listFilter().length);
}
