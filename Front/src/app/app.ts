import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BrindisComponent } from './compartido/componentes/brindis/brindis';
import { AlertaComponent } from './compartido/componentes/alerta/alerta.component';
import { SessionService } from './compartido/servicios/session.service';
import { AuthService } from './compartido/servicios/auth.service';
import { CarritoService } from './compartido/servicios/carrito.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, BrindisComponent, AlertaComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit, OnDestroy {
  protected title = 'Front';

  constructor(
    private sessionService: SessionService,
    private authService: AuthService,
    private carritoService: CarritoService
  ) {}

  ngOnInit() {
    this.sessionService.startSessionMonitoring();
    
    // Configurar callback para sincronizar carrito al hacer login
    this.authService.setOnLoginCallback(() => {
      this.carritoService.sincronizarCarritoLocal().subscribe();
    });
  }

  ngOnDestroy() {
    this.sessionService.stopSessionMonitoring();
  }
}
