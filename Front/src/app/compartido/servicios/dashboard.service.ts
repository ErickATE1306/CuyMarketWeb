import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface VentaMensual {
    mes: number;
    anio: number;
    totalVentas: number;
}

export interface ProductoTop {
    nombre: string;
    cantidadVendida: number;
}

export interface PedidoReciente {
    id: number;
    numeroPedido: string;
    clienteNombre: string;
    productoPrincipal: string; // "Cuy Raza Peru y 2 mas..."
    cantidadItems: number;
    total: number;
    estado: string;
}

export interface DashboardResumen {
    totalUsuarios: number;
    productosStock: number;
    pedidosActivos: number;
    ingresosMes: number;
    cambioUsuarios: string;
    cambioIngresos: string;
    ventasMensuales: VentaMensual[];
    productosTop: ProductoTop[];
    pedidosRecientes: PedidoReciente[];
}

@Injectable({
    providedIn: 'root'
})
export class DashboardService {
    private apiUrl = `${environment.apiUrl}/dashboard`;

    constructor(private http: HttpClient) { }

    getResumen(): Observable<DashboardResumen> {
        return this.http.get<DashboardResumen>(`${this.apiUrl}/resumen`);
    }
}
