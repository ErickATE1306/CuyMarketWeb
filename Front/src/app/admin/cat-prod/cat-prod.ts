import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Producto } from './producto/producto';
import { Categoria } from './categoria/categoria';

@Component({
  selector: 'app-cat-prod',
  imports: [CommonModule, FormsModule, Producto, Categoria],
  templateUrl: './cat-prod.html',
  styleUrl: './cat-prod.scss',
})
export class CatProd {
  activeTab: 'productos' | 'categorias' = 'categorias';
  showModalCategoria = false;
  showModalProducto = false;

  newCategoria = {
    nombre: '',
    descripcion: '',
    icono: 'default'
  };

  newProducto = {
    nombre: '',
    descripcion: '',
    precio: 0,
    stock: 0,
    categoria: '',
    imagen: ''
  };

  selectTab(tab: 'productos' | 'categorias') {
    this.activeTab = tab;
  }

  openModalCategoria() {
    this.showModalCategoria = true;
    this.newCategoria = {
      nombre: '',
      descripcion: '',
      icono: 'default'
    };
  }

  closeModalCategoria() {
    this.showModalCategoria = false;
  }

  saveCategoria() {
    console.log('Guardando categoría:', this.newCategoria);
    // TODO: Conectar con el backend
    this.closeModalCategoria();
  }

  openModalProducto() {
    this.showModalProducto = true;
    this.newProducto = {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      categoria: '',
      imagen: ''
    };
  }

  closeModalProducto() {
    this.showModalProducto = false;
  }

  saveProducto() {
    console.log('Guardando producto:', this.newProducto);
    // TODO: Conectar con el backend
    this.closeModalProducto();
  }
}
