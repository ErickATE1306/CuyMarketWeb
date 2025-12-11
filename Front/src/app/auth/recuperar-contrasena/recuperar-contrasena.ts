import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AlertaService } from '../../compartido/servicios/alerta.service';
import { RecuperarContrasenaService } from '../../compartido/servicios/recuperar-contrasena.service';
import { CustomValidators } from '../../compartido/validadores/custom-validators';

@Component({
  selector: 'app-recuperar-contrasena',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './recuperar-contrasena.html',
  styleUrl: './recuperar-contrasena.scss'
})
export class RecuperarContrasenaComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private alertaService = inject(AlertaService);
  private recuperarService = inject(RecuperarContrasenaService);

  step: 'email' | 'code' | 'reset' = 'email';
  emailForm: FormGroup;
  codeForm: FormGroup;
  resetForm: FormGroup;
  isLoading = false;
  currentEmail = '';
  showPassword = false;
  showConfirmPassword = false;
  codigoVerificado = '';

  constructor() {
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

    this.recuperarService.solicitarRecuperacion(email).subscribe({
      next: (response) => {
        this.currentEmail = email;
        this.step = 'code';
        this.alertaService.mostrarExito('Código enviado a tu correo electrónico');
        
        // Solo para desarrollo - mostrar código en consola
        if (response.codigo) {
          console.log('Código de recuperación:', response.codigo);
          this.alertaService.mostrarInfo(`Código (DEV): ${response.codigo}`);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error al solicitar recuperación:', error);
        if (error.status === 400 && error.error?.message) {
          this.alertaService.mostrarError(error.error.message);
        } else {
          this.alertaService.mostrarError('Error al procesar la solicitud');
        }
        this.isLoading = false;
      }
    });
  }

  onCodeSubmit() {
    if (this.codeForm.invalid) return;

    const enteredCode = Object.values(this.codeForm.value).join('');

    this.isLoading = true;
    this.recuperarService.verificarCodigo(this.currentEmail, enteredCode).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.valido) {
          this.codigoVerificado = enteredCode;
          this.step = 'reset';
          this.alertaService.mostrarExito('Código verificado correctamente');
        } else {
          this.alertaService.mostrarError(response.message || 'Código incorrecto');
          this.codeForm.reset();
          const firstInput = document.querySelector('input[formControlName="digit1"]') as HTMLInputElement;
          firstInput?.focus();
        }
      },
      error: (error) => {
        console.error('Error al verificar código:', error);
        this.alertaService.mostrarError('Error al verificar el código');
        this.isLoading = false;
      }
    });
  }

  onResetSubmit() {
    if (this.resetForm.invalid) return;

    this.isLoading = true;
    const newPassword = this.resetForm.value.password;

    this.recuperarService.restablecerContrasena(this.currentEmail, this.codigoVerificado, newPassword).subscribe({
      next: (response) => {
        this.alertaService.mostrarExito('Contraseña actualizada exitosamente');
        setTimeout(() => {
          this.router.navigate(['/auth/login']);
        }, 1500);
      },
      error: (error) => {
        console.error('Error al restablecer contraseña:', error);
        this.alertaService.mostrarError(error.error?.message || 'Error al actualizar la contraseña');
        this.isLoading = false;
      }
    });
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
    this.codeForm.reset();
    this.alertaService.mostrarInfo('Solicita un nuevo código');
  }
}
