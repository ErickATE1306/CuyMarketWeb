import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService, Pedido, EstadisticasPedidos } from '../../compartido/servicios/pedido.service';

@Component({
    selector: 'app-pedidos',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './pedidos.html',
    styleUrl: './pedidos.scss',
})
export class Pedidos implements OnInit {
    private pedidoService = inject(PedidoService);

    pedidos: Pedido[] = [];
    filteredPedidos: Pedido[] = [];
    estadisticas: EstadisticasPedidos = {
        totalPedidos: 0,
        pendientes: 0,
        enProceso: 0,
        completados: 0,
        cancelados: 0
    };

    filtroActivo: string = 'TODOS';
    searchTerm: string = '';
    loading: boolean = false;
    showDetalleModal: boolean = false;
    pedidoSeleccionado: Pedido | null = null;

    ngOnInit() {
        this.cargarPedidos();
        this.cargarEstadisticas();
    }

    cargarPedidos() {
        this.loading = true;
        this.pedidoService.listarTodosPedidos().subscribe({
            next: (pedidos) => {
                this.pedidos = pedidos;
                this.aplicarFiltros();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al cargar pedidos:', error);
                this.loading = false;
            }
        });
    }

    cargarEstadisticas() {
        this.pedidoService.obtenerEstadisticas().subscribe({
            next: (stats) => {
                this.estadisticas = stats;
            },
            error: (error) => {
                console.error('Error al cargar estadísticas:', error);
            }
        });
    }

    aplicarFiltros() {
        let pedidosFiltrados = [...this.pedidos];

        // Filtrar por estado
        if (this.filtroActivo !== 'TODOS') {
            pedidosFiltrados = pedidosFiltrados.filter(p => p.estado === this.filtroActivo);
        }

        // Filtrar por búsqueda
        if (this.searchTerm) {
            const term = this.searchTerm.toLowerCase();
            pedidosFiltrados = pedidosFiltrados.filter(p =>
                p.numeroPedido.toLowerCase().includes(term) ||
                (p.usuarioNombre && p.usuarioNombre.toLowerCase().includes(term)) ||
                (p.usuarioEmail && p.usuarioEmail.toLowerCase().includes(term))
            );
        }

        this.filteredPedidos = pedidosFiltrados;
    }

    cambiarFiltro(filtro: string) {
        this.filtroActivo = filtro;
        this.aplicarFiltros();
    }

    buscar() {
        this.aplicarFiltros();
    }

    verDetalle(pedido: Pedido) {
        this.pedidoSeleccionado = pedido;
        this.showDetalleModal = true;
    }

    cerrarDetalle() {
        this.showDetalleModal = false;
        this.pedidoSeleccionado = null;
    }

    actualizarEstado(pedidoId: number, nuevoEstado: string) {
        if (!confirm(`¿Confirmar cambio de estado a ${nuevoEstado}?`)) {
            return;
        }

        this.pedidoService.actualizarEstado(pedidoId, nuevoEstado).subscribe({
            next: (pedidoActualizado) => {
                // Actualizar en la lista local
                const index = this.pedidos.findIndex(p => p.id === pedidoId);
                if (index !== -1) {
                    this.pedidos[index] = pedidoActualizado;
                }
                this.aplicarFiltros();
                this.cargarEstadisticas();
                alert('Estado actualizado correctamente');
            },
            error: (error) => {
                console.error('Error al actualizar estado:', error);
                alert('Error al actualizar el estado del pedido');
            }
        });
    }

    getEstadoBadgeClass(estado: string): string {
        const clases: { [key: string]: string } = {
            'PENDIENTE': 'pending',
            'EN_PROCESO': 'processing',
            'EN_CAMINO': 'shipping',
            'ENTREGADO': 'completed',
            'CANCELADO': 'cancelled'
        };
        return clases[estado] || 'pending';
    }

    formatearFecha(fecha: string): string {
        return new Date(fecha).toLocaleDateString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }

    formatearMoneda(monto: number): string {
        return `S/ ${monto.toFixed(2)}`;
    }

    exportarReporte() {
        // TODO: Implementar exportación a Excel/PDF
        alert('Funcionalidad de exportación en desarrollo');
    }
}
