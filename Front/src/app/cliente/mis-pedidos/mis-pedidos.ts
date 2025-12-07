import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../compartido/servicios/toast.service';
import { VentanaComponent } from '../../compartido/componentes/ventana/ventana';

@Component({
    selector: 'app-mis-pedidos',
    standalone: true,
    imports: [CommonModule, FormsModule, VentanaComponent],
    templateUrl: './mis-pedidos.html',
    styleUrl: './mis-pedidos.scss',
})
export class MisPedidos {
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

    constructor(
        private router: Router,
        private toast: ToastService
    ) {}
    pedidos = [
        {
            id: 'PED-001',
            fecha: '2025-12-01',
            estado: 'entregado',
            total: 85.00,
            productos: [
                { nombre: 'Cuy Raza Perú', cantidad: 2, precio: 35.00 },
                { nombre: 'Alimento Premium', cantidad: 1, precio: 15.00 }
            ]
        },
        {
            id: 'PED-002',
            fecha: '2025-12-03',
            estado: 'en-camino',
            total: 120.00,
            productos: [
                { nombre: 'Cuy Raza Inti', cantidad: 1, precio: 45.00 },
                { nombre: 'Jaula Grande', cantidad: 1, precio: 75.00 }
            ]
        },
        {
            id: 'PED-003',
            fecha: '2025-12-05',
            estado: 'procesando',
            total: 200.00,
            productos: [
                { nombre: 'Cuy Raza Andina', cantidad: 3, precio: 40.00 },
                { nombre: 'Kit Cuidado Completo', cantidad: 1, precio: 80.00 }
            ]
        },
        {
            id: 'PED-004',
            fecha: '2025-11-28',
            estado: 'entregado',
            total: 65.00,
            productos: [
                { nombre: 'Cuy Bebé', cantidad: 1, precio: 25.00 },
                { nombre: 'Alimento Básico', cantidad: 2, precio: 20.00 }
            ]
        }
    ];

    selectedPedido: any = null;
    showDetailsModal = false;

    getEstadoBadgeClass(estado: string): string {
        const classes: any = {
            'entregado': 'badge-success',
            'en-camino': 'badge-warning',
            'procesando': 'badge-info',
            'cancelado': 'badge-danger'
        };
        return classes[estado] || 'badge-default';
    }

    getEstadoText(estado: string): string {
        const texts: any = {
            'entregado': 'Entregado',
            'en-camino': 'En Camino',
            'procesando': 'Procesando',
            'cancelado': 'Cancelado'
        };
        return texts[estado] || estado;
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
        return ['procesando', 'en-camino'].includes(estado);
    }

    openCancelModal(pedido: any) {
        if (!this.canCancelOrder(pedido.estado)) {
            this.toast.show('warning', 'Este pedido no puede ser cancelado');
            return;
        }
        this.selectedOrder = pedido;
        this.cancelReason = '';
        this.showCancelModal = true;
    }

    confirmCancel() {
        if (!this.cancelReason) {
            this.toast.show('error', 'Selecciona un motivo de cancelación');
            return;
        }

        if (this.selectedOrder) {
            this.selectedOrder.estado = 'cancelado';
            this.selectedOrder.cancelReason = this.cancelReason;
            this.selectedOrder.cancelDate = new Date().toISOString();
            
            this.toast.show('success', `Pedido ${this.selectedOrder.id} cancelado exitosamente`);
            this.showCancelModal = false;
            this.selectedOrder = null;
            this.cancelReason = '';
        }
    }

    closeCancelModal() {
        this.showCancelModal = false;
        this.selectedOrder = null;
        this.cancelReason = '';
    }

    trackOrder(pedido: any) {
        alert(`Seguimiento del pedido ${pedido.id}\nEstado: ${this.getEstadoText(pedido.estado)}`);
    }

    downloadInvoice(pedido: any) {
        this.router.navigate(['/cliente/factura', pedido.id]);
    }

    reorder(pedido: any) {
        alert(`Agregando productos del pedido ${pedido.id} al carrito`);
    }
}
