import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Factura {
    id: number;
    numeroFactura: string;
    fechaEmision: string;
    total: number;
    rucCliente: string;
    razonSocialCliente: string;
    // ... más campos
}

@Injectable({
    providedIn: 'root'
})
export class FacturaService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/facturas`;

    crear(pedidoId: number, ruc: string, razonSocial: string): Observable<Factura> {
        return this.http.post<Factura>(this.apiUrl, { pedidoId, rucCliente: ruc, razonSocialCliente: razonSocial });
    }

    obtenerPorPedido(pedidoId: number): Observable<Factura> {
        return this.http.get<Factura>(`${this.apiUrl}/pedido/${pedidoId}`);
    }
}
