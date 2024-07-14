import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { map, Observable } from 'rxjs';
import { User } from '../../../../../auth/interfaces/user.interface';
import { AuthService } from '../../../../../auth/services/auth.service';
import { ValidatorService } from '../../../../../shared/services/validator.service';
import { EmailValidator } from '../../../../../shared/validators/email-validator.service';
import { Post } from '../../../../interfaces/post.interface';
import { ModalUploadService } from '../../../../services/modalUpload.service';
import { PostService } from '../../../../services/post.service';


@Component({
  selector: 'app-profile-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
  ],
  templateUrl: './profileForm.component.html',
  styleUrl: './profileForm.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProfileFormComponent {

  // @ViewChild('modal') public modal: ElementRef = {} as ElementRef


  private authService = inject(AuthService);
  private emailValidator = inject(EmailValidator)

  public profileForm: FormGroup = new FormGroup({
    userName: new FormControl<string>(this.currentUser.userName, [Validators.required]),
    email: new FormControl<string>(this.currentUser.email, [Validators.required], [this.emailValidator.validate.bind(this.emailValidator)]),
    file: new FormControl<File | null>(null),
  });

  public modalUploadService = inject(ModalUploadService);
  private validatorService = inject(ValidatorService);
  private postService = inject(PostService);
  private toastr = inject(ToastrService);

  public imgToUpload = signal<FileList | null>(null)
  public imgTemp = signal<any>(null);
  public loading = signal(false);

  currentUserPostsCount = computed(() => this.postService.allPosts()
    .filter((post: Post) => post.userId === this.currentUser.id).length)


  constructor() {
    this.postService.getAllPost()
      .subscribe()
  }

  get currentUser() {
    return this.authService.user()!
  }

  onUploadImage(event: any) {

    this.imgToUpload.set(event.target.files);

    if (this.imgToUpload()) {
      const file: File | null = this.imgToUpload()!.item(0)
      if (!file) {
        this.imgTemp.set(null);
        return;
      }
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = () => {
        this.imgTemp.set(reader.result);
      }
    }
  }

  onUpdateProfile(): void {

    if (!this.imgToUpload()) {
      this.updateUser()
      return;
    }
    const file: File | null = this.imgToUpload()!.item(0)
    this.imgToUpload.set(null);

    if (file && file.size > 1000000) {
      this.swalError('Max file size: 1MB')
      return;
    }
    if (file) {
      this.loading.set(true);
      const { userName, email } = this.profileForm.value
      const { id, password, last_login, avatar } = this.currentUser
      const user = { id, userName, email, password, avatar, last_login } as User
      this.authService.changeAvatar(user, file)!.subscribe({
        error: (message: string) => {
          this.onCloseModal();
          this.swalError('Unable to update profile. Try again!')
        },
        complete: async () => {
          this.swalSuccess('Profile Saved!');
          this.loading.set(false);
          this.onCloseModal();
        },
      })

    }
  }

  updateUser() {
    const { userName, email } = this.profileForm.value
    const { id, password, last_login, avatar } = this.currentUser
    const user = { id, userName, email, password, avatar, last_login } as User
    this.authService.updateCurrentUser(user, true)
      .subscribe(() => {
        this.swalSuccess('Profile Saved!');
        this.loading.set(false);
        this.onCloseModal();
      })
  }

  getPostCount(): Observable<number> {
    return this.postService.getAllPost().pipe(
      map((posts: Post[]) => posts.filter((post: Post) => post.userId === this.currentUser.id).length)
    )
  }

  isNotValidField(field: string): boolean | null {
    return this.validatorService.isNotValidField(this.profileForm, field);
  }

  getFieldError(field: string): string | null {
    return this.validatorService.getFieldError(this.profileForm, field);
  }


  onCloseModal() {
    this.imgTemp.set(null);
    this.modalUploadService.closeModal();
  }


  swalSuccess(message: string) {
    return this.toastr.success( message, '',  {
      closeButton: true,

    });
  }

  swalError(message: string) {
    return this.toastr.error( message, '',  {
      closeButton: true,

    });
  }


}
