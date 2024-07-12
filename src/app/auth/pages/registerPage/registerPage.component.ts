import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import Swal from 'sweetalert2'

import { AuthService } from '../../services/auth.service';
import { ValidatorService } from '../../../shared/services/validator.service';
import { EmailValidator } from '../../../shared/validators/email-validator.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
  ],
  templateUrl: './registerPage.component.html',
  styleUrl: './registerPage.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {

  private fb: FormBuilder = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private validatorService = inject(ValidatorService);
  private toastr = inject(ToastrService);

  public myForm = this.fb.group({
    userName: ['', [Validators.required, Validators.minLength(6)]],
    email: ['', [Validators.required, Validators.pattern(this.validatorService.emailPattern)], [new EmailValidator()]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })


  isNotValidField(field: string): boolean | null {
    return this.validatorService.isNotValidField(this.myForm, field);
  }

  getFieldError(field: string): string | null {
    return this.validatorService.getFieldError(this.myForm, field);
  }

  onRegister() {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    };

    const { userName, email, password } = this.myForm.value;

    const user = {
      userName,
      email,
      password,
      followers: [],
      following: [],
      // last_login: new Date().getTime(),
      avatar: '../../../../assets/images/default-avatar.jpg'
    }

    this.authService.register(user)
      .subscribe(user => {
        this.router.navigateByUrl('/login')


        this.toastr.success( 'User succefully created', '',  {
          closeButton: true,

        });
      })
  }

}


