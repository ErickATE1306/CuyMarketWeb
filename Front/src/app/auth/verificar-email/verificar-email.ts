import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { StorageService } from '../../compartido/servicios/storage.service';
import { ToastService } from '../../compartido/servicios/toast.service';

@Component({
  selector: 'app-verificar-email',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './verificar-email.html',
  styleUrl: './verificar-email.scss'
})
export class VerificarEmailComponent implements OnInit {
  code: string = '';
  isLoading = false;
  email = '';
  verificationCode = '';
  isResending = false;

  constructor(
    private storage: StorageService,
    private toast: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    // Obtener email del usuario actual
    const currentUser = this.storage.get('currentUser');
    if (!currentUser) {
      this.router.navigate(['/auth/login']);
      return;
    }

    // Verificar si ya está verificado
    if (currentUser.verified) {
      this.toast.show('info', 'Tu email ya está verificado');
      this.router.navigate([this.getUserHome(currentUser.role)]);
      return;
    }

    this.email = currentUser.email;

    // Generar código si no existe
    let savedCode = this.storage.get('verificationCode');
    if (!savedCode || savedCode.email !== this.email) {
      this.verificationCode = this.generateCode();
      this.storage.set('verificationCode', {
        email: this.email,
        code: this.verificationCode,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000) // 30 minutos
      });
      console.log('Código de verificación:', this.verificationCode); // En producción se enviaría por email
    } else {
      this.verificationCode = savedCode.code;
    }
  }

  onVerify() {
    if (this.code.length !== 6) {
      this.toast.show('error', 'Ingresa un código de 6 dígitos');
      return;
    }

    this.isLoading = true;

    setTimeout(() => {
      const savedData = this.storage.get('verificationCode');

      // Verificar expiración
      if (new Date() > new Date(savedData.expiresAt)) {
        this.toast.show('error', 'Código expirado. Solicita uno nuevo');
        this.isLoading = false;
        return;
      }

      // Verificar código
      if (this.code === savedData.code) {
        // Actualizar usuario
        const currentUser = this.storage.get('currentUser');
        currentUser.verified = true;
        this.storage.set('currentUser', currentUser);

        // Actualizar en lista de usuarios
        const users = this.storage.get('users') || [];
        const userIndex = users.findIndex((u: any) => u.email === this.email);
        if (userIndex !== -1) {
          users[userIndex].verified = true;
          this.storage.set('users', users);
        }

        // Limpiar código
        this.storage.remove('verificationCode');

        this.toast.show('success', '¡Email verificado exitosamente!');
        setTimeout(() => {
          this.router.navigate([this.getUserHome(currentUser.role)]);
        }, 1500);
      } else {
        this.toast.show('error', 'Código incorrecto. Intenta nuevamente');
        this.code = '';
      }

      this.isLoading = false;
    }, 1000);
  }

  onResendCode() {
    this.isResending = true;

    setTimeout(() => {
      this.verificationCode = this.generateCode();
      this.storage.set('verificationCode', {
        email: this.email,
        code: this.verificationCode,
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      });

      console.log('Nuevo código de verificación:', this.verificationCode);
      this.toast.show('success', 'Nuevo código enviado a tu email');
      this.code = '';
      this.isResending = false;
    }, 1500);
  }

  skipVerification() {
    // Permitir continuar sin verificar (opcional)
    const currentUser = this.storage.get('currentUser');
    this.router.navigate([this.getUserHome(currentUser.role)]);
    this.toast.show('warning', 'Recuerda verificar tu email para acceder a todas las funcionalidades');
  }

  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getUserHome(role: string): string {
    switch (role) {
      case 'admin':
        return '/admin/dashboard';
      case 'empleado':
        return '/empleado/entregas';
      default:
        return '/cliente/inicio';
    }
  }

  getMaskedEmail(): string {
    const [name, domain] = this.email.split('@');
    const maskedName = name.slice(0, 2) + '***' + name.slice(-1);
    return `${maskedName}@${domain}`;
  }
}
