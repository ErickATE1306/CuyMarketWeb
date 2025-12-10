import { Component, OnInit, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CarritoService } from '../compartido/servicios/carrito.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './cliente.html',
  styleUrl: './cliente.scss',
})
export class Cliente implements OnInit, OnDestroy {
  isLoggedIn = false;
  userName = 'Usuario';
  cartCount = 0;
  private carritoSubscription?: Subscription;

  constructor(
    private router: Router,
    private carritoService: CarritoService
  ) {
    this.checkLoginStatus();
  }

  ngOnInit() {
    // Suscribirse a los cambios del carrito
    this.carritoSubscription = this.carritoService.carrito$.subscribe(carrito => {
      if (carrito && carrito.items) {
        this.cartCount = carrito.items.reduce((sum, item) => sum + item.cantidad, 0);
      } else {
        this.cartCount = 0;
      }
    });
  }

  ngOnDestroy() {
    this.carritoSubscription?.unsubscribe();
  }

  checkLoginStatus() {
    // Por ahora simulamos el estado de login
    // Después esto se conectará con el servicio de autenticación
    const user = localStorage.getItem('user');
    if (user) {
      this.isLoggedIn = true;
      const userData = JSON.parse(user);
      this.userName = userData.nombre || 'Usuario';
    }
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.router.navigate(['/cliente/inicio']);
  }
}
