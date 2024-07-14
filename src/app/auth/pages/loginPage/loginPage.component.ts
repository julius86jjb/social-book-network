import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ValidatorService } from '../../../shared/services/validator.service';
import { User } from '../../interfaces/user.interface';
import { AuthService } from '../../services/auth.service';


@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
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
  private toastr = inject(ToastrService);



  public myForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
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
          if (!user) {
            this.toastr.error( 'Wrong Credentials','Error', {
              closeButton: true,
            })

            return;
          }
          this.authService.updateCurrentUser({
            ...user,
            last_login: new Date()
          }, false).subscribe();

          this.router.navigateByUrl('/dashboard')
        },
        error: () => this.toastr.error('Internal Server Error', 'Error', {
          closeButton: true,
        })
      })
  }
}
