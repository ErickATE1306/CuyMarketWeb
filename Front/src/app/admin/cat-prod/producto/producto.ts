import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto as ProductoModel } from '../../../compartido/servicios/producto.service';
import { CategoriaService, Categoria as CategoriaModel } from '../../../compartido/servicios/categoria.service';

@Component({
  selector: 'app-producto',
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.html',
  styleUrl: './producto.scss',
})
export class Producto implements OnInit {
  showEditModal = false;
  productos: ProductoModel[] = [];
  categorias: CategoriaModel[] = [];
  searchTerm = '';

  // Stats
  totalProductos = 0;
  productosActivos = 0;
  stockTotal = 0;

  editProducto = {
    id: 0,
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
    private productoService: ProductoService,
    private categoriaService: CategoriaService
  ) { }

  ngOnInit() {
    this.loadProductos();
    this.loadCategorias();
  }

  loadProductos() {
    this.productoService.listar().subscribe({
      next: (data) => {
        console.log('Productos recibidos:', data);
        this.productos = data;
        this.calculateStats();
      },
      error: (err) => {
        console.error('Error al cargar productos', err);
        alert('Error al cargar productos. Revisa la consola para más detalles.');
      }
    });
  }

  loadCategorias() {
    this.categoriaService.listar().subscribe({
      next: (data) => {
        this.categorias = data;
      },
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }

  calculateStats() {
    this.totalProductos = this.productos.length;
    this.productosActivos = this.productos.filter(p => p.activo).length;
    this.stockTotal = this.productos.reduce((sum, p) => sum + (p.stockDisponible || 0), 0);
  }

  get filteredProductos() {
    if (!this.searchTerm) return this.productos;
    return this.productos.filter(p => 
      p.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.raza?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      p.tipo?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openEditModal(producto: ProductoModel) {
    this.showEditModal = true;
    this.editProducto = {
      id: producto.id,
      nombre: producto.nombre,
      raza: producto.raza,
      peso: producto.peso,
      precio: Number(producto.precio),
      tipo: producto.tipo,
      certificado: producto.certificado,
      descripcion: producto.descripcion || '',
      caracteristicas: producto.caracteristicas || '',
      imagen: producto.imagen || '',
      categoriaId: producto.categoriaId,
      activo: producto.activo,
      stockDisponible: producto.stockDisponible || 0,
      stockMinimo: producto.stockMinimo || 5
    };
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  updateProducto() {
    if (!this.editProducto.categoriaId || this.editProducto.categoriaId === 0) {
      alert('Debe seleccionar una categoría');
      return;
    }

    this.productoService.actualizar(this.editProducto.id, this.editProducto).subscribe({
      next: (updatedProducto) => {
        console.log('Producto actualizado', updatedProducto);
        this.loadProductos();
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Error al actualizar producto', err);
        alert('Error al actualizar producto: ' + (err.error?.message || 'Verifique los datos'));
      }
    });
  }

  deleteProducto(id: number) {
    if (!confirm('¿Está seguro de eliminar este producto?')) return;

    this.productoService.eliminar(id).subscribe({
      next: () => {
        console.log('Producto eliminado');
        this.loadProductos();
      },
      error: (err) => {
        console.error('Error al eliminar producto', err);
        alert('Error al eliminar producto: ' + (err.error?.message || 'No se puede eliminar'));
      }
    });
  }

  onEditImagenSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        this.editProducto.imagen = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}
