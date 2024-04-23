import { Pipe, inject, type PipeTransform } from '@angular/core';
import { AuthService } from '../../auth/services/auth.service';
import { User } from '../../auth/interfaces/user.interface';
import { Observable, map } from 'rxjs';

@Pipe({
  name: 'userName',
  standalone: true,
})
export class UserNamePipe implements PipeTransform {

  private authService = inject(AuthService)

  transform(id: string): Observable<string> {

    return this.authService.getUserById(id).pipe(
      map((user: User) => {
        return user.userName
      })
    )
  }

}

