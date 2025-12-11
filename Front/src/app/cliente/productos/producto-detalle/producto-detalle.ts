import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProductoService, Producto } from '../../../compartido/servicios/producto.service';
import { CarritoService } from '../../../compartido/servicios/carrito.service';
import { ToastService } from '../../../compartido/servicios/toast.service';
import { AuthService } from '../../../compartido/servicios/auth.service';
import { FormularioResenaComponent } from '../../../compartido/componentes/formulario-resena/formulario-resena';
import { ListaResenasComponent } from '../../../compartido/componentes/lista-resenas/lista-resenas';
import { BotonesCompartirComponent } from '../../../compartido/componentes/botones-compartir/botones-compartir';
import { CalculadoraEnvioComponent } from '../../../compartido/componentes/calculadora-envio/calculadora-envio';

@Component({
    selector: 'app-producto-detalle',
    standalone: true,
    imports: [CommonModule, RouterLink, FormularioResenaComponent, ListaResenasComponent, BotonesCompartirComponent, CalculadoraEnvioComponent],
    templateUrl: './producto-detalle.html',
    styleUrl: './producto-detalle.scss',
})
export class ProductoDetalle implements OnInit {
    producto: Producto | null = null;
    cantidad: number = 1;
    selectedImage: number = 0;
    loading: boolean = true;
    error: boolean = false;
    caracteristicasArray: string[] = [];

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private productoService: ProductoService,
        private carritoService: CarritoService,
        private toastService: ToastService,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = +params['id']; // Convertir a número
            if (!id) {
                this.router.navigate(['/cliente/productos']);
                return;
            }
            this.cargarProducto(id);
        });
    }

    cargarProducto(id: number) {
        this.loading = true;
        this.error = false;
        
        this.productoService.obtenerPorId(id).subscribe({
            next: (data) => {
                this.producto = data;
                
                // Procesar características si vienen como string
                if (data.caracteristicas) {
                    this.caracteristicasArray = data.caracteristicas
                        .split('\n')
                        .filter(c => c.trim().length > 0);
                }
                
                this.loading = false;
            },
            error: (err) => {
                console.error('Error cargando producto', err);
                this.error = true;
                this.loading = false;
                if (err.status === 404) {
                    this.toastService.error('Producto no encontrado');
                } else {
                    this.toastService.error('No se pudo cargar el producto');
                }
                // Redirigir después de 2 segundos
                setTimeout(() => {
                    this.router.navigate(['/cliente/productos']);
                }, 2000);
            }
        });
    }

    selectImage(index: number) {
        this.selectedImage = index;
    }

    updateQuantity(change: number) {
        this.cantidad += change;
        if (this.cantidad < 1) {
            this.cantidad = 1;
        }
        // Limitar por stock disponible
        if (this.producto && this.producto.stockDisponible && this.cantidad > this.producto.stockDisponible) {
            this.cantidad = this.producto.stockDisponible;
            this.toastService.warning(`Solo hay ${this.producto.stockDisponible} unidades disponibles`);
        }
    }

    addToCart() {
        if (!this.producto) return;

        // Verificar stock
        if (this.producto.stockDisponible !== undefined && this.cantidad > this.producto.stockDisponible) {
            this.toastService.error('No hay suficiente stock disponible');
            return;
        }

        this.carritoService.agregarProducto(this.producto.id, this.cantidad).subscribe({
            next: () => {
                this.toastService.success(`${this.cantidad} ${this.producto!.nombre} agregado(s) al carrito`);
                // Resetear cantidad
                this.cantidad = 1;
            },
            error: (err) => {
                console.error('Error al agregar al carrito', err);
                // Si no está logueado, igual se agregó localmente
                this.toastService.success(`${this.cantidad} ${this.producto!.nombre} agregado(s) al carrito`);
                this.cantidad = 1;
            }
        });
    }

    buyNow() {
        if (!this.producto) return;

        // Verificar autenticación para comprar directamente
        if (!this.authService.isAuthenticated()) {
            this.toastService.warning('Debes iniciar sesión para comprar');
            this.router.navigate(['/auth/login']);
            return;
        }

        // Verificar stock
        if (this.producto.stockDisponible !== undefined && this.cantidad > this.producto.stockDisponible) {
            this.toastService.error('No hay suficiente stock disponible');
            return;
        }

        this.carritoService.agregarProducto(this.producto.id, this.cantidad).subscribe({
            next: () => {
                this.router.navigate(['/cliente/checkout']);
            },
            error: (err) => {
                console.error('Error al agregar al carrito', err);
                this.toastService.error('Error al procesar la compra');
            }
        });
    }

    onReviewSubmitted() {
        // Recargar el producto o solo las reseñas si hubiera endpoint separado
        // this.cargarProducto(this.producto.id);
    }

    onShippingCalculated(result: any) {
        console.log('Costo de envío calculado:', result);
    }

    getCurrentUrl(): string {
        return window.location.href;
    }
}
