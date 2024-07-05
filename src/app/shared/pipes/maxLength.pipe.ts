import { Pipe, type PipeTransform } from '@angular/core';

@Pipe({
  name: 'maxLength',
  standalone: true,
})
export class MaxLengthPipe implements PipeTransform {

  transform(value: string, limit: number){
    if (value.length > limit) return value.substring(0, limit) + '...';
      else return value;
}

}
