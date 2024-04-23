import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

import Swal from 'sweetalert2'

import { AuthService } from '../../services/auth.service';
import { User } from '../../interfaces/user.interface';
import { ValidatorService } from '../../../shared/services/validator.service';

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

  public myForm = this.fb.group({
    userName: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(20)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  })


  isNotValidField(field: string): boolean | null {
    return this.validatorService.isNotValidField(this.myForm, field);
  }

  getFieldError(field: string): string | null{
    return this.validatorService.getFieldError(this.myForm, field);
  }

  onRegister() {
    if (this.myForm.invalid) {
      this.myForm.markAllAsTouched();
      return;
    };

    const {userName, email, password} = this.myForm.value as User;

    const user = {
      userName,
      email,
      password,
      // last_login: new Date().getTime(),
      avatar: '../../../../assets/images/default-avatar.jpg'
    } as User

    this.authService.register(user)
      .subscribe(user => {
        this.router.navigateByUrl('/login')
        Swal.fire({
          position: "center",
          icon: "success",
          title: "User succefully created",
          showConfirmButton: false,
          timer: 1500
        });
      })
  }

 }


