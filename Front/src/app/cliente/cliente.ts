import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet, Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cliente',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  templateUrl: './cliente.html',
  styleUrl: './cliente.scss',
})
export class Cliente {
  isLoggedIn = false;
  userName = 'Usuario';
  cartCount = 0;

  constructor(private router: Router) {
    this.checkLoginStatus();
    this.updateCartCount();
    
    // Escuchar cambios en el carrito
    window.addEventListener('cart-updated', () => {
      this.updateCartCount();
    });
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

  updateCartCount() {
    const cart = localStorage.getItem('cart');
    if (cart) {
      const cartItems = JSON.parse(cart);
      this.cartCount = cartItems.reduce((sum: number, item: any) => sum + item.cantidad, 0);
    } else {
      this.cartCount = 0;
    }
  }

  logout() {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    this.isLoggedIn = false;
    this.router.navigate(['/cliente/inicio']);
  }
}
