import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export interface AuthResponse {
    token: string;
    type: string;
    email: string;
    rolActivo: string;
    todosLosRoles: string[];
    id: number;
    nombre?: string;
    apellido?: string;
}

export interface User {
    id: number;
    email: string;
    nombre?: string;
    roles: string[];
}

export interface RoleSelectionResponse {
    mensaje: string;
    email: string;
    rolesDisponibles: string[];
    requiereSeleccion: boolean;
}

export interface RoleSelectionRequest {
    email: string;
    rolSeleccionado: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);

    private apiUrl = `${environment.apiUrl}/auth`;

    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor() {
        this.loadUserFromStorage();
    }

    private loadUserFromStorage() {
        const userJson = localStorage.getItem('user');
        if (userJson) {
            try {
                this.currentUserSubject.next(JSON.parse(userJson));
            } catch (e) {
                console.error('Error parsing user from storage', e);
                this.logout();
            }
        }
    }

    login(credentials: any): Observable<AuthResponse | RoleSelectionResponse> {
        return this.http.post<AuthResponse | RoleSelectionResponse>(`${this.apiUrl}/login`, credentials).pipe(
            tap(response => {
                // Si es AuthResponse directo (tiene token)
                if ('token' in response && response.token) {
                    this.handleAuthResponse(response as AuthResponse);
                }
                // Si es RoleSelectionResponse, no hacemos nada aquí, el componente manejará la redirección
            })
        );
    }

    loginWithRole(email: string, role: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login/select-role`, { email, rolSeleccionado: role }).pipe(
            tap(response => {
                this.handleAuthResponse(response);
            })
        );
    }

    register(userData: any): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, userData).pipe(
            tap(response => {
                if (response.token) {
                    this.handleAuthResponse(response);
                }
            })
        );
    }

    private handleAuthResponse(response: AuthResponse) {
        if (response.token) {
            localStorage.setItem('token', response.token);

            // El backend envía 'rolActivo' como string (ej: "ADMIN")
            // Mapeamos esto a un array para que hasRole funcione
            const roles = response.rolActivo ? [response.rolActivo] : [];

            const user: User = {
                id: response.id,
                email: response.email,
                nombre: response.nombre,
                roles: roles
            };

            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
        }
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.currentUserSubject.next(null);
        this.router.navigate(['/auth/login']);
    }

    get currentUserValue(): User | null {
        return this.currentUserSubject.value;
    }

    isAuthenticated(): boolean {
        return !!localStorage.getItem('token');
    }

    hasRole(role: string): boolean {
        const user = this.currentUserValue;
        if (!user || !user.roles) return false;

        // Convertir todo a mayúsculas para comparar
        const roleUpper = role.toUpperCase();
        return user.roles.some(r => r.toUpperCase() === roleUpper || r.toUpperCase() === `ROLE_${roleUpper}`);
    }
}
