import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertaService } from '../../compartido/servicios/alerta.service';
import { PedidoService } from '../../compartido/servicios/pedido.service';
import { VentanaComponent } from '../../compartido/componentes/ventana/ventana';

@Component({
    selector: 'app-mis-pedidos',
    standalone: true,
    imports: [CommonModule, FormsModule, VentanaComponent],
    templateUrl: './mis-pedidos.html',
    styleUrl: './mis-pedidos.scss',
})
export class MisPedidos implements OnInit {
    private alertaService = inject(AlertaService);
    private pedidoService = inject(PedidoService);
    
    showCancelModal = false;
    selectedOrder: any = null;
    cancelReason = '';
    cancelReasons = [
        'Cambié de opinión',
        'Encontré mejor precio',
        'Pedido por error',
        'Demora en el envío',
        'Otro motivo'
    ];
    
    pedidos: any[] = [];
    cargando = true;

    constructor(
        private router: Router
    ) {}
    
    ngOnInit() {
        this.cargarMisPedidos();
    }
    
    cargarMisPedidos() {
        this.cargando = true;
        this.pedidoService.listarMisPedidos().subscribe({
            next: (pedidos) => {
                this.pedidos = pedidos;
                this.cargando = false;
            },
            error: (error) => {
                console.error('Error al cargar pedidos:', error);
                this.alertaService.mostrarError('Error al cargar tus pedidos');
                this.cargando = false;
            }
        });
    }

    selectedPedido: any = null;
    showDetailsModal = false;

    getEstadoBadgeClass(estado: string): string {
        const classes: any = {
            'ENTREGADO': 'badge-success',
            'EN_CAMINO': 'badge-warning',
            'PROCESANDO': 'badge-info',
            'CANCELADO': 'badge-danger',
            'PENDIENTE': 'badge-secondary'
        };
        return classes[estado] || 'badge-default';
    }

    getEstadoText(estado: string): string {
        const texts: any = {
            'ENTREGADO': 'Entregado',
            'EN_CAMINO': 'En Camino',
            'PROCESANDO': 'Procesando',
            'CANCELADO': 'Cancelado',
            'PENDIENTE': 'Pendiente'
        };
        return texts[estado] || estado;
    }

    getEstadoPagoBadgeClass(estadoPago: string): string {
        const classes: any = {
            'PAGADO': 'badge-success',
            'PENDIENTE': 'badge-warning',
            'RECHAZADO': 'badge-danger'
        };
        return classes[estadoPago] || 'badge-secondary';
    }

    getEstadoPagoText(estadoPago: string): string {
        const texts: any = {
            'PAGADO': 'Pagado',
            'PENDIENTE': 'Pendiente',
            'RECHAZADO': 'Rechazado'
        };
        return texts[estadoPago] || estadoPago;
    }

    viewDetails(pedido: any) {
        this.selectedPedido = pedido;
        this.showDetailsModal = true;
    }

    closeDetailsModal() {
        this.showDetailsModal = false;
        this.selectedPedido = null;
    }

    canCancelOrder(estado: string): boolean {
        return ['PROCESANDO', 'PENDIENTE'].includes(estado);
    }

    openCancelModal(pedido: any) {
        if (!this.canCancelOrder(pedido.estado)) {
            this.alertaService.mostrarAdvertencia('Este pedido no puede ser cancelado');
            return;
        }
        this.selectedOrder = pedido;
        this.cancelReason = '';
        this.showCancelModal = true;
    }

    confirmCancel() {
        if (!this.cancelReason) {
            this.alertaService.mostrarError('Selecciona un motivo de cancelación');
            return;
        }

        if (this.selectedOrder) {
            this.pedidoService.cancelarPedido(this.selectedOrder.id).subscribe({
                next: () => {
                    this.alertaService.mostrarExito(`Pedido ${this.selectedOrder.numeroPedido} cancelado exitosamente`);
                    this.showCancelModal = false;
                    this.selectedOrder = null;
                    this.cancelReason = '';
                    this.cargarMisPedidos();
                },
                error: (error) => {
                    console.error('Error al cancelar pedido:', error);
                    if (error.status === 400) {
                        this.alertaService.mostrarError('Este pedido no puede ser cancelado');
                    } else {
                        this.alertaService.mostrarError('No se pudo cancelar el pedido');
                    }
                }
            });
        }
    }

    closeCancelModal() {
        this.showCancelModal = false;
        this.selectedOrder = null;
        this.cancelReason = '';
    }

    trackOrder(pedido: any) {
        this.viewDetails(pedido);
    }

    downloadInvoice(pedido: any) {
        this.router.navigate(['/cliente/factura', pedido.id]);
    }

    reorder(pedido: any) {
        this.alertaService.mostrarInfo('Función de reordenar en desarrollo');
    }
    
    actualizarPedidos() {
        this.cargarMisPedidos();
        this.alertaService.mostrarInfo('Pedidos actualizados');
    }
}
