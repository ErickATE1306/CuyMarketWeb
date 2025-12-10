import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PerfilUsuario {
    id: number;
    nombre: string;
    apellido: string;
    dni: string;
    email: string;
    telefono: string;
    activo: boolean;
    fechaRegistro: string;
    roles: string[];
}

@Injectable({
    providedIn: 'root'
})
export class UsuarioService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/usuarios`;

    obtenerPerfil(): Observable<PerfilUsuario> {
        return this.http.get<PerfilUsuario>(`${this.apiUrl}/perfil`);
    }

    actualizarPerfil(perfil: Partial<PerfilUsuario>): Observable<PerfilUsuario> {
        return this.http.put<PerfilUsuario>(`${this.apiUrl}/perfil`, perfil);
    }

    // Admin methods
    listarTodos(): Observable<PerfilUsuario[]> {
        return this.http.get<PerfilUsuario[]>(this.apiUrl);
    }

    crearUsuario(usuario: any): Observable<PerfilUsuario> {
        return this.http.post<PerfilUsuario>(this.apiUrl, usuario);
    }

    actualizarUsuario(id: number, usuario: any): Observable<PerfilUsuario> {
        return this.http.put<PerfilUsuario>(`${this.apiUrl}/${id}`, usuario);
    }

    eliminarUsuario(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }

    consultarDniReniec(dni: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/reniec/${dni}`);
    }

    consultarDniReniecPublico(dni: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/public/reniec/${dni}`);
    }
}
