import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';

interface CartItem {
    id: string;
    nombre: string;
    precio: number;
    cantidad: number;
    imagen?: string;
    categoria: string;
    peso?: string;
}

@Component({
    selector: 'app-carrito',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './carrito.html',
    styleUrl: './carrito.scss',
})
export class Carrito {
    cartItems: CartItem[] = [];

    constructor(private router: Router) {
        this.loadCart();
    }

    loadCart() {
        const cart = localStorage.getItem('cart');
        if (cart) {
            this.cartItems = JSON.parse(cart);
        }
    }

    updateQuantity(item: CartItem, change: number) {
        item.cantidad += change;
        if (item.cantidad < 1) {
            item.cantidad = 1;
        }
        this.saveCart();
    }

    removeItem(item: CartItem) {
        this.cartItems = this.cartItems.filter(i => i.id !== item.id);
        this.saveCart();
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.cartItems));
    }

    getSubtotal(): number {
        return this.cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    }

    getEnvio(): number {
        return this.cartItems.length > 0 ? 15.00 : 0;
    }

    getTotal(): number {
        return this.getSubtotal() + this.getEnvio();
    }

    clearCart() {
        if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
            this.cartItems = [];
            this.saveCart();
        }
    }

    proceedToCheckout() {
        if (this.cartItems.length === 0) {
            alert('Tu carrito está vacío');
            return;
        }
        this.router.navigate(['/cliente/checkout']);
    }
}
