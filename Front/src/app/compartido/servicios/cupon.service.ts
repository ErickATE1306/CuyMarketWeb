import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Cupon {
    id: number;
    codigo: string;
    tipoCupon: 'PORCENTAJE' | 'MONTO_FIJO';
    descuento: number;
    fechaExpiracion: string;
    activo: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class CuponService {
    private http = inject(HttpClient);
    // Nota: El backend tiene CuponController. Podría ser /api/cupones
    private apiUrl = `${environment.apiUrl}/cupones`;

    validarCupon(codigo: string): Observable<Cupon> {
        return this.http.get<Cupon>(`${this.apiUrl}/validar/${codigo}`);
    }

    // Admin methods
    listar(): Observable<Cupon[]> {
        return this.http.get<Cupon[]>(this.apiUrl);
    }

    crear(cupon: Cupon): Observable<Cupon> {
        return this.http.post<Cupon>(this.apiUrl, cupon);
    }
}
