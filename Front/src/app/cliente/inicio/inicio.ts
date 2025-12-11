import { Component, OnInit } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common'; // Importar CommonModule para *ngIf y *ngFor en templates viejos o @for en nuevos
import { ProductoService, Producto } from '../../compartido/servicios/producto.service';
import { CarritoService } from '../../compartido/servicios/carrito.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { AuthService } from '../../compartido/servicios/auth.service';

@Component({
  selector: 'app-inicio',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './inicio.html',
  styleUrl: './inicio.scss',
})
export class Inicio implements OnInit {
  productosVivos: Producto[] = [];
  carneCuy: Producto[] = [];
  loading: boolean = true;

  constructor(
    private router: Router,
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private toastService: ToastService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.loading = true;
    this.productoService.listar().subscribe({
      next: (response) => {
        const todos = response;
        // Filtrar por categoría si el backend devuelve categoría o basándose en nombre/tipo
        // Nota: Ajustar condición según los datos reales del backend
        this.productosVivos = todos.filter(p =>
          (p.categoriaNombre && p.categoriaNombre.toLowerCase().includes('vivo')) ||
          (p.nombre.toLowerCase().includes('reproductor') || p.nombre.toLowerCase().includes('gazapo') || p.nombre.toLowerCase().includes('gestante'))
        ).slice(0, 4);

        this.carneCuy = todos.filter(p =>
          (p.categoriaNombre && p.categoriaNombre.toLowerCase().includes('carne')) ||
          (p.nombre.toLowerCase().includes('carne') || p.nombre.toLowerCase().includes('eviscerado') || p.nombre.toLowerCase().includes('congelado') || p.nombre.toLowerCase().includes('combo') || p.nombre.toLowerCase().includes('porcionado'))
        ).slice(0, 4);

        this.loading = false;
      },
      error: (err) => {
        console.error('Error cargando productos inicio', err);
        this.loading = false;
      }
    });
  }

  viewProductDetail(productId: string | number) {
    this.router.navigate(['/cliente/productos', productId]);
  }

  addToCart(producto: Producto, event?: Event) {
    if (event) {
      event.stopPropagation();
    }

    this.carritoService.agregarProducto(producto.id, 1).subscribe({
      next: () => {
        this.toastService.success(`${producto.nombre} agregado al carrito`);
      },
      error: (err) => {
        console.error('Error al agregar al carrito', err);
        if (err.status === 404) {
          this.toastService.error('Producto no encontrado');
        } else {
          // Si no está logueado, igual se agregó localmente
          this.toastService.success(`${producto.nombre} agregado al carrito`);
        }
      }
    });
  }
}
