import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Producto } from './producto.service';

export interface ItemCarrito {
    id: number;
    producto?: Producto; // Opcional temporalmente por compatibilidad
    cantidad: number;
    subtotal: number;
    // Campos legacy del backend anterior (por compatibilidad)
    productoId?: number;
    productoNombre?: string;
    productoRaza?: string;
    precioUnitario?: number;
}

export interface Carrito {
    id: number;
    items: ItemCarrito[];
    total: number;
}

@Injectable({
    providedIn: 'root'
})
export class CarritoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/carrito`;

    private carritoSubject = new BehaviorSubject<Carrito | null>(null);
    public carrito$ = this.carritoSubject.asObservable();

    constructor() {
        this.cargarCarrito();
    }

    cargarCarrito() {
        this.http.get<Carrito>(this.apiUrl).subscribe({
            next: (carrito) => this.carritoSubject.next(carrito),
            error: () => this.carritoSubject.next(null) // Si no está logueado o error
        });
    }

    agregarProducto(productoId: number, cantidad: number = 1): Observable<Carrito> {
        return this.http.post<Carrito>(`${this.apiUrl}/items`, { productoId, cantidad }).pipe(
            tap(carrito => this.carritoSubject.next(carrito))
        );
    }

    removerProducto(itemId: number): Observable<Carrito> {
        return this.http.delete<Carrito>(`${this.apiUrl}/items/${itemId}`).pipe(
            tap(carrito => this.carritoSubject.next(carrito))
        );
    }

    vaciarCarrito(): Observable<void> {
        return this.http.delete<void>(this.apiUrl).pipe(
            tap(() => this.carritoSubject.next(null))
        );
    }

    actualizarCantidad(itemId: number, cantidad: number): Observable<Carrito> {
        return this.http.put<Carrito>(`${this.apiUrl}/items/${itemId}`, { cantidad }).pipe(
            tap(carrito => this.carritoSubject.next(carrito))
        );
    }
}
