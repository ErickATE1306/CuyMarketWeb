import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  show(type: 'success' | 'error' | 'info' | 'warning', message: string): void {
    console.log(`[${type.toUpperCase()}] ${message}`);
    // Implementar toast visual aquí
  }

  success(message: string): void {
    this.show('success', message);
  }

  error(message: string): void {
    this.show('error', message);
  }

  info(message: string): void {
    this.show('info', message);
  }

  warning(message: string): void {
    this.show('warning', message);
  }
}
