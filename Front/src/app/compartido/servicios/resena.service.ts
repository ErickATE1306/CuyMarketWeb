import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Resena {
    id?: number;
    productoId: number; // o entidad Producto reducida
    usuarioNombre?: string;
    calificacion: number;
    comentario: string;
    fechaCreacion?: string;
}

@Injectable({
    providedIn: 'root'
})
export class ResenaService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/resenas`;

    listarPorProducto(productoId: number): Observable<Resena[]> {
        return this.http.get<Resena[]>(`${this.apiUrl}/producto/${productoId}`);
    }

    crear(resena: Resena): Observable<Resena> {
        return this.http.post<Resena>(this.apiUrl, resena);
    }

    // Posible método para eliminar si es el propio usuario o admin
    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
