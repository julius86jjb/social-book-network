import { Pipe, inject, type PipeTransform } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../auth/interfaces/user.interface';
import { Observable, map } from 'rxjs';
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

