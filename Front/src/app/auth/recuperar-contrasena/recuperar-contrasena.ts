import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StorageService } from '../../compartido/servicios/storage.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { CustomValidators } from '../../compartido/validadores/custom-validators';

interface ResetCode {
  email: string;
  code: string;
  expiresAt: Date;
}

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-contrasena.html',
  styleUrl: './recuperar-contrasena.scss'
})
export class RecuperarContrasenaComponent {
  step: 'email' | 'code' | 'reset' = 'email';
  emailForm: FormGroup;
  codeForm: FormGroup;
  resetForm: FormGroup;
  isLoading = false;
  currentEmail = '';
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private storage: StorageService,
    private toast: ToastService
  ) {
    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.codeForm = this.fb.group({
      digit1: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit2: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit3: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit4: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit5: ['', [Validators.required, Validators.pattern(/^\d$/)]],
      digit6: ['', [Validators.required, Validators.pattern(/^\d$/)]]
    });

    this.resetForm = this.fb.group({
      password: ['', [Validators.required, CustomValidators.passwordStrength()]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: CustomValidators.mustMatch('password', 'confirmPassword') });
  }

  onEmailSubmit() {
    if (this.emailForm.invalid) return;

    this.isLoading = true;
    const email = this.emailForm.value.email;

    // Verificar si el email existe (simulación)
    const users = this.storage.get('users') || [];
    const userExists = users.some((u: any) => u.email === email);

    setTimeout(() => {
      if (userExists) {
        // Generar código de 6 dígitos
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const resetData: ResetCode = {
          email,
          code,
          expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutos
        };

        this.storage.set('resetCode', resetData);
        this.currentEmail = email;
        this.step = 'code';
        this.toast.show('success', `Código enviado a ${email}`);
        console.log('Código de recuperación:', code); // En producción se enviaría por email
      } else {
        this.toast.show('error', 'No existe una cuenta con este email');
      }
      this.isLoading = false;
    }, 1500);
  }

  onCodeSubmit() {
    if (this.codeForm.invalid) return;

    const enteredCode = Object.values(this.codeForm.value).join('');
    const savedData: ResetCode = this.storage.get('resetCode');

    if (!savedData) {
      this.toast.show('error', 'Código expirado. Solicita uno nuevo');
      this.step = 'email';
      return;
    }

    // Verificar expiración
    if (new Date() > new Date(savedData.expiresAt)) {
      this.toast.show('error', 'Código expirado. Solicita uno nuevo');
      this.storage.remove('resetCode');
      this.step = 'email';
      return;
    }

    // Verificar código
    if (enteredCode === savedData.code) {
      this.step = 'reset';
      this.toast.show('success', 'Código verificado correctamente');
    } else {
      this.toast.show('error', 'Código incorrecto');
      this.codeForm.reset();
      const firstInput = document.querySelector('input[formControlName="digit1"]') as HTMLInputElement;
      firstInput?.focus();
    }
  }

  onResetSubmit() {
    if (this.resetForm.invalid) return;

    this.isLoading = true;
    const newPassword = this.resetForm.value.password;
    const savedData: ResetCode = this.storage.get('resetCode');

    setTimeout(() => {
      // Actualizar contraseña
      const users = this.storage.get('users') || [];
      const userIndex = users.findIndex((u: any) => u.email === savedData.email);

      if (userIndex !== -1) {
        users[userIndex].password = newPassword;
        this.storage.set('users', users);
        this.storage.remove('resetCode');

        this.toast.show('success', 'Contraseña actualizada exitosamente');
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      } else {
        this.toast.show('error', 'Error al actualizar contraseña');
      }

      this.isLoading = false;
    }, 1500);
  }

  onDigitInput(event: any, nextInput: string | null) {
    const input = event.target;
    if (input.value.length === 1 && nextInput) {
      const next = document.querySelector(`input[formControlName="${nextInput}"]`) as HTMLInputElement;
      next?.focus();
    }
  }

  onDigitKeyDown(event: KeyboardEvent, prevInput: string | null) {
    const input = event.target as HTMLInputElement;
    if (event.key === 'Backspace' && !input.value && prevInput) {
      const prev = document.querySelector(`input[formControlName="${prevInput}"]`) as HTMLInputElement;
      prev?.focus();
    }
  }

  togglePasswordVisibility(field: 'password' | 'confirmPassword') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  getPasswordStrength(): number {
    const password = this.resetForm.get('password')?.value || '';
    let strength = 0;

    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^a-zA-Z0-9]/.test(password)) strength++;

    return strength;
  }

  getPasswordStrengthLabel(): string {
    const strength = this.getPasswordStrength();
    const labels = ['Muy débil', 'Débil', 'Regular', 'Buena', 'Fuerte', 'Muy fuerte'];
    return labels[strength] || 'Muy débil';
  }

  resendCode() {
    this.step = 'email';
    this.storage.remove('resetCode');
    this.toast.show('info', 'Solicita un nuevo código');
  }
}
