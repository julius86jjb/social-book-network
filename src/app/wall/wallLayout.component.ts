import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TopbarComponent } from "./components/topbar/topbar.component";
import { RouterModule } from '@angular/router';
import { ModalUploadComponent } from './components/modalUpload/modalUpload.component';
import { PostService } from './services/post.service';

@Component({
    selector: 'app-wall-layout',
    standalone: true,
    templateUrl: './wallLayout.component.html',
    styles: `
    :host {
      display: block;
    }
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [
        CommonModule,
        TopbarComponent,
        RouterModule,
        ModalUploadComponent
    ]
})
export class WallLayoutComponent {
  public postService = inject(PostService)
 }
