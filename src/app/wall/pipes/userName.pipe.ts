import { Pipe, inject, type PipeTransform } from '@angular/core';
import { Observable, map } from 'rxjs';
import { User } from '../../auth/interfaces/user.interface';
import { UserService } from '../services/user.service';

@Pipe({
  name: 'userName',
  standalone: true,
})
export class UserNamePipe implements PipeTransform {

  private userService = inject(UserService)

  transform(id: string): Observable<string> {
    return this.userService.getUserById(id).pipe(
      map((user: User) => {
        return user.userName
      })
    )
  }

}

