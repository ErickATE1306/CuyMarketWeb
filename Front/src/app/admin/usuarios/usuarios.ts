import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService, PerfilUsuario } from '../../compartido/servicios/usuario.service';

@Component({
    selector: 'app-usuarios',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './usuarios.html',
    styleUrl: './usuarios.scss',
})
export class Usuarios implements OnInit {
    showModal = false;
    showEditModal = false;

    // Data
    usuarios: PerfilUsuario[] = [];
    filteredUsuarios: PerfilUsuario[] = [];
    currentFilter: string = 'Todos';

    // Stats
    totalUsuarios = 0;
    activos = 0;
    nuevosMes = 0;

    // UI States
    searchingDni = false;
    showPassword = false;
    showConfirmPassword = false;
    nombresFromReniec = false;
    showEditPassword = false;
    showEditConfirmPassword = false;
    searchingEditDni = false;
    nombresFromReniecEdit = false;

    newUser = {
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        rol: 'CLIENTE',
        password: '',
        confirmPassword: ''
    };
    editUser = {
        id: 0,
        nombre: '',
        apellido: '',
        dni: '',
        email: '',
        telefono: '',
        rol: 'CLIENTE',
        password: '',
        confirmPassword: ''
    };

    // Search
    searchTerm: string = '';

    constructor(private usuarioService: UsuarioService) { }

    ngOnInit() {
        this.loadUsuarios();
    }

    loadUsuarios() {
        this.usuarioService.listarTodos().subscribe({
            next: (data) => {
                this.usuarios = data;
                this.calculateStats();
                this.filterUsuarios(this.currentFilter);
            },
            error: (err) => console.error('Error al cargar usuarios', err)
        });
    }

    calculateStats() {
        this.totalUsuarios = this.usuarios.length;
        this.activos = this.usuarios.filter(u => u.activo).length;

        const now = new Date();
        const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        this.nuevosMes = this.usuarios.filter(u => new Date(u.fechaRegistro) >= firstDayOfMonth).length;
    }

    filterUsuarios(rol: string) {
        this.currentFilter = rol;
        let filtered = this.usuarios;

        // Filter by Role
        if (rol !== 'Todos') {
            let searchRole = '';
            if (rol === 'Clientes') searchRole = 'CLIENTE';
            if (rol === 'Empleados') searchRole = 'EMPLEADO';
            if (rol === 'Admins') searchRole = 'ADMIN';
            filtered = filtered.filter(u => u.roles && u.roles.includes(searchRole));
        }

        // Filter by Search Term
        if (this.searchTerm && this.searchTerm.trim() !== '') {
            const term = this.searchTerm.toLowerCase();
            filtered = filtered.filter(u =>
                (u.nombre && u.nombre.toLowerCase().includes(term)) ||
                (u.apellido && u.apellido.toLowerCase().includes(term)) ||
                (u.email && u.email.toLowerCase().includes(term)) ||
                (u.dni && u.dni.includes(term))
            );
        }

        this.filteredUsuarios = filtered;
    }

    getRolBadgeClass(roles: string[]): string {
        if (!roles) return '';
        if (roles.includes('ADMIN')) return 'rol-admin';
        if (roles.includes('EMPLEADO')) return 'rol-empleado';
        return 'rol-cliente';
    }

    getRolDisplay(roles: string[]): string {
        if (!roles) return '';
        if (roles.includes('ADMIN')) return 'Admin';
        if (roles.includes('EMPLEADO')) return 'Empleado';
        return 'Cliente';
    }

    openModal() {
        this.showModal = true;
        this.showPassword = false;
        this.showConfirmPassword = false;
        this.nombresFromReniec = false;
        // Reset form
        this.newUser = {
            nombre: '',
            apellido: '',
            dni: '',
            email: '',
            telefono: '',
            rol: 'CLIENTE',
            password: '',
            confirmPassword: ''
        };
    }

    closeModal() {
        this.showModal = false;
    }

    saveUser() {
        if (this.newUser.password !== this.newUser.confirmPassword) {
            alert('Las contraseñas no coinciden');
            return;
        }

        // Create a copy without confirmPassword to send to backend
        const userToSend = { ...this.newUser };
        delete (userToSend as any).confirmPassword;

        this.usuarioService.crearUsuario(userToSend).subscribe({
            next: (createdUser) => {
                console.log('Usuario creado', createdUser);
                this.loadUsuarios(); // Reload list
                this.closeModal();
            },
            error: (err) => {
                console.error('Error al crear usuario', err);
                alert('Error al crear usuario: ' + (err.error?.message || 'Verifique los datos'));
            }
        });
    }

    togglePassword() {
        this.showPassword = !this.showPassword;
    }

    toggleConfirmPassword() {
        this.showConfirmPassword = !this.showConfirmPassword;
    }

