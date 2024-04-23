import { Injectable } from '@angular/core';
import { AbstractControl, FormGroup, ValidationErrors } from '@angular/forms';

@Injectable({ providedIn: 'root' })
export class ValidatorService {


  public isNotValidField(form: FormGroup, field: string): boolean | null {

    return form.controls[field].errors && form.controls[field].touched
  }

  getFieldError(form: FormGroup, field: string): string | null {
    if (!form.controls[field]) return null;

    const errors = form.controls[field].errors || {};

    for (const key of Object.keys(errors)) {
      switch (key) {
        case 'required':
          return 'Este campo es requerido'
        case 'email':
          return 'Formato de email inválido'
        case 'minlength':
          return `Introduce un mínimo de ${errors['minlength'].requiredLength} caracteres`
        case 'maxlength':
          return `Introduce un máximo de ${errors['minlength'].requiredLength} caracteres`

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
