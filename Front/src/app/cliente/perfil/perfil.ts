import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-perfil',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './perfil.html',
    styleUrl: './perfil.scss',
})
export class Perfil {
    userData = {
        dni: '',
        nombre: '',
        apellido: '',
        email: '',
        telefono: '',
        direccion: '',
        ciudad: '',
        distrito: ''
    };

    isEditing = false;

    constructor(private router: Router) {
        this.loadUserData();
    }

    loadUserData() {
        const user = localStorage.getItem('user');
        if (user) {
            const data = JSON.parse(user);
            this.userData = {
                dni: data.dni || '',
                nombre: data.nombre || '',
                apellido: data.apellido || '',
                email: data.email || '',
                telefono: data.telefono || '',
                direccion: data.direccion || '',
                ciudad: data.ciudad || '',
                distrito: data.distrito || ''
            };
        }
    }

    toggleEdit() {
        this.isEditing = !this.isEditing;
    }

    saveProfile() {
        // Aquí iría la lógica para guardar en el backend
        const user = localStorage.getItem('user');
        if (user) {
            const data = JSON.parse(user);
            const updatedUser = { ...data, ...this.userData };
            localStorage.setItem('user', JSON.stringify(updatedUser));
        }
        
        this.isEditing = false;
        alert('Perfil actualizado correctamente');
    }

    cancelEdit() {
        this.loadUserData();
        this.isEditing = false;
    }
}
