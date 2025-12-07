import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-completados',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './completados.html',
    styleUrl: './completados.scss',
})
export class Completados {
    showDetailsModal: boolean = false;
    
    selectedOrder: any = {
        id: '',
        customer: { name: '', phone: '', address: '' },
        products: [],
        total: 0,
        date: '',
        completedDate: '',
        totalTime: '',
        notes: ''
    };

    // Ver detalles del pedido
    viewOrderDetails(order: any) {
        this.selectedOrder = {
            id: order.id || '#1232',
            customer: {
                name: order.customerName || 'Ana Torres',
                phone: order.phone || '+51 977 666 555',
                address: order.address || 'Av. Los Incas 456, San Isidro, Lima'
            },
            products: order.products || [
                { name: 'Cuy Raza Andina', quantity: 2, price: 55.00 },
                { name: 'Carne', quantity: 1, price: 35.00 }
            ],
            total: order.total || 145.00,
            date: order.date || '05/12/2025 12:00',
            completedDate: order.completedDate || '05/12/2025 15:30',
            totalTime: order.totalTime || '2.5h',
            notes: order.notes || 'Pedido entregado sin inconvenientes'
        };
        this.showDetailsModal = true;
    }

    closeDetailsModal() {
        this.showDetailsModal = false;
    }

    // Imprimir comprobante
    printReceipt(order: any) {
        console.log('Imprimiendo comprobante del pedido:', order.id);
        // Aquí iría la lógica para generar e imprimir el comprobante
        alert('Generando comprobante para imprimir...');
    }
}
