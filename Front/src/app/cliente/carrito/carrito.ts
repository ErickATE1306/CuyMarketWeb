import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CarritoService, ItemCarrito, Carrito as CarritoModel } from '../../compartido/servicios/carrito.service';
import { Subscription } from 'rxjs';
import { ToastService } from '../../compartido/servicios/toast.service';
import { AuthService } from '../../compartido/servicios/auth.service';

@Component({
    selector: 'app-carrito',
    standalone: true,
    imports: [CommonModule, RouterLink],
    templateUrl: './carrito.html',
    styleUrl: './carrito.scss',
})
export class Carrito implements OnInit, OnDestroy {
    cartItems: ItemCarrito[] = [];
    total: number = 0;
    envio: number = 0; // Podría venir del backend o ser calculado

    // Estado de carga
    loading: boolean = false;

    private carritoSubscription?: Subscription;

    constructor(
        private router: Router,
        private carritoService: CarritoService,
        private toastService: ToastService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        if (!this.authService.isAuthenticated()) {
            this.toastService.warning('Debes iniciar sesión para ver tu carrito');
            this.router.navigate(['/auth/login']);
            return;
        }

        this.carritoSubscription = this.carritoService.carrito$.subscribe(carrito => {
            if (carrito) {
                this.cartItems = carrito.items;
                this.total = carrito.total;
                // Envío gratis para compras mayores o iguales a S/ 100
                this.envio = this.total >= 100 ? 0 : (this.cartItems.length > 0 ? 15.00 : 0);
            } else {
                this.cartItems = [];
                this.total = 0;
                this.envio = 0;
            }
        });

        // Recargar carrito al entrar
        this.carritoService.cargarCarrito();
    }

    ngOnDestroy() {
        this.carritoSubscription?.unsubscribe();
    }

    updateQuantity(item: ItemCarrito, change: number) {
        const nuevaCantidad = item.cantidad + change;
        if (nuevaCantidad < 1) return;

        // Verificar stock disponible al aumentar
        if (change > 0 && item.producto?.stockDisponible && nuevaCantidad > item.producto.stockDisponible) {
            this.toastService.warning(`Stock máximo disponible: ${item.producto.stockDisponible}`);
            return;
        }

        this.carritoService.actualizarCantidad(item.id, nuevaCantidad).subscribe({
            next: () => this.toastService.success('Cantidad actualizada'),
            error: () => this.toastService.error('Error al actualizar cantidad')
        });
    }

    verDetalle(productoId?: number) {
        if (!productoId) return;
        this.router.navigate(['/cliente/productos', productoId]);
    }

    removeItem(item: ItemCarrito) {
        this.carritoService.removerProducto(item.id).subscribe({
            next: () => this.toastService.success('Producto eliminado'),
            error: () => this.toastService.error('Error al eliminar producto')
        });
    }

    getSubtotal(): number {
        // Calcular desde los items para asegurar que siempre esté actualizado
        return this.cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    }

    getEnvio(): number {
        const subtotal = this.getSubtotal();
        // Envío gratis para compras >= S/ 100, sino S/ 15
        return subtotal >= 100 ? 0 : (this.cartItems.length > 0 ? 15 : 0);
    }

    getTotal(): number {
        return this.getSubtotal() + this.getEnvio();
    }

    clearCart() {
        if (confirm('¿Estás seguro de que deseas vaciar el carrito?')) {
            this.carritoService.vaciarCarrito().subscribe({
                next: () => this.toastService.success('Carrito vaciado'),
                error: () => this.toastService.error('Error al vaciar carrito')
            });
        }
    }

    proceedToCheckout() {
        if (this.cartItems.length === 0) {
            this.toastService.warning('Tu carrito está vacío');
            return;
        }
        this.router.navigate(['/cliente/checkout']);
    }
}
