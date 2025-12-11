import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap, of, catchError, throwError } from 'rxjs';
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

interface CarritoLocal {
    items: { productoId: number; cantidad: number }[];
}

@Injectable({
    providedIn: 'root'
})
export class CarritoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/carrito`;
    private readonly CARRITO_LOCAL_KEY = 'carrito_local';

    private carritoSubject = new BehaviorSubject<Carrito | null>(null);
    public carrito$ = this.carritoSubject.asObservable();
    
    // Subject para notificar cambios en el carrito local
    private carritoLocalCambioSubject = new BehaviorSubject<number>(0);
    public carritoLocalCambio$ = this.carritoLocalCambioSubject.asObservable();

    constructor() {
        this.cargarCarrito();
    }

    private getCarritoLocal(): CarritoLocal {
        const carritoStr = localStorage.getItem(this.CARRITO_LOCAL_KEY);
        return carritoStr ? JSON.parse(carritoStr) : { items: [] };
    }

    private guardarCarritoLocal(carrito: CarritoLocal) {
        localStorage.setItem(this.CARRITO_LOCAL_KEY, JSON.stringify(carrito));
        // Emitir cambio en el carrito local
        const cantidad = carrito.items.reduce((acc, item) => acc + item.cantidad, 0);
        this.carritoLocalCambioSubject.next(cantidad);
    }

    private limpiarCarritoLocal() {
        localStorage.removeItem(this.CARRITO_LOCAL_KEY);
        // Emitir cambio en el carrito local
        this.carritoLocalCambioSubject.next(0);
    }

    cargarCarrito() {
        const token = localStorage.getItem('token');
        
        if (token) {
            // Usuario logueado: cargar carrito del servidor
            this.http.get<Carrito>(this.apiUrl).pipe(
                catchError(() => {
                    // Si hay error, intentar cargar el carrito local
                    this.cargarCarritoLocalAlServidor();
                    return of(null);
                })
            ).subscribe({
                next: (carrito) => this.carritoSubject.next(carrito),
                error: () => this.carritoSubject.next(null)
            });
        } else {
            // Usuario NO logueado: usar carrito local (simulado)
            this.carritoSubject.next(null);
        }
    }

    // Sincronizar carrito local con el servidor al hacer login
    sincronizarCarritoLocal(): Observable<Carrito | null> {
        const carritoLocal = this.getCarritoLocal();
        
        if (carritoLocal.items.length === 0) {
            return this.http.get<Carrito>(this.apiUrl).pipe(
                tap(carrito => this.carritoSubject.next(carrito))
            );
        }

        return this.cargarCarritoLocalAlServidor();
    }

    private cargarCarritoLocalAlServidor(): Observable<Carrito | null> {
        const carritoLocal = this.getCarritoLocal();
        
        if (carritoLocal.items.length === 0) {
            return of(null);
        }

        // Agregar todos los items del carrito local al servidor
        const requests = carritoLocal.items.map(item => 
            this.http.post<Carrito>(`${this.apiUrl}/items`, { 
                productoId: item.productoId, 
                cantidad: item.cantidad 
            }).pipe(catchError(() => of(null)))
        );

        // Ejecutar todas las peticiones
        return new Observable(observer => {
            Promise.all(requests.map(req => req.toPromise())).then((results) => {
                const ultimoCarrito = results.filter(r => r !== null).pop();
                this.limpiarCarritoLocal();
                if (ultimoCarrito) {
                    this.carritoSubject.next(ultimoCarrito);
                    observer.next(ultimoCarrito);
                } else {
                    observer.next(null);
                }
                observer.complete();
            });
        });
    }

    agregarProducto(productoId: number, cantidad: number = 1): Observable<Carrito> {
        const token = localStorage.getItem('token');
        
        if (token) {
            // Usuario logueado: agregar al servidor
            return this.http.post<Carrito>(`${this.apiUrl}/items`, { productoId, cantidad }).pipe(
                tap(carrito => this.carritoSubject.next(carrito)),
                catchError(error => {
                    // Si hay error, agregar al carrito local como fallback
                    const carritoLocal = this.getCarritoLocal();
                    const itemExistente = carritoLocal.items.find(i => i.productoId === productoId);
                    
                    if (itemExistente) {
                        itemExistente.cantidad += cantidad;
                    } else {
                        carritoLocal.items.push({ productoId, cantidad });
                    }
                    
                    this.guardarCarritoLocal(carritoLocal);
                    return throwError(() => error);
                })
            );
        } else {
            // Usuario NO logueado: agregar al carrito local
            const carritoLocal = this.getCarritoLocal();
            const itemExistente = carritoLocal.items.find(i => i.productoId === productoId);
            
            if (itemExistente) {
                itemExistente.cantidad += cantidad;
            } else {
                carritoLocal.items.push({ productoId, cantidad });
            }
            
            this.guardarCarritoLocal(carritoLocal);
            
            // Retornar observable simulado exitoso
            return of({
                id: 0,
                items: [],
                total: 0
            });
        }
    }

    removerProducto(itemId: number): Observable<Carrito> {
        const token = localStorage.getItem('token');
        
        if (token) {
            // Usuario logueado: remover del servidor
            return this.http.delete<Carrito>(`${this.apiUrl}/items/${itemId}`).pipe(
                tap(carrito => this.carritoSubject.next(carrito))
            );
        } else {
            // Usuario NO logueado: remover del carrito local
            const carritoLocal = this.getCarritoLocal();
            carritoLocal.items = carritoLocal.items.filter((_, index) => index !== itemId);
            this.guardarCarritoLocal(carritoLocal);
            
            return of({
                id: 0,
                items: [],
                total: 0
            });
        }
    }

    vaciarCarrito(): Observable<void> {
        const token = localStorage.getItem('token');
        
        if (token) {
            // Usuario logueado: vaciar en el servidor
            return this.http.delete<void>(this.apiUrl).pipe(
                tap(() => this.carritoSubject.next(null))
            );
        } else {
            // Usuario NO logueado: vaciar carrito local
            this.limpiarCarritoLocal();
            return of(void 0);
        }
    }

    actualizarCantidad(itemId: number, cantidad: number): Observable<Carrito> {
        const token = localStorage.getItem('token');
        
        if (token) {
            // Usuario logueado: actualizar en el servidor
            return this.http.put<Carrito>(`${this.apiUrl}/items/${itemId}`, { cantidad }).pipe(
                tap(carrito => this.carritoSubject.next(carrito))
            );
        } else {
            // Usuario NO logueado: actualizar en carrito local
            const carritoLocal = this.getCarritoLocal();
            if (carritoLocal.items[itemId]) {
                carritoLocal.items[itemId].cantidad = cantidad;
                this.guardarCarritoLocal(carritoLocal);
            }
            
            return of({
                id: 0,
                items: [],
                total: 0
            });
        }
    }

    getCantidadItems(): number {
        const token = localStorage.getItem('token');
        
        if (token) {
            // Usuario logueado: obtener del observable
            const carrito = this.carritoSubject.value;
            return carrito?.items.reduce((acc, item) => acc + item.cantidad, 0) || 0;
        } else {
            // Usuario NO logueado: contar items del carrito local
            const carritoLocal = this.getCarritoLocal();
            return carritoLocal.items.reduce((acc, item) => acc + item.cantidad, 0);
        }
    }

    // Obtener carrito local con detalles de productos para mostrar en UI
    obtenerCarritoLocalConDetalles(): Observable<ItemCarrito[]> {
        const carritoLocal = this.getCarritoLocal();
        
        if (carritoLocal.items.length === 0) {
            return of([]);
        }

        // Obtener detalles de cada producto
        const requests = carritoLocal.items.map((item, index) => 
            this.http.get<Producto>(`${environment.apiUrl}/productos/${item.productoId}`).pipe(
                catchError(() => of(null)),
                tap(producto => {
                    if (producto) {
                        // Crear ItemCarrito con los datos del producto
                        const itemCarrito: ItemCarrito = {
                            id: index, // Usar índice como ID temporal
                            producto: producto,
                            productoId: producto.id,
                            cantidad: item.cantidad,
                            subtotal: producto.precio * item.cantidad,
                            productoNombre: producto.nombre,
                            precioUnitario: producto.precio
                        };
                        return itemCarrito;
                    }
                    return null;
                })
            )
        );

        return new Observable(observer => {
            Promise.all(requests.map(req => req.toPromise())).then((productos) => {
                const items: ItemCarrito[] = [];
                productos.forEach((producto, index) => {
                    if (producto) {
                        const item = carritoLocal.items[index];
                        items.push({
                            id: index,
                            producto: producto,
                            productoId: producto.id,
                            cantidad: item.cantidad,
                            subtotal: producto.precio * item.cantidad,
                            productoNombre: producto.nombre,
                            precioUnitario: producto.precio
                        });
                    }
                });
                observer.next(items);
                observer.complete();
            });
        });
    }

    // Obtener items del carrito (local o servidor según autenticación)
    obtenerItemsCarrito(): Observable<ItemCarrito[]> {
        const token = localStorage.getItem('token');
        
        if (token) {
            // Usuario logueado: usar carrito del servidor
            const carrito = this.carritoSubject.value;
            return of(carrito?.items || []);
        } else {
            // Usuario NO logueado: obtener carrito local con detalles
            return this.obtenerCarritoLocalConDetalles();
        }
    }
}
