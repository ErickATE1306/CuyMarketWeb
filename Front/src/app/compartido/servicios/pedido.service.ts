import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface PedidoRequest {
    direccionEnvioId: number;
    metodoPago: string;
    codigoCupon?: string;
}

export interface ItemPedido {
    id: number;
    productoId: number;
    productoNombre: string;
    productoRaza?: string;
    cantidad: number;
    precioUnitario: number;
    subtotal: number;
}

export interface Pedido {
    id: number;
    numeroPedido: string;
    fechaPedido: string;
    estado: string;
    subtotal: number;
    descuento: number;
    costoEnvio: number;
    total: number;
    metodoPago?: string;
    notas?: string;
    direccionEnvio?: string;
    items: ItemPedido[];
    usuarioNombre?: string;
    usuarioEmail?: string;
}

export interface EstadisticasPedidos {
    totalPedidos: number;
    pendientes: number;
    enProceso: number;
    completados: number;
    cancelados: number;
}

@Injectable({
    providedIn: 'root'
})
export class PedidoService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/pedidos`;

    // Métodos para clientes
    crearPedido(request: PedidoRequest | FormData): Observable<Pedido> {
        return this.http.post<Pedido>(this.apiUrl, request);
    }

    listarMisPedidos(): Observable<Pedido[]> {
        return this.http.get<Pedido[]>(this.apiUrl);
    }

    obtenerPorId(id: number): Observable<Pedido> {
        return this.http.get<Pedido>(`${this.apiUrl}/${id}`);
    }

    // Métodos para admin
    listarTodosPedidos(): Observable<Pedido[]> {
        return this.http.get<Pedido[]>(`${this.apiUrl}/admin/todos`);
    }

    listarPorEstado(estado: string): Observable<Pedido[]> {
        return this.http.get<Pedido[]>(`${this.apiUrl}/estado/${estado}`);
    }

    listarPorFecha(fechaInicio: string, fechaFin: string): Observable<Pedido[]> {
        return this.http.get<Pedido[]>(`${this.apiUrl}/admin/todos`, {
            params: {
                fechaInicio,
                fechaFin
            }
        });
    }

    actualizarEstado(id: number, nuevoEstado: string): Observable<Pedido> {
        return this.http.put<Pedido>(`${this.apiUrl}/${id}/estado`, null, {
            params: { nuevoEstado }
        });
    }

    obtenerEstadisticas(): Observable<EstadisticasPedidos> {
        // Por ahora calculamos del lado del cliente, luego se puede crear endpoint en backend
        return new Observable(observer => {
            this.listarTodosPedidos().subscribe(pedidos => {
                const stats: EstadisticasPedidos = {
                    totalPedidos: pedidos.length,
                    pendientes: pedidos.filter(p => p.estado === 'PENDIENTE').length,
                    enProceso: pedidos.filter(p => p.estado === 'EN_PROCESO').length,
                    completados: pedidos.filter(p => p.estado === 'ENTREGADO').length,
                    cancelados: pedidos.filter(p => p.estado === 'CANCELADO').length
                };
                observer.next(stats);
                observer.complete();
            });
        });
    }
}
