import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-configuracion',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './configuracion.html',
    styleUrl: './configuracion.scss',
})
export class Configuracion {
    // Preferencias de notificaciones
    notificaciones = {
        email: true,
        pedidos: true,
        promociones: false,
        newsletter: true
    };

    // Configuración de privacidad
    privacidad = {
        perfilPublico: false,
        mostrarCompras: false,
        compartirDatos: false
    };

    // Cambio de contraseña
    passwordForm = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    };

    showPasswordSection = false;

    saveNotifications() {
        // Aquí iría la lógica para guardar en el backend
        console.log('Guardando notificaciones:', this.notificaciones);
        alert('Preferencias de notificaciones guardadas');
    }

    savePrivacy() {
        // Aquí iría la lógica para guardar en el backend
        console.log('Guardando privacidad:', this.privacidad);
        alert('Configuración de privacidad guardada');
    }

    togglePasswordSection() {
        this.showPasswordSection = !this.showPasswordSection;
        if (!this.showPasswordSection) {
            this.passwordForm = {
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            };
        }
    }

    changePassword() {
        if (!this.passwordForm.currentPassword || !this.passwordForm.newPassword || !this.passwordForm.confirmPassword) {
            alert('Por favor completa todos los campos');
            return;
        }

        if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
            alert('Las contraseñas nuevas no coinciden');
            return;
        }

        if (this.passwordForm.newPassword.length < 8) {
            alert('La contraseña debe tener al menos 8 caracteres');
            return;
        }

        // Aquí iría la lógica para cambiar contraseña en el backend
        console.log('Cambiando contraseña');
        alert('Contraseña cambiada exitosamente');
        this.togglePasswordSection();
    }

    deleteAccount() {
        const confirm = window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.');
        if (confirm) {
            // Aquí iría la lógica para eliminar cuenta
            console.log('Eliminando cuenta');
            alert('Cuenta eliminada. Serás redirigido al inicio.');
        }
    }
}
