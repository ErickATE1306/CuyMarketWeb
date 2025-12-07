import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-gestion-pedidos',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './gestion-pedidos.html',
    styleUrl: './gestion-pedidos.scss',
})
export class GestionPedidos {
    showDetailsModal: boolean = false;
    showProcessModal: boolean = false;
    
    selectedOrder: any = {
        id: '',
        customer: { name: '', phone: '', address: '' },
        products: [],
        quantity: '',
        total: 0,
        date: '',
        status: '',
        notes: ''
    };

    processAction: string = '';
    processNotes: string = '';

    // Ver detalles del pedido
    viewOrderDetails(order: any) {
        this.selectedOrder = {
            id: order.id || '#1234',
            customer: {
                name: order.customerName || 'María González',
                phone: order.phone || '+51 999 888 777',
                address: order.address || 'Av. Los Incas 456, San Isidro, Lima'
            },
            products: order.products || [
                { name: 'Cuy Raza Perú', quantity: 3, price: 45.00 }
            ],
            quantity: order.quantity || '3 unidades',
            total: order.total || 135.00,
            date: order.date || '05/12/2025 14:30',
            status: order.status || 'Pendiente',
            notes: order.notes || ''
        };
        this.showDetailsModal = true;
    }

    closeDetailsModal() {
        this.showDetailsModal = false;
    }

    // Procesar pedido (aprobar, completar, entregar)
    processOrder(order: any, action: string) {
        this.selectedOrder = {
            id: order.id || '#1234',
            customer: {
                name: order.customerName || 'María González',
                phone: order.phone || '+51 999 888 777',
                address: order.address || 'Av. Los Incas 456, San Isidro, Lima'
            },
            products: order.products || [
                { name: 'Cuy Raza Perú', quantity: 3, price: 45.00 }
            ],
            quantity: order.quantity || '3 unidades',
            total: order.total || 135.00,
            date: order.date || '05/12/2025 14:30',
            status: order.status || 'Pendiente'
        };
        this.processAction = action;
        this.processNotes = '';
        this.showProcessModal = true;
    }

    closeProcessModal() {
        this.showProcessModal = false;
    }

    confirmProcess() {
        console.log('Procesando pedido:', this.selectedOrder.id, 'Acción:', this.processAction, 'Notas:', this.processNotes);
        // Aquí iría la lógica para actualizar el estado del pedido
        this.closeProcessModal();
    }
}
