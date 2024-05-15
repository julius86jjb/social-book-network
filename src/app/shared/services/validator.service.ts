import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ValidatorService {

  public emailPattern: string = "^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$";


  public isNotValidField(form: FormGroup, field: string): boolean | null {

    return form.controls[field].errors && form.controls[field].touched
  }

  getFieldError(form: FormGroup, field: string): string | null {
    if (!form.controls[field]) return null;

    const errors = form.controls[field].errors || {};

    if (Object.keys(errors).includes('pattern') && field === 'email') return `Incorrect email format`

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'This field is required'
        case 'email':
          return 'Invalid email format'
        case 'minlength':
          return `Enter a minimum of ${errors['minlength'].requiredLength} characters`
        case 'maxlength':
          return `Enter a maximum of ${errors['minlength'].requiredLength} characters`
        case 'emailTaken':
          return `This email has already been registered`

      }
    }
    return null;
  }

  public requiredOneControl(field1: string, field2: string) {

    return (formGroup: AbstractControl): ValidationErrors | null => {


      const fieldValue1 = formGroup.get(field1)?.value;
      const fieldValue2 = formGroup.get(field2)?.value;

      if (!fieldValue1 && !fieldValue2) {

        ValidatorService.addErrors({ atLeastOneControlRequired: true }, formGroup.get(field2)!)
        return {
          notEqual: true
        }
      }
      ValidatorService.removeErrors(['atLeastOneControlRequired'], formGroup.get(field2)!)
      return null;
    }
  }



  public static addErrors(errors: { [key: string]: any }, control: AbstractControl) {

    if (!control || !errors) {
      return;
    }
    control.setErrors({ ...control.errors, ...errors });
  }

  public static removeErrors(keys: string[], control: AbstractControl) {

    if (!control || !keys || keys.length === 0) {
      return;
    }

    const remainingErrors = keys.reduce((errors, key) => {
      delete errors[key];
      return errors;
    }, { ...control.errors });

    control.setErrors(remainingErrors);

    if (Object.keys(control.errors || {}).length === 0) {
      control.setErrors(null);
    }
  }

}
