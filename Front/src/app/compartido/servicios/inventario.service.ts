import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Inventario {
    id: number;
    stockActual: number;
    stockMinimo: number;
    stockMaximo: number;
    ubicacion: string;
    producto: any; // Se puede tipar mejor con Producto interface
}

@Injectable({
    providedIn: 'root'
})
export class InventarioService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/inventario`;

    listarTodos(): Observable<Inventario[]> {
        return this.http.get<Inventario[]>(this.apiUrl);
    }

    obtenerPorProducto(productoId: number): Observable<Inventario> {
        return this.http.get<Inventario>(`${this.apiUrl}/producto/${productoId}`);
    }

    crear(inventario: Partial<Inventario>): Observable<Inventario> {
        return this.http.post<Inventario>(this.apiUrl, inventario);
    }

    actualizarStock(productoId: number, cantidad: number, motivo: string, accion: 'INCREMENTAR' | 'DESCONTAR' | 'SET'): Observable<Inventario> {
        return this.http.put<Inventario>(`${this.apiUrl}/producto/${productoId}/stock`, { cantidad, motivo, accion });
    }

    listarAlertasBajoStock(): Observable<Inventario[]> {
        return this.http.get<Inventario[]>(`${this.apiUrl}/alertas/bajo-stock`);
    }
}
