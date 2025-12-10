import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../compartido/servicios/auth.service';

@Component({
    selector: 'app-role-selection',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './role-selection.html',
    styleUrl: './role-selection.scss'
})
export class RoleSelectionComponent implements OnInit {
    email: string = '';
    availableRoles: string[] = [];

    allowManagement: boolean = false;
    allowStore: boolean = false;

    constructor(
        private router: Router,
        public authService: AuthService
    ) { }

    ngOnInit() {
        const state = history.state;
        console.log('RoleSelection initialized with state:', state);
        if (state && state.email) {
            this.email = state.email;
            this.availableRoles = state.roles || [];
            console.log('Available roles:', this.availableRoles);

            // Determinar visibilidad de opciones
            this.checkPermissions();
        } else {
            console.warn('No state found, redirecting to login');
            // Si no hay email en el estado, volver al login (acceso directo inválido)
            this.router.navigate(['/auth/login']);
        }
    }

    checkPermissions() {
        // Verificar gestión (Admin o Empleado)
        this.allowManagement = this.availableRoles.some(r =>
            r.toUpperCase().includes('ADMIN') || r.toUpperCase().includes('EMPLEADO')
        );

        // Verificar tienda (Cliente, Empleado o Admin)
        // EMPLEADO también puede acceder como cliente
        this.allowStore = this.availableRoles.some(r =>
            r.toUpperCase().includes('CLIENTE') || 
            r.toUpperCase().includes('ADMIN') ||
            r.toUpperCase().includes('EMPLEADO')
        );
    }

    navigateToManagement() {
        if (!this.allowManagement) return;

        console.log('Navigating to management...');
        // Determinar rol adecuado (ADMIN o EMPLEADO)
        let roleToSend = 'EMPLEADO'; // Default

        // Debug roles
        console.log('Checking roles for management access:', this.availableRoles);

        if (this.availableRoles.some(r => r.toUpperCase().includes('ADMIN'))) {
            roleToSend = 'ADMIN';
        } else if (this.availableRoles.some(r => r.toUpperCase().includes('EMPLEADO'))) {
            roleToSend = 'EMPLEADO';
        }

        console.log('Selected role to send:', roleToSend);

        this.authService.loginWithRole(this.email, roleToSend).subscribe({
            next: (resp) => {
                console.log('Role login success:', resp);
                if (roleToSend === 'ADMIN') {
                    console.log('Redirecting to Admin Dashboard');
                    this.router.navigate(['/admin/dashboard']);
                } else {
                    console.log('Redirecting to Employee Dashboard');
                    this.router.navigate(['/empleado/gestion-pedidos']);
                }
            },
            error: (err) => {
                console.error('Error selecting role', err);
                // Mostrar error al usuario
            }
        });
    }

    navigateToStore() {
        console.log('Navigating to store (CLIENTE)...');
        this.authService.loginWithRole(this.email, 'CLIENTE').subscribe({
            next: () => {
                console.log('Client role login success, redirecting...');
                this.router.navigate(['/cliente/inicio']);
            },
            error: (err) => {
                console.error('Error selecting role (Client)', err);
            }
        });
    }
}
