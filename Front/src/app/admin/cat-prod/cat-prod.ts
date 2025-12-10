import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from './producto/producto';
import { Categoria } from './categoria/categoria';
import { CategoriaService, Categoria as CategoriaModel } from '../../compartido/servicios/categoria.service';
import { ProductoService, Producto as ProductoModel } from '../../compartido/servicios/producto.service';

@Component({
  selector: 'app-cat-prod',
  imports: [CommonModule, FormsModule, Producto, Categoria],
  templateUrl: './cat-prod.html',
  styleUrl: './cat-prod.scss',
})
export class CatProd implements OnInit {
  activeTab: 'productos' | 'categorias' = 'categorias';
  showModalCategoria = false;
  showModalProducto = false;

  // Data
  categorias: CategoriaModel[] = [];
  productos: ProductoModel[] = [];

  // Stats
  totalCategorias = 0;
  categoriasActivas = 0;
  totalProductos = 0;

  newCategoria = {
    nombre: '',
    descripcion: '',
    activa: true
  };

  newProducto = {
    nombre: '',
    raza: '',
    peso: 0,
    precio: 0,
    tipo: '',
    certificado: 'No',
    descripcion: '',
    caracteristicas: '',
    imagen: '',
    categoriaId: 0,
    activo: true,
    stockDisponible: 0,
    stockMinimo: 5
  };

  constructor(
    private categoriaService: CategoriaService,
    private productoService: ProductoService
  ) { }

  ngOnInit() {
    this.loadCategorias();
    this.loadProductos();
  }

  loadCategorias() {
    this.categoriaService.listar().subscribe({
      next: (data) => {
        this.categorias = data;
        this.calculateCategoriaStats();
      },
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }

  loadProductos() {
    this.productoService.listar().subscribe({
      next: (data) => {
        this.productos = data;
        this.totalProductos = data.length;
      },
      error: (err) => console.error('Error al cargar productos', err)
    });
  }

  calculateCategoriaStats() {
    this.totalCategorias = this.categorias.length;
    this.categoriasActivas = this.categorias.filter(c => c.activa).length;
  }

  selectTab(tab: 'productos' | 'categorias') {
    this.activeTab = tab;
  }

  openModalCategoria() {
    this.showModalCategoria = true;
    this.newCategoria = {
      nombre: '',
      descripcion: '',
      activa: true
    };
  }

  closeModalCategoria() {
    this.showModalCategoria = false;
  }

  saveCategoria() {
    this.categoriaService.crear(this.newCategoria).subscribe({
      next: (createdCategoria) => {
        console.log('Categoría creada', createdCategoria);
        this.loadCategorias();
        this.closeModalCategoria();
      },
      error: (err) => {
        console.error('Error al crear categoría', err);
        alert('Error al crear categoría: ' + (err.error?.message || 'Verifique los datos'));
      }
    });
  }

  openModalProducto() {
    this.showModalProducto = true;
    this.newProducto = {
      nombre: '',
      raza: '',
      peso: 0,
      precio: 0,
      tipo: '',
      certificado: 'No',
      descripcion: '',
      caracteristicas: '',
      imagen: '',
      categoriaId: 0,
      activo: true,
      stockDisponible: 0,
      stockMinimo: 5
    };
  }

  closeModalProducto() {
    this.showModalProducto = false;
  }

  saveProducto() {
    if (!this.newProducto.categoriaId || this.newProducto.categoriaId === 0) {
      alert('Debe seleccionar una categoría');
      return;
    }

    this.productoService.crear(this.newProducto).subscribe({
      next: (createdProducto) => {
        console.log('Producto creado', createdProducto);
        this.loadProductos();
        this.closeModalProducto();
      },
      error: (err) => {
        console.error('Error al crear producto', err);
        alert('Error al crear producto: ' + (err.error?.message || 'Verifique los datos'));
      }
    });
  }

  onImagenSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.newProducto.imagen = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
