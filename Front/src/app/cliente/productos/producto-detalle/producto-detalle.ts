import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormularioResenaComponent } from '../../../compartido/componentes/formulario-resena/formulario-resena';
import { ListaResenasComponent } from '../../../compartido/componentes/lista-resenas/lista-resenas';
import { BotonesCompartirComponent } from '../../../compartido/componentes/botones-compartir/botones-compartir';
import { CalculadoraEnvioComponent } from '../../../compartido/componentes/calculadora-envio/calculadora-envio';

@Component({
    selector: 'app-producto-detalle',
    standalone: true,
    imports: [CommonModule, RouterLink, FormularioResenaComponent, ListaResenasComponent, BotonesCompartirComponent, CalculadoraEnvioComponent],
    templateUrl: './producto-detalle.html',
    styleUrl: './producto-detalle.scss',
})
export class ProductoDetalle implements OnInit {
    producto: any = null;
    cantidad: number = 1;
    selectedImage: number = 0;

    // Datos de ejemplo de productos
    productos: any = {
        'cuy-reproductor-peruano': {
            id: 'cuy-reproductor-peruano',
            nombre: 'Cuy Reproductor Peruano',
            raza: 'Raza Perú',
            peso: '900-1200g',
            precio: 45.00,
            categoria: 'Cuyes Vivos',
            tipo: 'Reproductor',
            certificado: true,
            descripcion: 'Cuy reproductor de raza Perú certificada, ideal para iniciar o mejorar tu crianza. Excelente genética y características fenotípicas superiores.',
            caracteristicas: [
                'Raza pura certificada',
                'Edad: 3-4 meses',
                'Vacunado y desparasitado',
                'Garantía de salud',
                'Asesoría de crianza incluida'
            ],
            imagenes: [
                'https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800',
                'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800',
                'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=800'
            ]
        },
        'cuy-reproductor-andino': {
            id: 'cuy-reproductor-andino',
            nombre: 'Cuy Reproductor Andino',
            raza: 'Raza Andina',
            peso: '950-1200g',
            precio: 48.00,
            categoria: 'Cuyes Vivos',
            tipo: 'Reproductor',
            certificado: false,
            descripcion: 'Cuy reproductor de raza Andina con excelentes características para reproducción. Alta prolificidad y resistencia.',
            caracteristicas: [
                'Raza pura seleccionada',
                'Edad: 3-4 meses',
                'Alta prolificidad',
                'Adaptable a diferentes climas',
                'Buena conversión alimenticia'
            ],
            imagenes: [
                'https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800'
            ]
        },
        'cuy-gestante': {
            id: 'cuy-gestante',
            nombre: 'Cuy Gestante',
            raza: 'Raza Perú',
            peso: '900-1300g',
            precio: 55.00,
            categoria: 'Cuyes Vivos',
            tipo: 'Gestante',
            certificado: true,
            descripcion: 'Hembra gestante de raza Perú con 20-25 días de preñez. Producción inmediata garantizada.',
            caracteristicas: [
                'Preñez confirmada',
                'Control veterinario',
                'Primera cría garantizada',
                'Excelente línea genética',
                'Seguimiento post-venta'
            ],
            imagenes: [
                'https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800'
            ]
        },
        'gazapo-inti': {
            id: 'gazapo-inti',
            nombre: 'Gazapo Inti',
            raza: 'Raza Inti',
            peso: '300-500g',
            precio: 25.00,
            categoria: 'Cuyes Vivos',
            tipo: 'Gazapo',
            certificado: false,
            descripcion: 'Gazapo de raza Inti, ideal para iniciar tu crianza con inversión moderada. Excelente crecimiento.',
            caracteristicas: [
                'Edad: 1-2 meses',
                'Destetado correctamente',
                'Buena genética',
                'Rápido crecimiento',
                'Adaptable'
            ],
            imagenes: [
                'https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800'
            ]
        },
        'raza-inti-reproductor': {
            id: 'raza-inti-reproductor',
            nombre: 'Cuy Reproductor Inti',
            raza: 'Raza Inti',
            peso: '1000-1300g',
            precio: 52.00,
            categoria: 'Cuyes Vivos',
            tipo: 'Reproductor',
            certificado: true,
            descripcion: 'Cuy reproductor de raza Inti certificada, reconocido por su rápido crecimiento y adaptabilidad. Ideal para crianza comercial.',
            caracteristicas: [
                'Raza Inti certificada',
                'Edad: 4-5 meses',
                'Crecimiento acelerado',
                'Alta conversión alimenticia',
                'Vacunado completo',
                'Certificado sanitario'
            ],
            imagenes: [
                'https://images.unsplash.com/photo-1589952283406-b53a7d1347e8?w=800',
                'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=800'
            ]
        },
        'cuy-entero-eviscerado': {
            id: 'cuy-entero-eviscerado',
            nombre: 'Cuy Entero Eviscerado',
            raza: 'Raza Perú',
            peso: '700-900g',
            precio: 38.00,
            categoria: 'Carne de Cuy',
            tipo: 'Entero',
            certificado: true,
            descripcion: 'Cuy entero eviscerado listo para preparar. Producto fresco de alta calidad con certificación sanitaria. Ideal para cuy chactado y otras preparaciones tradicionales.',
            caracteristicas: [
                'Producto fresco del día',
                'Eviscerado y limpio',
                'Certificado SENASA',
                'Empacado al vacío',
                'Trazabilidad completa',
                'Sin aditivos ni conservantes'
            ],
            imagenes: [
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
                'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
            ]
        },
        'cuy-porcionado-premium': {
            id: 'cuy-porcionado-premium',
            nombre: 'Cuy Porcionado Premium',
            raza: 'Raza Perú',
            peso: '600-800g',
            precio: 42.00,
            categoria: 'Carne de Cuy',
            tipo: 'Porcionado',
            certificado: true,
            descripcion: 'Cuy porcionado en piezas ideales para diferentes preparaciones. Corte profesional que facilita la cocción uniforme y reduce tiempo de preparación.',
            caracteristicas: [
                'Corte profesional en 4 piezas',
                'Producto fresco',
                'Empaque individual',
                'Certificación sanitaria',
                'Ideal para restaurantes',
                'Fácil preparación'
            ],
            imagenes: [
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
                'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
            ]
        },
        'cuy-congelado': {
            id: 'cuy-congelado',
            nombre: 'Cuy Congelado',
            raza: 'Raza Perú',
            peso: '700-900g',
            precio: 35.00,
            categoria: 'Carne de Cuy',
            tipo: 'Congelado',
            certificado: true,
            descripcion: 'Cuy entero eviscerado congelado mediante técnica IQF. Mantiene todas sus propiedades nutricionales y sabor. Mayor durabilidad sin comprometer calidad.',
            caracteristicas: [
                'Congelado IQF (Individual Quick Freezing)',
                'Duración: hasta 6 meses',
                'Conserva propiedades nutricionales',
                'Empaque hermético',
                'Certificado SENASA',
                'Instrucciones de descongelado'
            ],
            imagenes: [
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800'
            ]
        },
        'combo-familiar-4-cuyes': {
            id: 'combo-familiar-4-cuyes',
            nombre: 'Combo Familiar 4 Cuyes',
            raza: 'Raza Perú',
            peso: '2.8-3.6kg total',
            precio: 145.00,
            categoria: 'Carne de Cuy',
            tipo: 'Combo',
            certificado: true,
            descripcion: 'Combo familiar con 4 cuyes enteros eviscerados. Precio especial para eventos familiares y celebraciones. Incluye recetario y tips de preparación.',
            caracteristicas: [
                '4 cuyes enteros eviscerados',
                'Peso promedio: 700-900g c/u',
                'Producto fresco',
                'Ahorro del 15%',
                'Recetario digital incluido',
                'Empaque especial para regalo'
            ],
            imagenes: [
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
                'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
            ]
        },
        'cuy-marinado-especias': {
            id: 'cuy-marinado-especias',
            nombre: 'Cuy Marinado con Especias',
            raza: 'Raza Perú',
            peso: '700-900g',
            precio: 44.00,
            categoria: 'Carne de Cuy',
            tipo: 'Marinado',
            certificado: true,
            descripcion: 'Cuy entero pre-marinado con nuestra receta especial de especias andinas. Listo para hornear o freír. Sabor tradicional garantizado.',
            caracteristicas: [
                'Marinado 24 horas',
                'Especias naturales andinas',
                'Listo para cocinar',
                'Ahorra tiempo de preparación',
                'Sabor tradicional',
                'Incluye instrucciones de cocción'
            ],
            imagenes: [
                'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
                'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800'
            ]
        },
        'servicio-beneficio-domicilio': {
            id: 'servicio-beneficio-domicilio',
            nombre: 'Servicio de Beneficio a Domicilio',
            raza: 'N/A',
            peso: 'N/A',
            precio: 15.00,
            categoria: 'Servicios',
            tipo: 'Servicio',
            certificado: true,
            descripcion: 'Servicio profesional de beneficio de cuyes a domicilio. Personal capacitado y certificado realiza el proceso en tu hogar siguiendo normas sanitarias.',
            caracteristicas: [
                'Personal certificado SENASA',
                'Herramientas profesionales',
                'Proceso higiénico garantizado',
                'A domicilio en Lima',
                'Máximo 10 cuyes por servicio',
                'Incluye empaque al vacío'
            ],
            imagenes: [
                'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'
            ]
        },
        'asesoria-crianza-basica': {
            id: 'asesoria-crianza-basica',
            nombre: 'Asesoría de Crianza Básica',
            raza: 'N/A',
            peso: 'N/A',
            precio: 80.00,
            categoria: 'Servicios',
            tipo: 'Asesoría',
            certificado: false,
            descripcion: 'Asesoría completa para iniciar tu crianza de cuyes. Incluye visita a tu instalación, plan de crianza personalizado y seguimiento por 1 mes.',
            caracteristicas: [
                'Visita a instalaciones',
                'Evaluación de infraestructura',
                'Plan de crianza personalizado',
                'Manual digital de crianza',
                'Seguimiento 1 mes vía WhatsApp',
                'Certificado de participación'
            ],
            imagenes: [
                'https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800'
            ]
        }
    };

