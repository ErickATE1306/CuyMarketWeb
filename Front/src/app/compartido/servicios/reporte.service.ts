import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ReporteHistorial {
    id: number;
    nombre: string;
    tipo: string;
    formato: string;
    fechaGeneracion: string;
    generadoPor?: {
        id: number;
        nombre: string;
        email: string;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ReporteService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/reportes`;

    generarReporteVentas(formato: 'PDF' | 'EXCEL', fechaInicio?: string, fechaFin?: string): Observable<Blob> {
        let url = `${this.apiUrl}/ventas?formato=${formato}`;
        if (fechaInicio) url += `&fechaInicio=${fechaInicio}`;
        if (fechaFin) url += `&fechaFin=${fechaFin}`;
        
        return this.http.get(url, { 
            responseType: 'blob',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    generarReporteInventario(formato: 'PDF' | 'EXCEL'): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/inventario?formato=${formato}`, { 
            responseType: 'blob',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    generarReportePedidos(formato: 'PDF' | 'EXCEL', fechaInicio?: string, fechaFin?: string): Observable<Blob> {
        let url = `${this.apiUrl}/pedidos?formato=${formato}`;
        if (fechaInicio) url += `&fechaInicio=${fechaInicio}`;
        if (fechaFin) url += `&fechaFin=${fechaFin}`;
        
        return this.http.get(url, { 
            responseType: 'blob',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    generarReporteClientes(formato: 'PDF' | 'EXCEL'): Observable<Blob> {
        return this.http.get(`${this.apiUrl}/clientes?formato=${formato}`, { 
            responseType: 'blob',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    generarReportePedidosCompletados(formato: 'PDF' | 'EXCEL', fechaInicio?: string, fechaFin?: string): Observable<Blob> {
        let url = `${this.apiUrl}/pedidos-completados?formato=${formato}`;
        if (fechaInicio) url += `&fechaInicio=${fechaInicio}`;
        if (fechaFin) url += `&fechaFin=${fechaFin}`;
        
        return this.http.get(url, { 
            responseType: 'blob',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });
    }

    listarRecientes(): Observable<ReporteHistorial[]> {
        return this.http.get<ReporteHistorial[]>(`${this.apiUrl}/recientes`);
    }

    listarHistorial(): Observable<ReporteHistorial[]> {
        return this.http.get<ReporteHistorial[]>(`${this.apiUrl}/historial`);
    }
}
