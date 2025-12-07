import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-producto',
  imports: [CommonModule, FormsModule],
  templateUrl: './producto.html',
  styleUrl: './producto.scss',
})
export class Producto {
  showEditModal = false;
  editProducto = {
    id: 0,
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoria: '',
    imagen: ''
  };

  openEditModal(producto: any) {
    this.showEditModal = true;
    // Cargar datos del producto
    this.editProducto = {
      id: producto.id || 1,
      nombre: producto.nombre || 'Cuy Raza Perú',
      descripcion: producto.descripcion || 'Cuy de raza pura',
      precio: producto.precio || 45.00,
      stock: producto.stock || 25,
      categoria: producto.categoria || 'cuyes-vivos',
      imagen: producto.imagen || 'https://example.com/cuy.jpg'
    };
  }

  closeEditModal() {
    this.showEditModal = false;
  }

  updateProducto() {
    // Aquí irá la lógica para actualizar el producto
    console.log('Actualizando producto:', this.editProducto);
    // TODO: Conectar con el backend
    this.closeEditModal();
  }
}
