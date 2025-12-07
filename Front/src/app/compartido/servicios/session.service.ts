import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private sessionCheckInterval: any;

  checkSession(): void {
    // Verificar sesión
  }

  startSessionMonitoring(): void {
    // Monitorear sesión cada 5 minutos
    this.sessionCheckInterval = setInterval(() => {
      this.checkSession();
    }, 300000);
  }

  stopSessionMonitoring(): void {
    if (this.sessionCheckInterval) {
      clearInterval(this.sessionCheckInterval);
    }
  }
}
