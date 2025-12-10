import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertaService, Alerta } from '../../servicios/alerta.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-alerta',
  standalone: true,
  imports: [CommonModule],
  template: `
    @if (alertas.length > 0) {
      <div class="alertas-container">
        @for (alerta of alertas; track alerta.id) {
          <div class="alerta" [class]="'alerta-' + alerta.tipo">
            <div class="alerta-icono">
              @switch (alerta.tipo) {
                @case ('success') {
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                }
                @case ('error') {
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                  </svg>
                }
                @case ('warning') {
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                    <line x1="12" y1="9" x2="12" y2="13"></line>
                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                  </svg>
                }
                @case ('info') {
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="16" x2="12" y2="12"></line>
                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                  </svg>
                }
              }
            </div>
            <div class="alerta-contenido">
              <p class="alerta-mensaje">{{ alerta.mensaje }}</p>
            </div>
            <button class="alerta-cerrar" (click)="cerrarAlerta(alerta.id)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        }
      </div>
    }
  `,
  styles: [`
    .alertas-container {
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 400px;
    }

    .alerta {
      display: flex;
      align-items: flex-start;
      gap: 12px;
      padding: 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
      background: white;
      border-left: 4px solid;
      animation: slideIn 0.3s ease-out;
    }

    @keyframes slideIn {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }

    .alerta-success {
      border-left-color: #10b981;
      background: #f0fdf4;
    }

    .alerta-success .alerta-icono {
      color: #10b981;
    }

    .alerta-error {
      border-left-color: #ef4444;
      background: #fef2f2;
    }

    .alerta-error .alerta-icono {
      color: #ef4444;
    }

    .alerta-warning {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }

    .alerta-warning .alerta-icono {
      color: #f59e0b;
    }

    .alerta-info {
      border-left-color: #3b82f6;
      background: #eff6ff;
    }

    .alerta-info .alerta-icono {
      color: #3b82f6;
    }

    .alerta-icono {
      flex-shrink: 0;
      margin-top: 2px;
    }

    .alerta-contenido {
      flex: 1;
    }

    .alerta-mensaje {
      margin: 0;
      font-size: 14px;
      line-height: 1.5;
      color: #1f2937;
      font-weight: 500;
    }

    .alerta-cerrar {
      flex-shrink: 0;
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      color: #6b7280;
      transition: color 0.2s;
    }

    .alerta-cerrar:hover {
      color: #1f2937;
    }

    @media (max-width: 768px) {
      .alertas-container {
        left: 20px;
        right: 20px;
        max-width: none;
      }
    }
  `]
})
export class AlertaComponent implements OnInit, OnDestroy {
  private alertaService = inject(AlertaService);
  private subscription?: Subscription;
  private alertaIdCounter = 0;

  alertas: (Alerta & { id: number })[] = [];

  ngOnInit() {
    this.subscription = this.alertaService.alerta$.subscribe(alerta => {
      const alertaConId = {
        ...alerta,
        id: this.alertaIdCounter++
      };
      
      this.alertas.push(alertaConId);

      // Auto cerrar después de la duración especificada
      if (alerta.duracion) {
        setTimeout(() => {
          this.cerrarAlerta(alertaConId.id);
        }, alerta.duracion);
      }
    });
  }

  ngOnDestroy() {
    this.subscription?.unsubscribe();
  }

  cerrarAlerta(id: number) {
    this.alertas = this.alertas.filter(a => a.id !== id);
  }
}
