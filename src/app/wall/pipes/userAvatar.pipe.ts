import { Pipe, inject, type PipeTransform } from '@angular/core';
import { Observable, delay, map, tap } from 'rxjs';
import { User } from '../../auth/interfaces/user.interface';
import { AuthService } from '../../auth/services/auth.service';
import { PostService } from '../services/post.service';

@Pipe({
  name: 'userAvatar',
  standalone: true,
})
export class UserAvatarPipe implements PipeTransform {

  private authService = inject(AuthService)

  transform(id: string) {
    return this.authService.getUserById(id).pipe(
      map((user: User) => user.avatar),
    )
  }

}
