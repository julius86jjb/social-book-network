import { Directive, HostBinding, HostListener } from '@angular/core';

@Directive({
  selector: '[appUnderline]',
  standalone: true,
})
export class UnderlineDirective {
  @HostBinding('style.text-decoration') text!: string;
  @HostListener('mouseover')
  onMouseOver() {
    this.text = 'underline';
  }

  @HostListener('mouseout')
  onMouseOut() {
    this.text = 'none';
  }
}
