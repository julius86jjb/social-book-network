import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild, inject, signal, AfterViewInit, AfterViewChecked, OnInit, AfterContentInit, AfterContentChecked } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import Swal, { SweetAlertResult } from 'sweetalert2'

import { AuthService } from '../../../auth/services/auth.service';
import { ModalUploadService, ModalType } from '../../services/modalUpload.service';
import { PostService } from '../../services/post.service';
import { Comment, Post } from '../../interfaces/post.interface';
import { ValidatorService } from '../../../shared/services/validator.service';
import { EmojiComponent } from '../emoji/emoji.component';
import { User } from '../../../auth/interfaces/user.interface';
import { finalize } from 'rxjs';
import { EmailValidator } from '../../../shared/validators/email-validator.service';

@Component({
  selector: 'wall-modal-upload',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    EmojiComponent,
  ],
  templateUrl: './modalUpload.component.html',
  styleUrl: './modalUpload.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalUploadComponent {
  @ViewChild('modalDiv') public modalDiv: ElementRef<HTMLDivElement> = {} as ElementRef;
  @ViewChild('txtMessage') public textMessage: ElementRef<HTMLInputElement> = {} as ElementRef

  private renderer = inject(Renderer2);
  public modalUploadService = inject(ModalUploadService);
  public authService = inject(AuthService);
  public postService = inject(PostService);
  public validatorService = inject(ValidatorService);
  private emailValidator = inject(EmailValidator)

  public imgToUpload = signal<FileList | null>(null)
  public imgTemp = signal<any>(null);
  public loading = signal(false);
  public postEdit = this.modalUploadService.post
  public removeEditPic = signal(false);

  public isEmojiPickerVisible: boolean = false;
  public comment: string = '';

  public postForm: FormGroup = new FormGroup({
    text: new FormControl<string>(''),
    file: new FormControl<File | null>(null),
  }, {
    validators: [
      this.validatorService.requiredOneControl('text', 'file')
    ]
  });

  public profileForm: FormGroup = new FormGroup({
    userName: new FormControl<string>(this.currentUser.userName, [Validators.required]),
    email: new FormControl<string>(this.currentUser.email, [Validators.required], [this.emailValidator.validate.bind(this.emailValidator)]),
    file: new FormControl<File | null>(null),

  });


  get currentUser() {
    return this.authService.user()!
  }

  get post(): Post {
    const message = this.postForm.controls['text'].value

    const post = {
      userId: this.currentUser.id,
      date: new Date(),
      likes: [],
      comments: [],
      message: message,
    } as unknown as Post

    return post
  }

  closeModal() {

    this.imgTemp.set(null);
    this.renderer.addClass(this.modalDiv.nativeElement, 'fadeOut');
    setTimeout(() => {
      this.modalUploadService.closeModal();
    }, 500);
    this.postForm.patchValue({
      file: null,
      text: ''
    });
  }

  onUploadImage(event: any) {

    this.imgToUpload.set(event.target.files);

    if (this.imgToUpload()) {
      const file: File | null = this.imgToUpload()!.item(0)


      if (!file) {
        this.postForm.patchValue({
          file: null
        })

        this.imgTemp.set(null);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = () => {
        this.imgTemp.set(reader.result);

        this.postForm.patchValue({
          file: reader.result
        })

      }
    }
  }

  onUpdateProfile(): void {

    if (!this.imgToUpload()) {
      console.log('entra sin img');

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
          this.closeModal();
          this.swalError('Unable to update profile. Try again!')
        },
        complete: async () => {
          this.swalSuccess('Profile Saved!');
          this.loading.set(false);
          this.closeModal();
        },
      })

    }
  }

  updateUser() {
    const { userName, email } = this.profileForm.value
    const { id, password, last_login, avatar } = this.currentUser
    const user = { id, userName, email, password, avatar, last_login } as User
    return this.authService.updateCurrentUser(user)
      .subscribe(() => {
        this.swalSuccess('Profile Saved!');
        this.loading.set(false);
        this.closeModal();
      })
  }


  onCreatePost() {

    if (this.postForm.invalid) {
      Swal.fire('At least one field is required', 'Please write a message or select an image.', 'error')
      return;
    }

    const file = this.checkFormAndFile()
    if (file === undefined) return;


    this.postService.createPost(this.post, file)
      .pipe(
        finalize(() => {
          this.closeModal();
          this.loading.set(false);
        }))
      .subscribe({
        error: () => {
          this.swalError('Unable to create post. Try again!');
        },
        complete: () => {
          this.swalSuccess('New post published!');
        },
      })
  }


  onEditPost() {

    const file = this.checkFormAndFile()
    if (file === undefined) return;
    console.log(this.postEdit()?.message)
    const postEdited: Post = {
      ...this.postEdit()!,
      message: this.postForm.controls['text'].dirty ? this.postForm.controls['text'].value : this.postEdit()!.message,
      imageUrl: this.removeEditPic() ? undefined : this.postEdit()!.imageUrl
    }

    console.log(postEdited);
    console.log(file);


    this.postService.editPost(postEdited, file).subscribe({
      error: () => {
        this.closeModal();
        this.swalError('Unable to edit post. Try again!'),
          this.loading.set(false);
      },
      complete: () => {
        this.closeModal();
        this.swalSuccess('Post succefully updated!');
        this.loading.set(false);

      },
    })
  }

  checkFormAndFile(): File | null | undefined {


    const file: File | null = this.imgToUpload()?.item(0) ?? null

    if (file && file.size > 1000000) {
      this.swalError('Max file size: 1MB')
      return;
    }
    this.imgToUpload.set(null)
    // this.loading.set(true);
    return file
  }

  onRemoveEditPic() {
    this.removeEditPic.set(true)
  }

  onRemovePic() {


    this.imgTemp.set(null)
    this.imgToUpload.set(null)

    this.postForm.patchValue({
      file: null
    })
    this.modalUploadService.removeImage();
  }

  swalSuccess(message: string): Promise<SweetAlertResult> {
    return Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: false,
      timer: 1500
    });
  }

  swalError(message: string) {
    return Swal.fire({
      position: 'top-end',
      icon: 'error',
      title: message,
      showConfirmButton: false,
      timer: 5000
    })
  }

  public addEmojiToInput(event: any): void {
    const emoji = event.emoji.native
    this.textMessage.nativeElement.value += emoji;
    this.postForm.patchValue({
      text: this.postForm.controls['text'].value + ' ' + emoji
    })
  }

  public addEmoji(event: { emoji: { native: any; }; }) {
    this.comment = `${this.comment}${event.emoji.native}`;
    this.isEmojiPickerVisible = false;
  }

  isNotValidField(field: string): boolean | null {
    return this.validatorService.isNotValidField(this.profileForm, field);
  }

  getFieldError(field: string): string | null {
    return this.validatorService.getFieldError(this.profileForm, field);
  }

}
