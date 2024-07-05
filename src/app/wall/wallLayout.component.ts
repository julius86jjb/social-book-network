import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TopbarComponent } from "./components/topbar/topbar.component";
import { RouterModule } from '@angular/router';
import { ModalComponent } from './components/modal/modal.component';
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
        ModalComponent
    ]
})
export class WallLayoutComponent {
  public postService = inject(PostService)
 }
