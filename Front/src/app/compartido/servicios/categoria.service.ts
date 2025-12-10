import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Categoria {
    id: number;
    nombre: string;
    descripcion: string;
    activa: boolean;
    totalProductos?: number;
}

@Injectable({
    providedIn: 'root'
})
export class CategoriaService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/categorias`;

    listar(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(this.apiUrl);
    }

    listarTodas(): Observable<Categoria[]> {
        return this.http.get<Categoria[]>(`${this.apiUrl}/todas`);
    }

    obtenerPorId(id: number): Observable<Categoria> {
        return this.http.get<Categoria>(`${this.apiUrl}/${id}`);
    }

    // Métodos Admin
    crear(categoria: Partial<Categoria>): Observable<Categoria> {
        return this.http.post<Categoria>(this.apiUrl, categoria);
    }

    actualizar(id: number, categoria: Partial<Categoria>): Observable<Categoria> {
        return this.http.put<Categoria>(`${this.apiUrl}/${id}`, categoria);
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
