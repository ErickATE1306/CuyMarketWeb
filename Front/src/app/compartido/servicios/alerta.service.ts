import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface Alerta {
  tipo: 'success' | 'error' | 'warning' | 'info';
  mensaje: string;
  duracion?: number;
}

@Injectable({
  providedIn: 'root'
})
export class AlertaService {
  private alertaSubject = new Subject<Alerta>();
  public alerta$ = this.alertaSubject.asObservable();

  mostrarExito(mensaje: string, duracion: number = 3000) {
    this.alertaSubject.next({
      tipo: 'success',
      mensaje,
      duracion
    });
  }

  mostrarError(mensaje: string, duracion: number = 4000) {
    this.alertaSubject.next({
      tipo: 'error',
      mensaje,
      duracion
    });
  }

  mostrarAdvertencia(mensaje: string, duracion: number = 3500) {
    this.alertaSubject.next({
      tipo: 'warning',
      mensaje,
      duracion
    });
  }

  mostrarInfo(mensaje: string, duracion: number = 3000) {
    this.alertaSubject.next({
      tipo: 'info',
      mensaje,
      duracion
    });
  }
}
