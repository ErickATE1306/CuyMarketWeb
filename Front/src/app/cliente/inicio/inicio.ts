import { Component } from '@angular/core';
import { RouterLink, Router } from '@angular/router';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio {
  constructor(private router: Router) {}

  viewProductDetail(productId: string) {
    this.router.navigate(['/cliente/productos', productId]);
  }

  addToCart(nombre: string, precio: number, categoria: string, peso?: string) {
    const cart = localStorage.getItem('cart');
    let cartItems = cart ? JSON.parse(cart) : [];
    
    // Generar ID único basado en nombre
    const id = nombre.toLowerCase().replace(/\s+/g, '-');
    
    // Buscar si el producto ya existe en el carrito
    const existingItem = cartItems.find((item: any) => item.id === id);
    
    if (existingItem) {
      existingItem.cantidad += 1;
    } else {
      cartItems.push({
        id,
        nombre,
        precio,
        cantidad: 1,
        categoria,
        peso
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    
    // Mostrar notificación
    alert(`${nombre} agregado al carrito`);
    
    // Disparar evento para actualizar el contador del carrito
    window.dispatchEvent(new Event('cart-updated'));
  }
}
