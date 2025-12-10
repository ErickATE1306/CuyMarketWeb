import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Producto {
    id: number;
    nombre: string;
    raza: string;
    peso: number;
    precio: number;
    tipo: string;
    certificado: string;
    descripcion: string;
    caracteristicas: string;
    imagen?: string; // Base64 string
    activo: boolean;
    fechaCreacion: string;
    categoriaId: number;
    categoriaNombre: string;
    stockDisponible?: number;
    stockMinimo?: number;
    calificacionPromedio?: number;
    totalResenas?: number;
    imagenUrl?: string; // Propiedad opcional para compatibilidad
    descuento?: number; // Propiedad opcional para compatibilidad
}

export interface ImagenProducto {
    id: number;
    url: string;
    esPrincipal: boolean;
}

export interface Page<T> {
    content: T[];
    totalPages: number;
    totalElements: number;
    size: number;
    number: number;
}

@Injectable({
    providedIn: 'root'
})
export class ProductoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/productos`;

    listar(): Observable<Producto[]> {
        return this.http.get<Producto[]>(this.apiUrl);
    }

    obtenerPorId(id: number): Observable<Producto> {
        return this.http.get<Producto>(`${this.apiUrl}/${id}`);
    }

    listarPorCategoria(categoriaId: number): Observable<Producto[]> {
        return this.http.get<Producto[]>(`${this.apiUrl}/categoria/${categoriaId}`);
    }

    buscar(query: string): Observable<Producto[]> {
        let params = new HttpParams().set('query', query);
        return this.http.get<Producto[]>(`${this.apiUrl}/buscar`, { params });
    }

    // Métodos Admin
    crear(producto: Partial<Producto>): Observable<Producto> {
        return this.http.post<Producto>(this.apiUrl, producto);
    }

    actualizar(id: number, producto: Partial<Producto>): Observable<Producto> {
        return this.http.put<Producto>(`${this.apiUrl}/${id}`, producto);
    }

    eliminar(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`);
    }
}
