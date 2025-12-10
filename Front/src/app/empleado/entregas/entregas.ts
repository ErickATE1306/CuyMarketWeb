import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PedidoService, Pedido } from '../../compartido/servicios/pedido.service';

interface EstadisticasEntregas {
    entregasHoy: number;
    completadas: number;
    pendientes: number;
    zonasActivas: number;
}

interface EntregaProgramada extends Pedido {
    horaInicio?: string;
    horaFin?: string;
    enRuta?: boolean;
}

@Component({
    selector: 'app-entregas',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './entregas.html',
    styleUrl: './entregas.scss',
})
export class Entregas implements OnInit {
    private pedidoService = inject(PedidoService);

    entregas: EntregaProgramada[] = [];
    loading: boolean = false;
    error: string = '';
    
    estadisticas: EstadisticasEntregas = {
        entregasHoy: 0,
        completadas: 0,
        pendientes: 0,
        zonasActivas: 0
    };

    ngOnInit() {
        this.cargarEntregas();
    }

    cargarEntregas() {
        this.loading = true;
        this.error = '';
        
        // Cargar pedidos en estado EN_CAMINO y PENDIENTE (listos para entrega)
        this.pedidoService.listarTodosPedidos().subscribe({
            next: (pedidos) => {
                // Filtrar pedidos que están listos para entrega o en camino
                const pedidosEntrega = pedidos.filter(p => 
                    p.estado === 'EN_CAMINO' || p.estado === 'EN_PROCESO'
                );
                
                // Ordenar por fecha
                this.entregas = pedidosEntrega
                    .sort((a, b) => new Date(a.fechaPedido).getTime() - new Date(b.fechaPedido).getTime())
                    .map(p => this.asignarHorarioEntrega(p));
                
                this.calcularEstadisticas();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar entregas:', err);
                this.error = 'Error al cargar las entregas programadas';
                this.loading = false;
            }
        });
    }

    asignarHorarioEntrega(pedido: Pedido): EntregaProgramada {
        // Simular horarios de entrega basados en la hora del pedido
        const fechaPedido = new Date(pedido.fechaPedido);
        const horaInicio = new Date(fechaPedido);
        horaInicio.setHours(horaInicio.getHours() + 2); // 2 horas después del pedido
        
        const horaFin = new Date(horaInicio);
        horaFin.setHours(horaFin.getHours() + 1); // Ventana de 1 hora
        
        return {
            ...pedido,
            horaInicio: this.formatearHora(horaInicio),
            horaFin: this.formatearHora(horaFin),
            enRuta: pedido.estado === 'EN_CAMINO'
        };
    }

    calcularEstadisticas() {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);
        
        const entregasHoy = this.entregas.filter(e => {
            const fechaEntrega = new Date(e.fechaPedido);
            fechaEntrega.setHours(0, 0, 0, 0);
            return fechaEntrega.getTime() === hoy.getTime();
        });
        
        // Contar zonas únicas (distritos)
        const zonasUnicas = new Set(
            this.entregas
                .map(e => this.extraerDistrito(e.direccionEnvio || ''))
                .filter(d => d !== '')
        );
        
        this.estadisticas = {
            entregasHoy: entregasHoy.length,
            completadas: this.entregas.filter(e => e.estado === 'ENTREGADO').length,
            pendientes: this.entregas.filter(e => e.estado === 'EN_PROCESO').length,
            zonasActivas: zonasUnicas.size
        };
    }

    extraerDistrito(direccion: string): string {
        // Intentar extraer el distrito de la dirección
        const partes = direccion.split(',');
        if (partes.length >= 2) {
            return partes[partes.length - 2].trim();
        }
        return '';
    }

    marcarEnRuta(pedido: EntregaProgramada) {
        this.pedidoService.actualizarEstado(pedido.id, 'EN_CAMINO').subscribe({
            next: (pedidoActualizado) => {
                const index = this.entregas.findIndex(e => e.id === pedido.id);
                if (index !== -1) {
                    this.entregas[index] = {
                        ...pedidoActualizado,
                        horaInicio: this.entregas[index].horaInicio,
                        horaFin: this.entregas[index].horaFin,
                        enRuta: true
                    };
                }
                this.calcularEstadisticas();
            },
            error: (err) => {
                console.error('Error al actualizar estado:', err);
                alert('Error al marcar como en ruta');
            }
        });
    }

    marcarEntregado(pedido: EntregaProgramada) {
        if (!confirm(`¿Confirmar entrega del pedido ${pedido.numeroPedido}?`)) {
            return;
        }
        
        this.pedidoService.actualizarEstado(pedido.id, 'ENTREGADO').subscribe({
            next: () => {
                // Remover de la lista de entregas
                this.entregas = this.entregas.filter(e => e.id !== pedido.id);
                this.calcularEstadisticas();
                alert('Pedido marcado como entregado');
            },
            error: (err) => {
                console.error('Error al marcar como entregado:', err);
                alert('Error al marcar como entregado');
            }
        });
    }

    obtenerEstadoEntrega(pedido: EntregaProgramada): string {
        if (pedido.estado === 'ENTREGADO') return 'Entregado';
        if (pedido.estado === 'EN_CAMINO') return 'En Ruta';
        return 'Pendiente';
    }

    obtenerClaseEstado(pedido: EntregaProgramada): string {
        if (pedido.estado === 'ENTREGADO') return 'completed';
        if (pedido.estado === 'EN_CAMINO') return 'processing';
        return 'pending';
    }

    obtenerClaseTimeline(pedido: EntregaProgramada): string {
        if (pedido.estado === 'ENTREGADO') return 'completed';
        if (pedido.estado === 'EN_CAMINO') return 'active';
        return 'pending';
    }

    formatearHora(fecha: Date): string {
        const horas = String(fecha.getHours()).padStart(2, '0');
        const minutos = String(fecha.getMinutes()).padStart(2, '0');
        return `${horas}:${minutos}`;
    }

    nuevaEntrega() {
        alert('Funcionalidad de nueva entrega en desarrollo');
    }
}
