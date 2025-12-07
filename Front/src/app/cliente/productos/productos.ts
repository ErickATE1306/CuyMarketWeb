import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PaginacionComponent } from '../../compartido/componentes/paginacion/paginacion';
import { EstadoVacioComponent } from '../../compartido/componentes/estado-vacio/estado-vacio';
import { StorageService } from '../../compartido/servicios/storage.service';
import { ToastService } from '../../compartido/servicios/toast.service';

interface Producto {
  id: string;
  nombre: string;
  raza: string;
  peso: string;
  precio: number;
  categoria: string;
  tipo: string;
  certificado: boolean;
  descripcion: string;
  caracteristicas: string[];
  imagenes: string[];
}

@Component({
  selector: 'app-productos',
  standalone: true,
  imports: [CommonModule, FormsModule, PaginacionComponent, EstadoVacioComponent],
  templateUrl: './productos.html',
  styleUrl: './productos.scss',
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

  // Opciones de filtros
  categorias = ['Todas', 'Cuyes Vivos', 'Carne de Cuy', 'Servicios'];
  razas = ['Todas', 'Raza Perú', 'Raza Andina', 'Raza Inti', 'N/A'];
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
    private toastService: ToastService
  ) {}

  ngOnInit() {
    this.cargarProductos();
    this.aplicarFiltros();
  }

  cargarProductos() {
    // Datos de productos - mismo que producto-detalle.ts
    this.todosLosProductos = [
      {
        id: 'cuy-reproductor-peruano',
        nombre: 'Cuy Reproductor Peruano',
        raza: 'Raza Perú',
        peso: '900-1200g',
        precio: 45.00,
        categoria: 'Cuyes Vivos',
        tipo: 'Reproductor',
        certificado: true,
        descripcion: 'Cuy reproductor de raza Perú certificada, ideal para iniciar o mejorar tu crianza.',
        caracteristicas: ['Raza pura certificada', 'Edad: 3-4 meses', 'Vacunado y desparasitado', 'Garantía de salud', 'Asesoría de crianza incluida'],
        imagenes: ['https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800', 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800']
      },
      {
        id: 'cuy-reproductor-andino',
        nombre: 'Cuy Reproductor Andino',
        raza: 'Raza Andina',
        peso: '950-1200g',
        precio: 48.00,
        categoria: 'Cuyes Vivos',
        tipo: 'Reproductor',
        certificado: false,
        descripcion: 'Cuy reproductor de raza Andina con excelentes características para reproducción.',
        caracteristicas: ['Raza pura seleccionada', 'Edad: 3-4 meses', 'Alta prolificidad', 'Adaptable a diferentes climas'],
        imagenes: ['https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800']
      },
      {
        id: 'cuy-gestante',
        nombre: 'Cuy Gestante',
        raza: 'Raza Perú',
        peso: '900-1300g',
        precio: 55.00,
        categoria: 'Cuyes Vivos',
        tipo: 'Gestante',
        certificado: true,
        descripcion: 'Hembra gestante de raza Perú con 20-25 días de preñez.',
        caracteristicas: ['Preñez confirmada', 'Control veterinario', 'Primera cría garantizada', 'Excelente línea genética'],
        imagenes: ['https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800']
      },
      {
        id: 'gazapo-inti',
        nombre: 'Gazapo Inti',
        raza: 'Raza Inti',
        peso: '300-500g',
        precio: 25.00,
        categoria: 'Cuyes Vivos',
        tipo: 'Gazapo',
        certificado: false,
        descripcion: 'Gazapo de raza Inti, ideal para iniciar tu crianza con inversión moderada.',
        caracteristicas: ['Edad: 1-2 meses', 'Destetado correctamente', 'Buena genética', 'Rápido crecimiento'],
        imagenes: ['https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800']
      },
      {
        id: 'raza-inti-reproductor',
        nombre: 'Cuy Reproductor Inti',
        raza: 'Raza Inti',
        peso: '1000-1300g',
        precio: 52.00,
        categoria: 'Cuyes Vivos',
        tipo: 'Reproductor',
        certificado: true,
        descripcion: 'Cuy reproductor de raza Inti certificada, reconocido por su rápido crecimiento.',
        caracteristicas: ['Raza Inti certificada', 'Edad: 4-5 meses', 'Crecimiento acelerado', 'Alta conversión alimenticia'],
        imagenes: ['https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800']
      },
      {
        id: 'cuy-entero-eviscerado',
        nombre: 'Cuy Entero Eviscerado',
        raza: 'Raza Perú',
        peso: '700-900g',
        precio: 38.00,
        categoria: 'Carne de Cuy',
        tipo: 'Entero',
        certificado: true,
        descripcion: 'Cuy entero eviscerado listo para preparar. Producto fresco de alta calidad.',
        caracteristicas: ['Producto fresco del día', 'Eviscerado y limpio', 'Certificado SENASA', 'Empacado al vacío'],
        imagenes: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800']
      },
      {
        id: 'cuy-porcionado-premium',
        nombre: 'Cuy Porcionado Premium',
        raza: 'Raza Perú',
        peso: '600-800g',
        precio: 42.00,
        categoria: 'Carne de Cuy',
        tipo: 'Porcionado',
        certificado: true,
        descripcion: 'Cuy porcionado en piezas ideales para diferentes preparaciones.',
        caracteristicas: ['Corte profesional en 4 piezas', 'Producto fresco', 'Empaque individual', 'Certificación sanitaria'],
        imagenes: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800']
      },
      {
        id: 'cuy-congelado',
        nombre: 'Cuy Congelado',
        raza: 'Raza Perú',
        peso: '700-900g',
        precio: 35.00,
        categoria: 'Carne de Cuy',
        tipo: 'Congelado',
        certificado: true,
        descripcion: 'Cuy entero eviscerado congelado mediante técnica IQF.',
        caracteristicas: ['Congelado IQF', 'Duración: hasta 6 meses', 'Conserva propiedades nutricionales', 'Empaque hermético'],
        imagenes: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800']
      },
      {
        id: 'combo-familiar-4-cuyes',
        nombre: 'Combo Familiar 4 Cuyes',
        raza: 'Raza Perú',
        peso: '2.8-3.6kg total',
        precio: 145.00,
        categoria: 'Carne de Cuy',
        tipo: 'Combo',
        certificado: true,
        descripcion: 'Combo familiar con 4 cuyes enteros eviscerados. Precio especial para eventos.',
        caracteristicas: ['4 cuyes enteros eviscerados', 'Peso promedio: 700-900g c/u', 'Producto fresco', 'Ahorro del 15%'],
        imagenes: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800']
      },
      {
        id: 'cuy-marinado-especias',
        nombre: 'Cuy Marinado con Especias',
        raza: 'Raza Perú',
        peso: '700-900g',
        precio: 44.00,
        categoria: 'Carne de Cuy',
        tipo: 'Marinado',
        certificado: true,
        descripcion: 'Cuy entero pre-marinado con especias andinas. Listo para hornear o freír.',
        caracteristicas: ['Marinado 24 horas', 'Especias naturales andinas', 'Listo para cocinar', 'Sabor tradicional'],
        imagenes: ['https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800']
      },
      {
        id: 'servicio-beneficio-domicilio',
        nombre: 'Servicio de Beneficio a Domicilio',
        raza: 'N/A',
        peso: 'N/A',
        precio: 15.00,
        categoria: 'Servicios',
        tipo: 'Servicio',
        certificado: true,
        descripcion: 'Servicio profesional de beneficio de cuyes a domicilio.',
        caracteristicas: ['Personal certificado SENASA', 'Herramientas profesionales', 'Proceso higiénico garantizado', 'A domicilio en Lima'],
        imagenes: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800']
      },
      {
        id: 'asesoria-crianza-basica',
        nombre: 'Asesoría de Crianza Básica',
        raza: 'N/A',
        peso: 'N/A',
        precio: 80.00,
        categoria: 'Servicios',
        tipo: 'Asesoría',
        certificado: false,
        descripcion: 'Asesoría completa para iniciar tu crianza de cuyes.',
        caracteristicas: ['Visita a instalaciones', 'Evaluación de infraestructura', 'Plan de crianza personalizado', 'Seguimiento 1 mes'],
        imagenes: ['https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800']
      }
    ];
  }

  aplicarFiltros() {
    let resultados = [...this.todosLosProductos];

    // Filtro de búsqueda
    if (this.searchTerm.trim()) {
      const termLower = this.searchTerm.toLowerCase().trim();
      resultados = resultados.filter(p => 
        p.nombre.toLowerCase().includes(termLower) ||
        p.descripcion.toLowerCase().includes(termLower) ||
        p.tipo.toLowerCase().includes(termLower)
      );
      
      // Guardar en historial de búsqueda
      this.storageService.addToSearchHistory(this.searchTerm.trim());
    }

    // Filtro de categoría
    if (this.selectedCategoria !== 'Todas') {
      resultados = resultados.filter(p => p.categoria === this.selectedCategoria);
    }

    // Filtro de raza
    if (this.selectedRaza !== 'Todas') {
      resultados = resultados.filter(p => p.raza === this.selectedRaza);
    }

    // Filtro de precio
    if (this.selectedPrecio !== 'Todos') {
      const rango = this.rangosPrecios.find(r => r.label === this.selectedPrecio);
      if (rango) {
        resultados = resultados.filter(p => p.precio >= rango.min && p.precio < rango.max);
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
        return productos.sort((a, b) => a.precio - b.precio);
      case 'precio-desc':
        return productos.sort((a, b) => b.precio - a.precio);
      case 'nombre':
        return productos.sort((a, b) => a.nombre.localeCompare(b.nombre));
      case 'destacado':
      default:
        return productos; // Sin ordenar (orden original)
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
    // Scroll al inicio de la sección de productos
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

  viewProductDetail(productId: string) {
    this.router.navigate(['/cliente/productos', productId]);
  }

  isInWishlist(productId: string): boolean {
    return this.storageService.isInWishlist(productId);
  }

  toggleWishlist(productId: string) {
    if (this.isInWishlist(productId)) {
      this.storageService.removeFromWishlist(productId);
      this.toastService.info('Producto eliminado de favoritos');
    } else {
      this.storageService.addToWishlist(productId);
      this.toastService.success('Producto agregado a favoritos');
    }
  }
}
