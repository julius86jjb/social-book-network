import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, type OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { PostService } from '../../../../services/post.service';

@Component({
  selector: 'app-select-posts',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule
  ],
  templateUrl: './selectPosts.component.html',
  styleUrl: './selectPosts.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SelectPostsComponent implements OnInit {

  @Output() public postsTypeChange = new EventEmitter<string>()

  private fb = inject(FormBuilder)
  private postService = inject(PostService)


  public postTypeForm: FormGroup = this.fb.group({
    postsType: ['following', Validators.required]
  })

  ngOnInit(): void {
    this.onPostsTypeChange()
  }


  onPostsTypeChange() {
    this.postTypeForm.get('postsType')!.valueChanges
      .subscribe((type) => this.postsTypeChange.emit(type))
  }
}
