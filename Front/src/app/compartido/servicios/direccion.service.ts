import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Direccion {
    id?: number;
    nombre: string;
    apellido: string;
    telefono: string;
    direccion: string;
    referencia?: string;
    ciudad: string;
    distrito: string;
    codigoPostal?: string;
    esPrincipal?: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class DireccionService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/direcciones`;

    listarMisDirecciones(): Observable<Direccion[]> {
        return this.http.get<Direccion[]>(this.apiUrl);
    }

    obtenerDireccionPrincipal(): Observable<Direccion> {
        return this.http.get<Direccion>(`${this.apiUrl}/principal`);
    }

    guardar(direccion: Direccion): Observable<Direccion> {
        return this.http.post<Direccion>(this.apiUrl, direccion);
    }

    actualizar(id: number, direccion: Direccion): Observable<Direccion> {
        return this.http.put<Direccion>(`${this.apiUrl}/${id}`, direccion);
    }

    establecerComoPrincipal(id: number): Observable<Direccion> {
        return this.http.put<Direccion>(`${this.apiUrl}/${id}/principal`, {});
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
