import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, ElementRef, ViewChild, effect, inject, input, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../../../auth/services/auth.service';
import { ValidatorService } from '../../../../../shared/services/validator.service';
import { EmojiComponent } from '../../../../components/emoji/emoji.component';
import { NotificationType } from '../../../../interfaces/notification.interface';
import { Post } from '../../../../interfaces/post.interface';
import { ModalUploadService } from '../../../../services/modalUpload.service';
import { NotificationService } from '../../../../services/notification.service';
import { PostService } from '../../../../services/post.service';

@Component({
  selector: 'app-post-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    EmojiComponent,

  ],
  templateUrl: './postForm.component.html',
  styleUrl: './postForm.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PostFormComponent {

  @ViewChild('txtMessage') public textMessage: ElementRef<HTMLInputElement> = {} as ElementRef
  // @ViewChild('modal') public modal: ElementRef = {} as ElementRef




  private notificationService = inject(NotificationService);
  private validatorService = inject(ValidatorService);
  private toastr = inject(ToastrService);
  public postService = inject(PostService);
  public modalUploadService = inject(ModalUploadService);
  public authService = inject(AuthService)


  public postData = input<any | null>(null)
  public loading = signal(false);
  public isEmojiPickerVisible: boolean = false;
  public imgToUpload = signal<FileList | null>(null)
  public imgTemp = signal<any>(null);
  public uploadPercentage = signal<number | undefined>(0);



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


  constructor() {

  }


  get currentUser() {
    return this.authService.user()!
  }

  get modalType() {
    return this.modalUploadService.modalType();
  }


  async urlImgToFile(url: string) {
    var res = await fetch(url);
    var blob = await res.blob();
    const file = new File([blob], 'image.png', { type: blob.type })
    return file;
  }


  onSubmit() {
    if (this.postForm.invalid) {
      this.toastr.error(  'Please write a message or select an image', 'At least one field is required',  {
        closeButton: true,
      });
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

          this.uploadPercentage.set(uploadPercentage)

        },
        complete: () => {
          this.currentUser.followers
            .forEach(followerId =>
              this.notificationService.createNotification(followerId, NotificationType.newPost, newPost.message || '')
                .subscribe()
            );

            this.onCloseModal();
            this.loading.set(false);
            this.swalSuccess('New post published!');


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

          this.uploadPercentage.set(uploadPercentage)

        },
        complete: () => {
            this.onCloseModal();
            this.loading.set(false);
            this.swalSuccess('Post successfully edited!');

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
    if (this.modalUploadService.visible()) {
      console.log('onCloseModal');
      this.modalUploadService.closeModal();
      this.imgTemp.set(null);
      this.imgToUpload.set(null);
      this.postForm.reset();
    }
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
