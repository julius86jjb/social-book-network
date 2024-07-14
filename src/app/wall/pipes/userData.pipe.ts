import { inject, Pipe, type PipeTransform } from '@angular/core';
import { map, Observable, of } from 'rxjs';
import { User } from '../../auth/interfaces/user.interface';
import { UserService } from '../services/user.service';

@Pipe({
  name: 'userData',
  standalone: true,
})
export class UserDataPipe implements PipeTransform {

  private userService = inject(UserService)

  transform(id: string, prop: string): Observable<string> {

    switch (prop) {
      case 'avatar':
        return this.userService.getUserById(id).pipe(
          map((user: User) => user.avatar),
        )

      case 'name':
        return this.userService.getUserById(id).pipe(
          map((user: User) => user.userName),
        )

      default:
        return of('')
        break;
    }

  }

}
