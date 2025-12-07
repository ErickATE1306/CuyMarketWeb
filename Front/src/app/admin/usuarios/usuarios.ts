import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './usuarios.html',
    styleUrl: './usuarios.scss',
})
export class Usuarios {
    showModal = false;
    showEditModal = false;
    newUser = {
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        rol: 'CLIENTE',
        password: ''
    };
    editUser = {
        id: 0,
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        rol: 'CLIENTE'
    };

    openModal() {
        this.showModal = true;
        // Reset form
        this.newUser = {
            nombre: '',
            apellido: '',
            email: '',
            telefono: '',
            rol: 'CLIENTE',
            password: ''
        };
    }

    closeModal() {
        this.showModal = false;
    }

    saveUser() {
        // Aquí irá la lógica para guardar el usuario
        console.log('Guardando usuario:', this.newUser);
        // TODO: Conectar con el backend
        this.closeModal();
    }

    openEditModal(user: any) {
        this.showEditModal = true;
        // Cargar datos del usuario
        this.editUser = {
            id: user.id || 1,
            nombre: user.nombre || 'María',
            apellido: user.apellido || 'González',
            email: user.email || 'maria.gonzalez@email.com',
            telefono: user.telefono || '+51 999 888 777',
            rol: user.rol || 'CLIENTE'
        };
    }

    closeEditModal() {
        this.showEditModal = false;
    }

    updateUser() {
        // Aquí irá la lógica para actualizar el usuario
        console.log('Actualizando usuario:', this.editUser);
        // TODO: Conectar con el backend
        this.closeEditModal();
    }
}
