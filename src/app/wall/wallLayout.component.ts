import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, Renderer2, ViewChild } from '@angular/core';
import { TopbarComponent } from "./components/topbar/topbar.component";
import { RouterModule } from '@angular/router';
import { ModalComponent } from './components/modal/modal.component';
import { PostService } from './services/post.service';
import { TopbarService } from './services/topbar.service';

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

  // @ViewChild(TopbarComponent)
  // topbarComponent!: TopbarComponent;

  private renderer = inject(Renderer2);
  private topbarService = inject(TopbarService);

  constructor() {

    // this.renderer.listen('window', 'click', (e: Event) => {
    //   if (!this.topbarComponent.toogleProfileButton.nativeElement.contains(e.target) &&
    //     !this.topbarComponent.toogleNotificationButton.nativeElement.contains(e.target)) {
    //       this.topbarService.showProfileMenu.set(false);
    //       this.topbarService.showNotificationMenu.set(false);
    //       }
    // });
  }

  public postService = inject(PostService)
 }
