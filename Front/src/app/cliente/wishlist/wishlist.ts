import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StorageService } from '../../compartido/servicios/storage.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { EstadoVacioComponent } from '../../compartido/componentes/estado-vacio/estado-vacio';

interface ProductoWishlist {
  id: string;
  nombre: string;
  precio: number;
  peso: string;
  categoria: string;
  imagen: string;
  agregadoEl: string;
}

@Component({
  selector: 'app-wishlist',
  standalone: true,
  imports: [CommonModule, EstadoVacioComponent],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.scss'
})
export class Wishlist implements OnInit {
  wishlistItems: ProductoWishlist[] = [];

  // Datos de productos completos
  todosLosProductos: any[] = [
    {
      id: 'cuy-reproductor-peruano',
      nombre: 'Cuy Reproductor Peruano',
      precio: 45.00,
      peso: '900-1200g',
      categoria: 'Cuyes Vivos',
      imagen: 'https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800'
    },
    {
      id: 'cuy-reproductor-andino',
      nombre: 'Cuy Reproductor Andino',
      precio: 48.00,
      peso: '950-1200g',
      categoria: 'Cuyes Vivos',
      imagen: 'https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800'
    },
    {
      id: 'cuy-gestante',
      nombre: 'Cuy Gestante',
      precio: 55.00,
      peso: '900-1300g',
      categoria: 'Cuyes Vivos',
      imagen: 'https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800'
    },
    {
      id: 'gazapo-inti',
      nombre: 'Gazapo Inti',
      precio: 25.00,
      peso: '300-500g',
      categoria: 'Cuyes Vivos',
      imagen: 'https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800'
    },
    {
      id: 'raza-inti-reproductor',
      nombre: 'Cuy Reproductor Inti',
      precio: 52.00,
      peso: '1000-1300g',
      categoria: 'Cuyes Vivos',
      imagen: 'https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800'
    },
    {
      id: 'cuy-entero-eviscerado',
      nombre: 'Cuy Entero Eviscerado',
      precio: 38.00,
      peso: '700-900g',
      categoria: 'Carne de Cuy',
      imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'
    },
    {
      id: 'cuy-porcionado-premium',
      nombre: 'Cuy Porcionado Premium',
      precio: 42.00,
      peso: '600-800g',
      categoria: 'Carne de Cuy',
      imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'
    },
    {
      id: 'cuy-congelado',
      nombre: 'Cuy Congelado',
      precio: 35.00,
      peso: '700-900g',
      categoria: 'Carne de Cuy',
      imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'
    },
    {
      id: 'combo-familiar-4-cuyes',
      nombre: 'Combo Familiar 4 Cuyes',
      precio: 145.00,
      peso: '2.8-3.6kg total',
      categoria: 'Carne de Cuy',
      imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'
    },
    {
      id: 'cuy-marinado-especias',
      nombre: 'Cuy Marinado con Especias',
      precio: 44.00,
      peso: '700-900g',
      categoria: 'Carne de Cuy',
      imagen: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'
    }
  ];

  constructor(
    private storageService: StorageService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.cargarWishlist();
  }

  cargarWishlist() {
    const wishlistIds = this.storageService.getWishlist();
    this.wishlistItems = wishlistIds
      .map((item: any) => {
        const producto = this.todosLosProductos.find(p => p.id === item.productId);
        if (producto) {
          return {
            ...producto,
            agregadoEl: item.addedAt
          };
        }
        return null;
      })
      .filter((item: any) => item !== null) as ProductoWishlist[];
  }

  removeFromWishlist(productId: string) {
    this.storageService.removeFromWishlist(productId);
    this.cargarWishlist();
    this.toastService.info('Producto eliminado de favoritos');
  }

  addToCart(producto: ProductoWishlist) {
    const cart = localStorage.getItem('cart');
    let cartItems = cart ? JSON.parse(cart) : [];
    
    const existingItem = cartItems.find((item: any) => item.id === producto.id);
    
    if (existingItem) {
      existingItem.cantidad += 1;
    } else {
      cartItems.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: 1,
        categoria: producto.categoria,
        peso: producto.peso
      });
    }
    
    localStorage.setItem('cart', JSON.stringify(cartItems));
    window.dispatchEvent(new Event('cart-updated'));
    
    this.toastService.success('Producto agregado al carrito');
  }

  viewProduct(productId: string) {
    this.router.navigate(['/cliente/productos', productId]);
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-PE', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  }
}
