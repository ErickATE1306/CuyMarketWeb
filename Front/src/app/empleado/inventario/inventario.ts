import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductoService, Producto } from '../../compartido/servicios/producto.service';

interface EstadisticasInventario {
    totalProductos: number;
    enStock: number;
    stockBajo: number;
    agotados: number;
}

@Component({
    selector: 'app-inventario',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './inventario.html',
    styleUrl: './inventario.scss'
})
export class Inventario implements OnInit {
    private productoService = inject(ProductoService);

    productos: Producto[] = [];
    productosFiltrados: Producto[] = [];
    loading: boolean = false;
    error: string = '';
    
    filtroActivo: string = 'TODOS';
    busqueda: string = '';
    
    showStockModal: boolean = false;
    productoSeleccionado: Producto | null = null;
    nuevoStock: number = 0;
    
    estadisticas: EstadisticasInventario = {
        totalProductos: 0,
        enStock: 0,
        stockBajo: 0,
        agotados: 0
    };

    ngOnInit() {
        this.cargarInventario();
    }

    cargarInventario() {
        this.loading = true;
        this.error = '';
        
        this.productoService.listar().subscribe({
            next: (productos) => {
                this.productos = productos.filter(p => p.activo);
                this.aplicarFiltros();
                this.calcularEstadisticas();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar inventario:', err);
                this.error = 'Error al cargar el inventario';
                this.loading = false;
            }
        });
    }

    aplicarFiltros() {
        let productosFiltrados = [...this.productos];
        
        // Filtro por estado de stock
        switch (this.filtroActivo) {
            case 'EN_STOCK':
                productosFiltrados = productosFiltrados.filter(p => 
                    (p.stockDisponible || 0) > (p.stockMinimo || 0)
                );
                break;
            case 'STOCK_BAJO':
                productosFiltrados = productosFiltrados.filter(p => 
                    (p.stockDisponible || 0) > 0 && 
                    (p.stockDisponible || 0) <= (p.stockMinimo || 0)
                );
                break;
            case 'AGOTADOS':
                productosFiltrados = productosFiltrados.filter(p => 
                    (p.stockDisponible || 0) === 0
                );
                break;
            case 'TODOS':
            default:
                // No filtrar
                break;
        }
        
        // Filtro por búsqueda
        if (this.busqueda.trim()) {
            const busquedaLower = this.busqueda.toLowerCase();
            productosFiltrados = productosFiltrados.filter(p =>
                p.nombre.toLowerCase().includes(busquedaLower) ||
                p.raza?.toLowerCase().includes(busquedaLower) ||
                p.categoriaNombre?.toLowerCase().includes(busquedaLower)
            );
        }
        
        this.productosFiltrados = productosFiltrados;
    }

    calcularEstadisticas() {
        this.estadisticas = {
            totalProductos: this.productos.length,
            enStock: this.productos.filter(p => 
                (p.stockDisponible || 0) > (p.stockMinimo || 0)
            ).length,
            stockBajo: this.productos.filter(p => 
                (p.stockDisponible || 0) > 0 && 
                (p.stockDisponible || 0) <= (p.stockMinimo || 0)
            ).length,
            agotados: this.productos.filter(p => 
                (p.stockDisponible || 0) === 0
            ).length
        };
    }

    cambiarFiltro(filtro: string) {
        this.filtroActivo = filtro;
        this.aplicarFiltros();
    }

    buscarProducto() {
        this.aplicarFiltros();
    }

    obtenerEstadoStock(producto: Producto): string {
        const stock = producto.stockDisponible || 0;
        const minimo = producto.stockMinimo || 0;
        
        if (stock === 0) return 'out-stock';
        if (stock <= minimo) return 'low-stock';
        return 'in-stock';
    }

    obtenerTextoEstado(producto: Producto): string {
        const stock = producto.stockDisponible || 0;
        const minimo = producto.stockMinimo || 0;
        
        if (stock === 0) return 'Agotado';
        if (stock <= minimo) return 'Stock Bajo';
        return 'En Stock';
    }

    abrirModalStock(producto: Producto) {
        this.productoSeleccionado = producto;
        this.nuevoStock = producto.stockDisponible || 0;
        this.showStockModal = true;
    }

    cerrarModalStock() {
        this.showStockModal = false;
        this.productoSeleccionado = null;
        this.nuevoStock = 0;
    }

    actualizarStock() {
        if (!this.productoSeleccionado) return;
        
        if (this.nuevoStock < 0) {
            alert('El stock no puede ser negativo');
            return;
        }
        
        const productoActualizado = {
            ...this.productoSeleccionado,
            stockDisponible: this.nuevoStock
        };
        
        this.productoService.actualizar(this.productoSeleccionado.id, productoActualizado).subscribe({
            next: (producto) => {
                // Actualizar en la lista local
                const index = this.productos.findIndex(p => p.id === producto.id);
                if (index !== -1) {
                    this.productos[index] = producto;
                }
                this.aplicarFiltros();
                this.calcularEstadisticas();
                this.cerrarModalStock();
                alert('Stock actualizado exitosamente');
            },
            error: (err) => {
                console.error('Error al actualizar stock:', err);
                alert('Error al actualizar el stock');
            }
        });
    }

    verHistorial(producto: Producto) {
        alert(`Historial de movimientos para ${producto.nombre} - Funcionalidad en desarrollo`);
    }

    obtenerUnidad(producto: Producto): string {
        if (producto.tipo?.toLowerCase().includes('combo')) return 'combos';
        if (producto.tipo?.toLowerCase().includes('carne')) return 'kg';
        return 'unidades';
    }
}
