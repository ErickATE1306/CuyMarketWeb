import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class CustomValidators {
  // Validar DNI peruano (8 dígitos)
  static dni(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const dniPattern = /^\d{8}$/;
      const valid = dniPattern.test(control.value);

      return valid ? null : { dni: { value: control.value } };
    };
  }

  // Validar teléfono celular peruano (9 dígitos, empieza con 9)
  static phoneNumber(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const phonePattern = /^9\d{8}$/;
      const valid = phonePattern.test(control.value);

      return valid ? null : { phoneNumber: { value: control.value } };
    };
  }

  // Validar RUC peruano (11 dígitos)
  static ruc(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const rucPattern = /^\d{11}$/;
      const valid = rucPattern.test(control.value);

      return valid ? null : { ruc: { value: control.value } };
    };
  }

  // Validar número de tarjeta con algoritmo de Luhn
  static creditCard(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const cardNumber = control.value.replace(/\s/g, '');

      // Debe tener entre 13 y 19 dígitos
      if (!/^\d{13,19}$/.test(cardNumber)) {
        return { creditCard: { value: control.value } };
      }

      // Algoritmo de Luhn
      let sum = 0;
      let isEven = false;

      for (let i = cardNumber.length - 1; i >= 0; i--) {
        let digit = parseInt(cardNumber.charAt(i), 10);

        if (isEven) {
          digit *= 2;
          if (digit > 9) {
            digit -= 9;
          }
        }

        sum += digit;
        isEven = !isEven;
      }

      const valid = sum % 10 === 0;
      return valid ? null : { creditCard: { value: control.value } };
    };
  }

  // Validar fuerza de contraseña
  static passwordStrength(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const password = control.value;
      const errors: any = {};

      // Mínimo 8 caracteres
      if (password.length < 8) {
        errors.minLength = true;
      }

      // Al menos una mayúscula
      if (!/[A-Z]/.test(password)) {
        errors.uppercase = true;
      }

      // Al menos una minúscula
      if (!/[a-z]/.test(password)) {
        errors.lowercase = true;
      }

      // Al menos un número
      if (!/\d/.test(password)) {
        errors.number = true;
      }

      // Al menos un carácter especial
      // if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      //   errors.special = true;
      // }

      return Object.keys(errors).length > 0 ? { passwordStrength: errors } : null;
    };
  }

  // Validar que dos campos coincidan (para confirmar contraseña)
  static mustMatch(controlName: string, matchingControlName: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(controlName);
      const matchingControl = formGroup.get(matchingControlName);

      if (!control || !matchingControl) {
        return null;
      }

      // Si el control de coincidencia ya tiene un error, no lo sobrescribimos
      if (matchingControl.errors && !matchingControl.errors['mustMatch']) {
        return null;
      }

      // Verificar si los valores coinciden
      if (control.value !== matchingControl.value) {
        matchingControl.setErrors({ mustMatch: true });
        return { mustMatch: true };
      } else {
        matchingControl.setErrors(null);
        return null;
      }
    };
  }

  // Validar edad mínima
  static minAge(minAge: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const birthDate = new Date(control.value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      return age >= minAge ? null : { minAge: { requiredAge: minAge, actualAge: age } };
    };
  }

  // Validar que la fecha no sea en el pasado
  static futureDate(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const selectedDate = new Date(control.value);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      return selectedDate >= today ? null : { futureDate: true };
    };
  }

  // Validar formato de email institucional
  static institutionalEmail(domain: string): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const emailPattern = new RegExp(`^[a-zA-Z0-9._%+-]+@${domain}$`);
      const valid = emailPattern.test(control.value);

      return valid ? null : { institutionalEmail: { requiredDomain: domain } };
    };
  }
}
