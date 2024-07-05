import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, Renderer2, ViewChild, effect, inject, input, signal } from '@angular/core';
import { ModalUploadService } from '../../../../services/modalUpload.service';
import { FormGroup, FormControl, ReactiveFormsModule } from '@angular/forms';
import { ValidatorService } from '../../../../../shared/services/validator.service';
import Swal, { SweetAlertResult } from 'sweetalert2'
import { PostService } from '../../../../services/post.service';
import { finalize } from 'rxjs';
import { AuthService } from '../../../../../auth/services/auth.service';
import { EmojiComponent } from '../../../../components/emoji/emoji.component';
import { Post } from '../../../../interfaces/post.interface';
import { NotificationService } from '../../../../services/notification.service';
import { Notification, NotificationType } from '../../../../interfaces/notification.interface';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EmojiComponent
  ],
  templateUrl: './postForm.component.html',
  styleUrl: './postForm.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostFormComponent {

  @ViewChild('txtMessage') public textMessage: ElementRef<HTMLInputElement> = {} as ElementRef


  public modalUploadService = inject(ModalUploadService);
  public authService = inject(AuthService)
  public validatorService = inject(ValidatorService);
  public postService = inject(PostService);
  public notificationService = inject(NotificationService);

  public postData = input<any | null>(null)

  public loading = signal(false);
  public isEmojiPickerVisible: boolean = false;
  public imgToUpload = signal<FileList | null>(null)
  public imgTemp = signal<any>(null);
  public uploadPercentage = signal<number | undefined>(0);
  public isUploading = signal<boolean>(false);


  public postForm: FormGroup = new FormGroup({
    text: new FormControl<string>(''),
    image: new FormControl<File | null>(null),
  }, {
    validators: [
      this.validatorService.requiredOneControl('text', 'image')
    ]
  });

  public afterChangeData = effect(async () => {
    if (!this.postData()) {
      this.postForm.reset();
      return;
    }
    this.imgTemp.set(this.postData().imageUrl);
    const imageFile = this.postData().imageUrl ? await this.urlImgToFile(this.postData().imageUrl) : null
    this.postForm.patchValue({
      text: this.postData().message,
      image: imageFile
    });
  }, { allowSignalWrites: true })



  get currentUser() {
    return this.authService.user()!
  }

  get modalType() {
    return this.modalUploadService.modalType();
  }


  urlImgToFile = async (url: string) => {
    var res = await fetch(url);
    var blob = await res.blob();
    const file = new File([blob], 'image.png', { type: blob.type })
    return file;
  };


  onSubmit() {
    if (this.postForm.invalid) {
      Swal.fire('At least one field is required', 'Please write a message or select an image.', 'error')
      return;
    }
    if (this.postData()) {
      return this.editPost()
    }
    this.createPost()
  }

  createPost() {
    const newPost: any = {
      userId: this.currentUser.id,
      date: new Date(),
      likes: [],
      comments: [],
      message: this.postForm.controls['text'].value
    }

    this.postService.createPost(newPost, this.postForm.controls['image'].value)
      .subscribe({
        error: () => {
          this.swalError('Unable to create post. Try again!');
        },
        next: (uploadPercentage: number | undefined) => {
          if (uploadPercentage === undefined) {
            this.onCloseModal();
            this.loading.set(false);
            this.swalError('Error uploading file');
            return;
          }
          this.isUploading.set(true);
          this.uploadPercentage.set(uploadPercentage)

        },
        complete: () => {
          setTimeout(() => {
            this.onCloseModal();
            this.loading.set(false);
            this.swalSuccess('New post published!');
            this.isUploading.set(false);
          }, 1000);

        },
      })
  }

  editPost() {
    const { id, userId, date, likes, comments } = this.postData()
    const editedPost: Post = {
      id,
      userId,
      date,
      likes,
      comments,
      message: this.postForm.controls['text'].value
    }
    console.log(this.postForm.controls['image'].value);

    this.postService.editPost(editedPost, this.postForm.controls['image'].value)
    .subscribe({
      error: () => {
        this.swalError('Unable to edit post. Try again!');
      },
      next: (uploadPercentage: number | undefined) => {
        if (uploadPercentage === undefined) {
          this.onCloseModal();
          this.loading.set(false);
          this.swalError('Error uploading file');
          return;
        }
        this.isUploading.set(true);
        this.uploadPercentage.set(uploadPercentage)

      },
      complete: () => {
        setTimeout(() => {
          this.onCloseModal();
          this.loading.set(false);
          this.swalSuccess('Post successfully edited!');
          this.isUploading.set(false);
        }, 1000);

      },
    })
  }

  onRemovePic() {
    this.imgTemp.set(null)
    this.imgToUpload.set(null)

    this.modalUploadService.post.set({ ...this.modalUploadService.post()!, imageUrl: undefined })
    this.postForm.patchValue({
      file: null
    })
  }

  onCloseModal() {
    this.modalUploadService.closeModal();
    this.imgTemp.set(null);
    this.imgToUpload.set(null);
    this.postForm.reset();
  }


  onUploadImage(event: any) {

    this.imgToUpload.set(event.target.files);

    if (this.imgToUpload()) {
      const file: File | null = this.imgToUpload()!.item(0)
      this.postForm.patchValue({
        image: file
      })

      if (!file) {
        this.postForm.patchValue({
          image: null
        })

        this.imgTemp.set(null);
        this.imgToUpload.set(null)
        return;
      }

      if (file && file.size > 5000000) {
        this.swalError('Max file size: 5MB')
        return;
      }


      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = () => {
        this.imgTemp.set(reader.result);


      }
    }
  }

  swalSuccess(message: string): Promise<SweetAlertResult> {
    return Swal.fire({
      position: 'top-end',
      icon: 'success',
      title: message,
      showConfirmButton: true,
      timer: 2500
    });
  }

  swalError(message: string) {
    return Swal.fire({
      position: 'top-end',
      icon: 'error',
      title: message,
      showConfirmButton: true,
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
    // this.comment = `${this.comment}${event.emoji.native}`;
    // this.isEmojiPickerVisible = false;
  }



}
