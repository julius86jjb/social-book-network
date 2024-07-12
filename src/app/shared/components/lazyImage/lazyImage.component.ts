import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, input, signal } from '@angular/core';

export enum LazyImageType {
  postImage = 'postImage',
  avatar = 'avatar',
  notification = 'notification',
  userModal = 'userModal'
}

@Component({
  selector: 'shared-lazy-image',
  standalone: true,
  imports: [
    CommonModule,
  ],
  templateUrl: './lazyImage.component.html',
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LazyImageComponent {

  public type = input.required<LazyImageType>();

  public url = input.required<string>();

  public hasLoaded = signal<boolean>(false)

  onLoad() {
      this.hasLoaded.set(true);
  }

}
