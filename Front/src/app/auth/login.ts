import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CustomValidators } from '../compartido/validadores/custom-validators';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login implements OnInit {
    showRegister: boolean = false;
    
    loginForm!: FormGroup;
    registerForm!: FormGroup;
    
    loginError: string = '';
    registerError: string = '';
    showPassword: boolean = false;
    showConfirmPassword: boolean = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.initForms();
        
        // Verificar si se debe mostrar el formulario de registro
        this.route.queryParams.subscribe(params => {
            if (params['register'] === 'true') {
                this.showRegister = true;
            }
        });
    }

    initForms() {
        // Formulario de Login
        this.loginForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]]
        });

        // Formulario de Registro
        this.registerForm = this.fb.group({
            nombre: ['', [Validators.required, Validators.minLength(2)]],
            apellido: ['', [Validators.required, Validators.minLength(2)]],
            dni: ['', [Validators.required, CustomValidators.dni()]],
            telefono: ['', [Validators.required, CustomValidators.phoneNumber()]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, CustomValidators.passwordStrength()]],
            confirmPassword: ['', [Validators.required]],
            acceptTerms: [false, [Validators.requiredTrue]]
        }, {
            validators: CustomValidators.mustMatch('password', 'confirmPassword')
        });
    }

    // Cambiar entre login y registro
    toggleForm() {
        this.showRegister = !this.showRegister;
        this.loginError = '';
        this.registerError = '';
        this.loginForm.reset();
        this.registerForm.reset();
    }

    // Iniciar sesión
    login() {
        if (this.loginForm.invalid) {
            this.loginForm.markAllAsTouched();
            return;
        }

        const { email, password } = this.loginForm.value;

        // Simulación: crear datos de usuario
        const userData = {
            id: 'user' + Date.now(),
            email: email,
            nombre: email.split('@')[0],
            role: email.includes('admin') ? 'admin' : 
                  email.includes('empleado') ? 'empleado' : 'cliente'
        };
        
        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'fake-jwt-token-' + Date.now());

        // Redirigir según el tipo de usuario
        if (userData.role === 'admin') {
            this.router.navigate(['/admin/dashboard']);
        } else if (userData.role === 'empleado') {
            this.router.navigate(['/empleado/gestion-pedidos']);
        } else {
            this.router.navigate(['/cliente/inicio']);
        }
    }

    // Registrar nuevo usuario
    register() {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        const formValue = this.registerForm.value;
        
        // Simulación: crear datos de usuario después de registrarse
        const userData = {
            id: 'user' + Date.now(),
            email: formValue.email,
            nombre: formValue.nombre,
            apellido: formValue.apellido,
            dni: formValue.dni,
            telefono: formValue.telefono,
            role: 'cliente',
            verified: false
        };
        
        // Guardar en localStorage
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', 'fake-jwt-token-' + Date.now());
        
        // Redirigir al inicio como cliente
        this.router.navigate(['/cliente/inicio']);
    }

    // Helpers para mostrar errores
    getErrorMessage(formGroup: FormGroup, fieldName: string): string {
        const control = formGroup.get(fieldName);
        if (!control || !control.errors || !control.touched) {
            return '';
        }

        if (control.errors['required']) {
            return 'Este campo es requerido';
        }
        if (control.errors['email']) {
            return 'Email inválido';
        }
        if (control.errors['minLength']) {
            return `Mínimo ${control.errors['minLength'].requiredLength} caracteres`;
        }
        if (control.errors['dni']) {
            return 'DNI debe tener 8 dígitos';
        }
        if (control.errors['phoneNumber']) {
            return 'Teléfono debe tener 9 dígitos y empezar con 9';
        }
        if (control.errors['passwordStrength']) {
            const errors = control.errors['passwordStrength'];
            if (errors.minLength) return 'Mínimo 8 caracteres';
            if (errors.uppercase) return 'Debe incluir mayúsculas';
            if (errors.lowercase) return 'Debe incluir minúsculas';
            if (errors.number) return 'Debe incluir números';
            if (errors.special) return 'Debe incluir caracteres especiales';
        }
        if (control.errors['mustMatch']) {
            return 'Las contraseñas no coinciden';
        }

        return '';
    }

    togglePasswordVisibility() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPasswordVisibility() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    getPasswordStrength(): number {
        const password = this.registerForm.get('password')?.value || '';
        let strength = 0;
        
        if (password.length >= 8) strength++;
        if (/[A-Z]/.test(password)) strength++;
        if (/[a-z]/.test(password)) strength++;
        if (/\d/.test(password)) strength++;
        if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;

        return strength;
    }

    getPasswordStrengthLabel(): string {
        const strength = this.getPasswordStrength();
        if (strength === 0) return '';
        if (strength <= 2) return 'Débil';
        if (strength <= 3) return 'Media';
        if (strength <= 4) return 'Fuerte';
        return 'Muy fuerte';
    }

    getPasswordStrengthColor(): string {
        const strength = this.getPasswordStrength();
        if (strength <= 2) return '#dc2626';
        if (strength <= 3) return '#f59e0b';
        if (strength <= 4) return '#10b981';
        return '#059669';
    }
}
