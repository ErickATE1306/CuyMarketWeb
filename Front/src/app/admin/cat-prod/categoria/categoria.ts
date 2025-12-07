import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-categoria',
  imports: [CommonModule, FormsModule],
  templateUrl: './categoria.html',
  styleUrl: './categoria.scss',
})
export class Categoria {
  showEditModal = false;
  editCategoria = {
    id: 0,
    nombre: '',
    descripcion: '',
    icono: 'default'
  };

  openEditModal(categoria: any) {
    this.showEditModal = true;
    // Cargar datos de la categoría
    this.editCategoria = {
      id: categoria.id || 1,
      nombre: categoria.nombre || 'Cuyes Vivos',
      descripcion: categoria.descripcion || 'Cuyes de diferentes razas',
      icono: categoria.icono || 'default'
    };
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  updateCategoria() {
    // Aquí irá la lógica para actualizar la categoría
    console.log('Actualizando categoría:', this.editCategoria);
    // TODO: Conectar con el backend
    this.closeEditModal();
  }
}
