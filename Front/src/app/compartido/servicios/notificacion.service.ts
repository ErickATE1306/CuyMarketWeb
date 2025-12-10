import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Notificacion {
    id: number;
    titulo: string;
    mensaje: string;
    leida: boolean;
    fechaCreacion: string;
    urlAccion?: string;
}

@Injectable({
    providedIn: 'root'
})
export class NotificacionService {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/notificaciones`;

    listarMisNotificaciones(): Observable<Notificacion[]> {
        return this.http.get<Notificacion[]>(this.apiUrl);
    }

    listarNoLeidas(): Observable<Notificacion[]> {
        return this.http.get<Notificacion[]>(`${this.apiUrl}/no-leidas`);
    }

    marcarComoLeida(id: number): Observable<Notificacion> {
        return this.http.put<Notificacion>(`${this.apiUrl}/${id}/leida`, {});
    }

    marcarTodasLeidas(): Observable<void> {
        return this.http.put<void>(`${this.apiUrl}/todas-leidas`, {});
    }
}
