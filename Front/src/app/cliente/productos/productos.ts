import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginacionComponent } from '../../compartido/componentes/paginacion/paginacion';
import { EstadoVacioComponent } from '../../compartido/componentes/estado-vacio/estado-vacio';
import { StorageService } from '../../compartido/servicios/storage.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { ProductoService, Producto } from '../../compartido/servicios/producto.service';
import { CarritoService } from '../../compartido/servicios/carrito.service';
import { AuthService } from '../../compartido/servicios/auth.service';

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent, EstadoVacioComponent],
  templateUrl: './productos.html',
  styleUrl: './productos.scss'
})
export class Productos implements OnInit {
  // Búsqueda y filtros
  searchTerm: string = '';
  selectedCategoria: string = 'Todas';
  selectedRaza: string = 'Todas';
  selectedPrecio: string = 'Todos';
  selectedOrden: string = 'destacado';

  // Paginación
  currentPage: number = 1;
  itemsPerPage: number = 9;
  totalItems: number = 0;
  totalPages: number = 0;

  // Productos
  todosLosProductos: Producto[] = [];
  productosFiltrados: Producto[] = [];
  productosPaginados: Producto[] = [];

  // Estado de carga
  loading: boolean = false;

  // Opciones de filtros dinámicas
  categorias: string[] = ['Todas'];
  razas: string[] = ['Todas'];
  rangosPrecios = [
    { label: 'Todos', min: 0, max: Infinity },
    { label: 'Menos de S/30', min: 0, max: 30 },
    { label: 'S/30 - S/50', min: 30, max: 50 },
    { label: 'S/50 - S/100', min: 50, max: 100 },
    { label: 'Más de S/100', min: 100, max: Infinity }
  ];

  constructor(
    private router: Router,
    private storageService: StorageService,
    private toastService: ToastService,
    private productoService: ProductoService,
    private carritoService: CarritoService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.cargarProductos();
  }

  cargarProductos() {
    this.loading = true;
    this.productoService.listar().subscribe({
      next: (productos) => {
        this.todosLosProductos = productos.filter(p => p.activo);
        
        // Extraer categorías únicas
        const categoriasSet = new Set<string>();
        productos.forEach(p => {
          if (p.categoriaNombre) {
            categoriasSet.add(p.categoriaNombre);
          }
        });
        this.categorias = ['Todas', ...Array.from(categoriasSet).sort()];

        // Extraer razas únicas
        const razasSet = new Set<string>();
        productos.forEach(p => {
          if (p.raza && p.raza.trim() !== '') {
            razasSet.add(p.raza);
          }
        });
        this.razas = ['Todas', ...Array.from(razasSet).sort()];

        this.loading = false;
        this.aplicarFiltros();
      },
      error: (err) => {
        console.error('Error cargando productos', err);
        this.toastService.error('Error al cargar el catálogo de productos');
        this.loading = false;
      }
    });
  }

  aplicarFiltros() {
    let resultados = [...this.todosLosProductos];

    // Filtro de búsqueda
    if (this.searchTerm.trim()) {
      const termLower = this.searchTerm.toLowerCase().trim();
      resultados = resultados.filter(p =>
        p.nombre.toLowerCase().includes(termLower) ||
        (p.descripcion && p.descripcion.toLowerCase().includes(termLower)) ||
        (p.tipo && p.tipo.toLowerCase().includes(termLower)) ||
        (p.raza && p.raza.toLowerCase().includes(termLower))
      );

      // Guardar en historial de búsqueda
      this.storageService.addToSearchHistory(this.searchTerm.trim());
    }

    // Filtro de categoría
    if (this.selectedCategoria !== 'Todas') {
      resultados = resultados.filter(p => p.categoriaNombre === this.selectedCategoria);
    }

    // Filtro de raza
    if (this.selectedRaza !== 'Todas') {
      resultados = resultados.filter(p => p.raza === this.selectedRaza);
    }

    // Filtro de precio
    if (this.selectedPrecio !== 'Todos') {
      const rango = this.rangosPrecios.find(r => r.label === this.selectedPrecio);
      if (rango) {
        resultados = resultados.filter(p => {
          const precio = Number(p.precio);
          return precio >= rango.min && precio < rango.max;
        });
      }
    }

    // Ordenamiento
    resultados = this.ordenarProductos(resultados);

    // Actualizar productos filtrados
    this.productosFiltrados = resultados;
    this.totalItems = resultados.length;
    this.totalPages = Math.ceil(this.totalItems / this.itemsPerPage);

    // Resetear a página 1 al filtrar
    this.currentPage = 1;
    this.actualizarPaginacion();
  }

  ordenarProductos(productos: Producto[]): Producto[] {
    switch (this.selectedOrden) {
      case 'precio-asc':
        return productos.sort((a, b) => Number(a.precio) - Number(b.precio));
      case 'precio-desc':
        return productos.sort((a, b) => Number(b.precio) - Number(a.precio));
      case 'nombre':
        return productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'destacado':
      default:
        return productos;
    }
  }

  actualizarPaginacion() {
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    this.productosPaginados = this.productosFiltrados.slice(startIndex, endIndex);
  }

  onPageChange(page: number) {
    this.currentPage = page;
    this.actualizarPaginacion();
    window.scrollTo({ top: 300, behavior: 'smooth' });
  }

  limpiarFiltros() {
    this.searchTerm = '';
    this.selectedCategoria = 'Todas';
    this.selectedRaza = 'Todas';
    this.selectedPrecio = 'Todos';
    this.selectedOrden = 'destacado';
    this.aplicarFiltros();
  }

  viewProductDetail(productId: number) {
    this.router.navigate(['/cliente/productos', productId]);
  }

  isInWishlist(productId: number): boolean {
    return this.storageService.isInWishlist(productId.toString());
  }

  toggleWishlist(productId: number, event: Event) {
    event.stopPropagation();
    const idStr = productId.toString();
    if (this.isInWishlist(productId)) {
      this.storageService.removeFromWishlist(idStr);
      this.toastService.info('Producto eliminado de favoritos');
    } else {
      this.storageService.addToWishlist(idStr);
      this.toastService.success('Producto agregado a favoritos');
    }
  }

  addToCart(producto: Producto, event: Event) {
    event.stopPropagation();

    // Verificar autenticación
    if (!this.authService.isAuthenticated()) {
      this.toastService.warning('Debes iniciar sesión para agregar productos al carrito');
      this.router.navigate(['/auth/login']);
      return;
    }

    this.carritoService.agregarProducto(producto.id, 1).subscribe({
      next: () => {
        this.toastService.success(`${producto.nombre} agregado al carrito`);
        // NO navegar, solo mostrar el mensaje de éxito
      },
      error: (err) => {
        console.error('Error al agregar al carrito', err);
        if (err.status === 401) {
          this.toastService.error('Debes iniciar sesión');
          this.router.navigate(['/auth/login']);
        } else if (err.status === 404) {
          this.toastService.error('Producto no encontrado');
        } else {
          this.toastService.error('Error al agregar producto. Por favor, intenta de nuevo.');
        }
      }
    });
  }
}