    constructor(
        private route: ActivatedRoute,
        private router: Router
    ) {}

    ngOnInit() {
        this.route.params.subscribe(params => {
            const id = params['id'];
            this.producto = this.productos[id];
            if (!this.producto) {
                // Si no existe el producto, redirigir a productos
                this.router.navigate(['/cliente/productos']);
            }
        });
    }

    selectImage(index: number) {
        this.selectedImage = index;
    }

    updateQuantity(change: number) {
        this.cantidad += change;
        if (this.cantidad < 1) {
            this.cantidad = 1;
        }
    }

    addToCart() {
        const cart = localStorage.getItem('cart');
        let cartItems = cart ? JSON.parse(cart) : [];
        
        const existingItem = cartItems.find((item: any) => item.id === this.producto.id);
        
        if (existingItem) {
            existingItem.cantidad += this.cantidad;
        } else {
            cartItems.push({
                id: this.producto.id,
                nombre: this.producto.nombre,
                precio: this.producto.precio,
                cantidad: this.cantidad,
                categoria: this.producto.categoria,
                peso: this.producto.peso
            });
        }
        
        localStorage.setItem('cart', JSON.stringify(cartItems));
        
        alert(`${this.cantidad} ${this.producto.nombre} agregado(s) al carrito`);
        
        window.dispatchEvent(new Event('cart-updated'));
    }

    buyNow() {
        this.addToCart();
        this.router.navigate(['/cliente/carrito']);
    }

    onReviewSubmitted() {
        // El ReviewListComponent se actualizará automáticamente
        // cuando detecte cambios en el ReviewService
    }

    onShippingCalculated(result: any) {
        console.log('Costo de envío calculado:', result);
        // Se puede usar para mostrar el precio total incluyendo envío
    }

    getCurrentUrl(): string {
        return window.location.href;
    }
}
