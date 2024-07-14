import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, inject, output, signal, type OnInit } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { PostService } from '../../../../services/post.service';

@Component({
  selector: 'app-select-posts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule
  ],
  templateUrl: './selectPosts.component.html',
  styleUrl: './selectPosts.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPostsComponent implements OnInit {

  // @Output() public postsTypeChange = new EventEmitter<string>()
  public postsTypeProcess = output<string>()

  private fb = inject(FormBuilder)
  private postService = inject(PostService)

  public postType = signal('following')

  // public postTypeForm: FormGroup = this.fb.group({
  //   postsType: ['following', Validators.required]
  // })

  ngOnInit(): void {
    // this.onPostsTypeChange()
  }

  postTypeEff = effect(() => {
    this.postsTypeProcess.emit(this.postType())
  })

  // onPostsTypeChange() {
  //   this.postTypeForm.get('postsType')!.valueChanges
  //     .subscribe((type) => this.postsTypeProcess.emit(type))
  // }
}
