import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RecuperarContrasenaService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/auth/recuperar-contrasena`;

  solicitarRecuperacion(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/solicitar`, { email });
  }

  verificarCodigo(email: string, codigo: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/verificar-codigo`, { email, codigo });
  }

  restablecerContrasena(email: string, codigo: string, nuevaContrasena: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/restablecer`, { email, codigo, nuevaContrasena });
  }
}
