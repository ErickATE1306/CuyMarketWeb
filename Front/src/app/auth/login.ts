import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { CustomValidators } from '../compartido/validadores/custom-validators';
import { AuthService, AuthResponse, RoleSelectionResponse } from '../compartido/servicios/auth.service';
import { AlertaService } from '../compartido/servicios/alerta.service';
import { UsuarioService } from '../compartido/servicios/usuario.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterLink],
    templateUrl: './login.html',
    styleUrl: './login.scss',
})
export class Login implements OnInit {
    private alertaService = inject(AlertaService);
    private usuarioService = inject(UsuarioService);
    
    showRegister: boolean = false;

    loginForm!: FormGroup;
    registerForm!: FormGroup;

    loginError: string = '';
    registerError: string = '';
    showPassword: boolean = false;
    showConfirmPassword: boolean = false;
    searchingDni: boolean = false;
    nombresFromReniec: boolean = false;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.initForms();

        // Verificar si se debe mostrar el formulario de registro
        this.route.queryParams.subscribe(params => {
            if (params['register'] === 'true') {
                this.showRegister = true;
            }
        });

        // Redirigir si ya está logueado
        if (this.authService.isAuthenticated()) {
            this.redirectUser();
        }
    }

    initForms() {
        // Formulario de Login
        this.loginForm = this.fb.group({
            email: ['', [
                Validators.required, 
                Validators.email,
                Validators.maxLength(30)
            ]],
            password: ['', [
                Validators.required, 
                Validators.minLength(6),
                Validators.maxLength(12)
            ]]
        });

        // Formulario de Registro
        this.registerForm = this.fb.group({
            nombre: ['', [
                Validators.required, 
                Validators.minLength(2),
                Validators.maxLength(30)
            ]],
            apellido: ['', [
                Validators.required, 
                Validators.minLength(2),
                Validators.maxLength(30)
            ]],
            dni: ['', [Validators.required, CustomValidators.dni()]],
            telefono: ['', [Validators.required, CustomValidators.phoneNumber()]],
            email: ['', [
                Validators.required, 
                Validators.email,
                Validators.maxLength(30)
            ]],
            password: ['', [
                Validators.required, 
                CustomValidators.passwordStrength(),
                Validators.maxLength(12)
            ]],
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
        this.nombresFromReniec = false;
        this.searchingDni = false;
    }

    // Consultar DNI en RENIEC
    onDniChange(dni: string) {
        if (dni && dni.length === 8) {
            this.searchingDni = true;
            this.usuarioService.consultarDniReniecPublico(dni).subscribe({
                next: (data) => {
                    console.log('RENIEC Data:', data);
                    this.searchingDni = false;

                    let persona: any = data;
                    if (typeof data === 'string') {
                        try {
                            persona = JSON.parse(data);
                        } catch (e) {
                            console.error('Error parsing JSON', e);
                        }
                    }

                    if (persona) {
                        this.nombresFromReniec = true;
                        // Adaptar a varias posibles respuestas de la API
                        if (persona.first_name) {
                            this.registerForm.patchValue({
                                nombre: persona.first_name,
                                apellido: `${persona.first_last_name} ${persona.second_last_name || ''}`.trim()
                            });
                        } else if (persona.nombres || persona.name) {
                            const apellido = (persona.apellidoPaterno ? persona.apellidoPaterno + ' ' + (persona.apellidoMaterno || '') : '') ||
                                (persona.apellido_paterno ? persona.apellido_paterno + ' ' + (persona.apellido_materno || '') : '') ||
                                persona.apellidos || '';
                            this.registerForm.patchValue({
                                nombre: persona.nombres || persona.name,
                                apellido: apellido.trim()
                            });
                        } else if (persona.data) {
                            const p = persona.data;
                            const nombre = p.nombres || p.name || p.first_name;
                            const apellido = (p.apellidoPaterno ? p.apellidoPaterno + ' ' + (p.apellidoMaterno || '') : '') ||
                                (p.apellido_paterno ? p.apellido_paterno + ' ' + (p.apellido_materno || '') : '') ||
                                (p.first_last_name ? p.first_last_name + ' ' + (p.second_last_name || '') : '') ||
                                p.apellidos || '';
                            this.registerForm.patchValue({
                                nombre: nombre,
                                apellido: apellido.trim()
                            });
                        }
                    }
                },
                error: (err) => {
                    console.error('Error RENIEC', err);
                    this.searchingDni = false;
                    this.alertaService.mostrarAdvertencia('No se pudo consultar el DNI. Ingrese los datos manualmente.');
                }
            });
        } else {
            this.registerForm.patchValue({
                nombre: '',
                apellido: ''
            });
            this.nombresFromReniec = false;
            this.searchingDni = false;
        }
    }

    // Iniciar sesión
    login() {
        console.log('Login attempt started');
        if (this.loginForm.invalid) {
            console.log('Form is invalid:', this.loginForm.errors);
            this.loginForm.markAllAsTouched();
            
            // Mostrar mensajes específicos de error
            const emailControl = this.loginForm.get('email');
            const passwordControl = this.loginForm.get('password');
            
            if (emailControl?.hasError('required')) {
                this.alertaService.mostrarError('Por favor ingrese su correo electrónico');
                return;
            }
            if (emailControl?.hasError('email')) {
                this.alertaService.mostrarError('Por favor ingrese un correo electrónico válido');
                return;
            }
            if (emailControl?.hasError('maxlength')) {
                this.alertaService.mostrarError('El correo electrónico no puede tener más de 30 caracteres');
                return;
            }
            if (passwordControl?.hasError('required')) {
                this.alertaService.mostrarError('Por favor ingrese su contraseña');
                return;
            }
            if (passwordControl?.hasError('minlength')) {
                this.alertaService.mostrarError('La contraseña debe tener al menos 6 caracteres');
                return;
            }
            if (passwordControl?.hasError('maxlength')) {
                this.alertaService.mostrarError('La contraseña no puede tener más de 12 caracteres');
                return;
            }
            return;
        }

        const credentials = this.loginForm.value;
        console.log('Sending credentials:', credentials);

        this.authService.login(credentials).subscribe({
            next: (response: AuthResponse | RoleSelectionResponse) => {
                console.log('Login response received:', response);
                // Verificar si se requiere selección de rol
                if ('requiereSeleccion' in response && response.requiereSeleccion) {
                    console.log('Selection required, navigating to select-role');
                    this.router.navigate(['/auth/select-role'], {
                        state: {
                            email: response.email,
                            roles: (response as any).rolesDisponibles // Cast to avoid TS issues if strict
                        }
                    });
                } else {
                    console.log('Direct login, redirecting user');
                    // Login directo exitoso
                    this.alertaService.mostrarExito('¡Inicio de sesión exitoso! Bienvenido');
                    this.redirectUser();
                }
            },
            error: (err: any) => {
                console.error('Login error', err);
                // Mensajes de error más específicos
                if (err.status === 401) {
                    this.alertaService.mostrarError('Contraseña incorrecta. Por favor intente nuevamente.');
                } else if (err.status === 404) {
                    this.alertaService.mostrarError('Usuario no encontrado. Verifique su correo electrónico.');
                } else if (err.error?.message) {
                    this.alertaService.mostrarError(err.error.message);
                } else {
                    this.alertaService.mostrarError('Error en el inicio de sesión. Por favor intente nuevamente.');
                }
                this.loginError = 'Error en el inicio de sesión';
            }
        });
    }

    // Registrar nuevo usuario
    register() {
        if (this.registerForm.invalid) {
            this.registerForm.markAllAsTouched();
            return;
        }

        const userData = this.registerForm.value;
        // Eliminar confirmPassword y acceptTerms antes de enviar
        const { confirmPassword, acceptTerms, ...requestData } = userData;

        this.authService.register(requestData).subscribe({
            next: (response: AuthResponse) => {
                this.alertaService.mostrarExito('¡Registro exitoso! Bienvenido a CuyMarket');
                this.redirectUser();
            },
            error: (err: any) => {
                console.error('Register error', err);
                // Manejar errores de validación del backend
                this.registerError = 'Error al registrar el usuario. El email podría estar en uso.';
                this.alertaService.mostrarError('Error al registrar el usuario. El email podría estar en uso.');
            }
        });
    }

    private redirectUser() {
        if (this.authService.hasRole('admin') || this.authService.hasRole('empleado')) {
            this.router.navigate(['/auth/select-role']);
        } else {
            this.router.navigate(['/cliente/inicio']);
        }
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
