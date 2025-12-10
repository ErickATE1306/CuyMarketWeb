import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CategoriaService, Categoria as CategoriaModel } from '../../../compartido/servicios/categoria.service';

@Component({
  selector: 'app-categoria',
  imports: [CommonModule, FormsModule],
  templateUrl: './categoria.html',
  styleUrl: './categoria.scss',
})
export class Categoria implements OnInit {
  showEditModal = false;
  categorias: CategoriaModel[] = [];
  searchTerm = '';

  // Stats
  totalCategorias = 0;
  categoriasActivas = 0;
  productosAsignados = 0;

  editCategoria = {
    id: 0,
    nombre: '',
    descripcion: '',
    activa: true
  };

  constructor(private categoriaService: CategoriaService) { }

  ngOnInit() {
    this.loadCategorias();
  }

  loadCategorias() {
    this.categoriaService.listar().subscribe({
      next: (data) => {
        this.categorias = data;
        this.calculateStats();
      },
      error: (err) => console.error('Error al cargar categorías', err)
    });
  }

  calculateStats() {
    this.totalCategorias = this.categorias.length;
    this.categoriasActivas = this.categorias.filter(c => c.activa).length;
    this.productosAsignados = this.categorias.reduce((sum, c) => sum + (c.totalProductos || 0), 0);
  }

  get filteredCategorias() {
    if (!this.searchTerm) return this.categorias;
    return this.categorias.filter(c => 
      c.nombre.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      c.descripcion?.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }

  openEditModal(categoria: CategoriaModel) {
    this.showEditModal = true;
    this.editCategoria = {
      id: categoria.id,
      nombre: categoria.nombre,
      descripcion: categoria.descripcion || '',
      activa: categoria.activa
    };
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  updateCategoria() {
    this.categoriaService.actualizar(this.editCategoria.id, this.editCategoria).subscribe({
      next: (updatedCategoria) => {
        console.log('Categoría actualizada', updatedCategoria);
        this.loadCategorias();
        this.closeEditModal();
      },
      error: (err) => {
        console.error('Error al actualizar categoría', err);
        alert('Error al actualizar categoría: ' + (err.error?.message || 'Verifique los datos'));
      }
    });
  }

  deleteCategoria(id: number) {
    if (!confirm('¿Está seguro de eliminar esta categoría?')) return;

    this.categoriaService.eliminar(id).subscribe({
      next: () => {
        console.log('Categoría eliminada');
        this.loadCategorias();
      },
      error: (err) => {
        console.error('Error al eliminar categoría', err);
        alert('Error al eliminar categoría: ' + (err.error?.message || 'No se puede eliminar'));
      }
    });
  }
}
