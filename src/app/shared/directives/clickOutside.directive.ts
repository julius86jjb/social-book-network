import { Directive, ElementRef, EventEmitter, HostListener, inject, Output } from '@angular/core';
import { ModalUploadService } from '../../wall/services/modalUpload.service';

@Directive({
  selector: '[appClickOutside]',
  standalone: true,
})
export class ClickOutsideDirective {

  elemRef = inject(ElementRef)
  modalUploadService = inject(ModalUploadService)
  @Output()
  clickOutside: EventEmitter<Event> = new EventEmitter<Event>();

  @HostListener('document:click', ['$event'])
  onClick(event: any) {
    if (!this.elemRef.nativeElement.contains(event.target) ) {
      // Clicked Outside
      this.clickOutside.emit(event);
    }
  }

  constructor() {
  }
}