    onDniChange(dni: string) {
        if (dni && dni.length === 8) {
            this.searchingDni = true;
            this.usuarioService.consultarDniReniec(dni).subscribe({
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
                        // Adapting to various possible API responses
                        if (persona.first_name) {
                            this.newUser.nombre = persona.first_name;
                            this.newUser.apellido = `${persona.first_last_name} ${persona.second_last_name || ''}`;
                        } else if (persona.nombres || persona.name) {
                            this.newUser.nombre = persona.nombres || persona.name;
                            this.newUser.apellido = (persona.apellidoPaterno ? persona.apellidoPaterno + ' ' + (persona.apellidoMaterno || '') : '') ||
                                (persona.apellido_paterno ? persona.apellido_paterno + ' ' + (persona.apellido_materno || '') : '') ||
                                persona.apellidos;
                        } else if (persona.data) {
                            const p = persona.data;
                            this.newUser.nombre = p.nombres || p.name || p.first_name;
                            this.newUser.apellido = (p.apellidoPaterno ? p.apellidoPaterno + ' ' + (p.apellidoMaterno || '') : '') ||
                                (p.apellido_paterno ? p.apellido_paterno + ' ' + (p.apellido_materno || '') : '') ||
                                (p.first_last_name ? p.first_last_name + ' ' + (p.second_last_name || '') : '') ||
                                p.apellidos;
                        }
                    }
                },
                error: (err) => {
                    console.error('Error RENIEC', err);
                    this.searchingDni = false;
                }
            });
        } else {
            this.newUser.nombre = '';
            this.newUser.apellido = '';
            this.nombresFromReniec = false;
            this.searchingDni = false;
        }
    }

    onEditDniChange(dni: string) {
        if (dni && dni.length === 8) {
            this.searchingEditDni = true;
            this.usuarioService.consultarDniReniec(dni).subscribe({
                next: (data) => {
                    console.log('RENIEC Data:', data);
                    this.searchingEditDni = false;

                    let persona: any = data;
                    if (typeof data === 'string') {
                        try {
                            persona = JSON.parse(data);
                        } catch (e) {
                            console.error('Error parsing JSON', e);
                        }
                    }

                    if (persona) {
                        this.nombresFromReniecEdit = true;
                        // Adapting to various possible API responses
                        if (persona.first_name) {
                            this.editUser.nombre = persona.first_name;
                            this.editUser.apellido = `${persona.first_last_name} ${persona.second_last_name || ''}`;
                        } else if (persona.nombres || persona.name) {
                            this.editUser.nombre = persona.nombres || persona.name;
                            this.editUser.apellido = (persona.apellidoPaterno ? persona.apellidoPaterno + ' ' + (persona.apellidoMaterno || '') : '') ||
                                (persona.apellido_paterno ? persona.apellido_paterno + ' ' + (persona.apellido_materno || '') : '') ||
                                persona.apellidos;
                        } else if (persona.data) {
                            const p = persona.data;
                            this.editUser.nombre = p.nombres || p.name || p.first_name;
                            this.editUser.apellido = (p.apellidoPaterno ? p.apellidoPaterno + ' ' + (p.apellidoMaterno || '') : '') ||
                                (p.apellido_paterno ? p.apellido_paterno + ' ' + (p.apellido_materno || '') : '') ||
                                (p.first_last_name ? p.first_last_name + ' ' + (p.second_last_name || '') : '') ||
                                p.apellidos;
                        }
                    }
                },
                error: (err) => {
                    console.error('Error RENIEC', err);
                    this.searchingEditDni = false;
                }
            });
        } else {
            this.nombresFromReniecEdit = false;
            this.searchingEditDni = false;
        }
    }

    toggleEditPassword() {
        this.showEditPassword = !this.showEditPassword;
    }

    toggleEditConfirmPassword() {
        this.showEditConfirmPassword = !this.showEditConfirmPassword;
    }

    openEditModal(user: PerfilUsuario) {
        this.showEditModal = true;
        this.showEditPassword = false;
        this.showEditConfirmPassword = false;
        // Cargar datos del usuario
        this.editUser = {
            id: user.id,
            nombre: user.nombre,
            apellido: user.apellido,
            dni: user.dni,
            email: user.email,
            telefono: user.telefono,
            rol: user.roles && user.roles.length > 0 ? user.roles[0] : 'CLIENTE',
            password: '',
            confirmPassword: ''
        };
    }

    closeEditModal() {
        this.showEditModal = false;
    }

    updateUser() {
        // Validar contraseñas si se están cambiando
        if (this.editUser.password || this.editUser.confirmPassword) {
            if (this.editUser.password !== this.editUser.confirmPassword) {
                alert('Las contraseñas no coinciden');
                return;
            }
            if (this.editUser.password.length < 6) {
                alert('La contraseña debe tener al menos 6 caracteres');
                return;
            }
        }

        const request: any = {
            nombre: this.editUser.nombre,
            apellido: this.editUser.apellido,
            dni: this.editUser.dni,
            email: this.editUser.email,
            telefono: this.editUser.telefono,
            rol: this.editUser.rol
        };

        // Solo incluir contraseña si se ingresó
        if (this.editUser.password) {
            request.password = this.editUser.password;
        }

        this.usuarioService.actualizarUsuario(this.editUser.id, request).subscribe({
            next: (updatedUser) => {
                console.log('Usuario actualizado', updatedUser);
                this.loadUsuarios();
                this.closeEditModal();
            },
            error: (err) => console.error('Error al actualizar', err)
        });
    }

    deleteUser(id: number) {
        if (confirm('¿Está seguro de eliminar este usuario?')) {
            this.usuarioService.eliminarUsuario(id).subscribe({
                next: () => {
                    console.log('Usuario eliminado');
                    this.loadUsuarios();
                },
                error: (err) => console.error('Error al eliminar', err)
            });
        }
    }
}

