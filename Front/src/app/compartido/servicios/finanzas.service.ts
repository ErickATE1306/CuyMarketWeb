import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface IngresoMensual {
    mes: number;
    anio: number;
    monto: number;
    cantidadPedidos: number;
}

export interface MetodoPago {
    metodo: string;
    cantidad: number;
    monto: number;
    porcentaje: number;
}

export interface Transaccion {
    pedidoId: number;
    numeroPedido: string;
    fecha: string;
    clienteNombre: string;
    metodoPago: string;
    monto: number;
    estado: string;
}

export interface FinanzasResumen {
    ingresosTotales: number;
    ingresosMesActual: number;
    promedioDiario: number;
    pedidosPagados: number;
    cambioMesAnterior: number;
    pedidosHoy: number;
    ingresosMensuales: IngresoMensual[];
    metodosPago: { [key: string]: MetodoPago };
    transaccionesRecientes: Transaccion[];
}

@Injectable({
    providedIn: 'root'
})
export class FinanzasService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/finanzas`;

    obtenerResumen(): Observable<FinanzasResumen> {
        return this.http.get<FinanzasResumen>(`${this.apiUrl}/resumen`);
    }
}
