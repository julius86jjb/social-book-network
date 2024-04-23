import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ChangeDetectionStrategy, Component, ElementRef, EventEmitter, Input, Output, Renderer2, ViewChild, inject, signal } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import Swal, { SweetAlertResult } from 'sweetalert2'

import { AuthService } from '../../../auth/services/auth.service';
import { ModalUploadService, ModalType } from '../../services/modalUpload.service';
import { PostService } from '../../services/post.service';
import { Comment, Post, UserId } from '../../interfaces/post.interface';
import { ValidatorService } from '../../../shared/services/validator.service';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
import { User } from '../../../auth/interfaces/user.interface';
import { EmojiComponent } from '../emoji/emoji.component';

@Component({
  selector: 'wall-modal-upload',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    EmojiComponent
  ],
  templateUrl: './modalUpload.component.html',
  styleUrl: './modalUpload.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ModalUploadComponent {

  @Input() public typeModal: ModalType = ModalType.newpost;
  @ViewChild('modalDiv') public modalDiv: ElementRef<HTMLDivElement> = {} as ElementRef;
  @ViewChild('txtMessage') public textMessage: ElementRef<HTMLInputElement> = {} as ElementRef;
  @Output() changeAvatar = new EventEmitter();

  private renderer = inject(Renderer2);
  public modalUploadService = inject(ModalUploadService);
  public authService = inject(AuthService);
  public postService = inject(PostService);
  public validatorService = inject(ValidatorService);
  public fb = inject(FormBuilder);

  public imgToUpload = signal<FileList | null>(null)
  public imgTemp = signal<any>(null);
  public loading = signal(false);

  public isEmojiPickerVisible: boolean = false;
  public comment: string = '';

  public addEmoji(event: { emoji: { native: any; }; }) {
    this.comment = `${this.comment}${event.emoji.native}`;
    this.isEmojiPickerVisible = false;
  }


  public newPostForm: FormGroup = new FormGroup({
    text: new FormControl<string>(''),
    file: new FormControl<File | null>(null),
  }, {
    validators: [
      this.validatorService.requiredOneControl('text', 'file')
    ]
  });




  get post(): Post {
    const message = this.newPostForm.controls['text'].value

    const post = {
      userId: this.authService.user()!.id as UserId,
      date: new Date(),
      likes: [] as UserId[],
      comments: [] as Comment[],
      message: message,
    } as Post

    return post
  }



  closeModal() {
    this.imgTemp.set(null);
    this.renderer.addClass(this.modalDiv.nativeElement, 'fadeOut');
    setTimeout(() => {
      this.modalUploadService.closeModal();
    }, 500);
    this.newPostForm.patchValue({
      file: null,
      text: ''
    });
  }

  onUploadImage(event: any, post: boolean) {

    this.imgToUpload.set(event.target.files);

    if (this.imgToUpload()) {
      const file: File | null = this.imgToUpload()!.item(0)


      if (!file) {
        if (post) {
          this.newPostForm.patchValue({
            file: null
          })
        }
        this.imgTemp.set(null);
        return;
      }

      const reader = new FileReader();
      reader.readAsDataURL(file);

      reader.onloadend = () => {
        this.imgTemp.set(reader.result);
        if (post) {
          this.newPostForm.patchValue({
            file: reader.result
          })
        }
      }

    }

  }


   onChangeAvatar(): void {

    if (!this.imgToUpload()) return;
    const file: File | null = this.imgToUpload()!.item(0)
    this.imgToUpload.set(null);

    if(file && file.size > 1000000) {
      this.swalError('Max file size: 1MB')
      return;
    }

    if (file) {

      this.loading.set(true);
      this.authService.changeAvatar(file)!.subscribe({

        error: (message: string) => {
          this.closeModal();
          this.swalError('Unable to change Avatar. Try again!')
        },
        complete: () => {
          this.loading.set(false);
          this.closeModal();
          this.swalSuccess('New avatar saved!');
        },
      })

    }
  }


  onCreatePost() {

    if (this.newPostForm.invalid) {
      this.newPostForm.markAllAsTouched();
      Swal.fire('At least one field is required', 'Please write a message or select an image.', 'error')
      return;
    }

    const file: File | null = this.imgToUpload()?.item(0) ?? null

    if(file && file.size > 1000000) {
      this.swalError('Max file size: 1MB')
      return;
    }

    this.imgToUpload.set(null)
    this.loading.set(true);
    this.postService.createPost(this.post, file).subscribe({
      error: () => {
        this.closeModal();
        this.swalError('Unable to create post. Try again!')
      },
      complete: () => {
        this.closeModal();
        this.swalSuccess('New post published!');
        this.loading.set(false);

      },
    })
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
    this.newPostForm.patchValue({
      text: this.newPostForm.controls['text'].value + ' ' + emoji
    })
  }

}
