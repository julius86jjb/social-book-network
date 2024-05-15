import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ValidatorService } from '../../../shared/services/validator.service';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';
import Swal from 'sweetalert2'


@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ],
  templateUrl: './loginPage.component.html',
  styleUrl: './loginPage.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPageComponent {

  private fb: FormBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private validatorService = inject(ValidatorService);



  public myForm = this.fb.group({
    email: ['user1@email.com', [Validators.required, Validators.email]],
    password: ['123456', [Validators.required, Validators.minLength(6)]]
  })


  isNotValidField(field: string): boolean | null {
    return this.validatorService.isNotValidField(this.myForm, field);
  }

  getFieldError(field: string): string | null {
    return this.validatorService.getFieldError(this.myForm, field);
  }

  onLogin() {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    };

    const { email, password } = this.myForm.value;
    return this.authService.login(email!, password!)
      .subscribe({
        next: (user: User | undefined) => {
          if (!user){
            Swal.fire('Error', 'Wrong Credentials', 'error');
            return;
          }
          this.authService.updateCurrentUser({
            ...user,
            last_login: new Date()
          }).subscribe();

          this.router.navigateByUrl('/dashboard')
        },
        error: () => Swal.fire('Error', 'Internal Server Error', 'error')
      })
  }
}
