import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { PickerComponent } from '@ctrl/ngx-emoji-mart';
@Component({
  selector: 'app-emoji',
  standalone: true,
  imports: [
    CommonModule,
    PickerComponent
  ],
  templateUrl: './emoji.component.html',
  styleUrl: './emoji.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmojiComponent {

  @Output() onSelectedEmoji = new EventEmitter<any>()

  showEmojiPicker = false;
  sets = [
    'native',
    'google',
    'twitter',
    'facebook',
    'emojione',
    'apple',
    'messenger'
  ]

  toggleEmojiPicker() {
    this.showEmojiPicker = !this.showEmojiPicker;
  }

  addEmoji(event: any) {
    this.onSelectedEmoji.emit(event);
    this.showEmojiPicker = false;
  }

}
