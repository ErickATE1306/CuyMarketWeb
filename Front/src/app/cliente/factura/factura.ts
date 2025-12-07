import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-factura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './factura.html',
  styleUrl: './factura.scss'
})
export class FacturaComponent implements OnInit {
  pedidoId: string = '';
  pedido: any = null;
  company = {
    name: 'CuyMarket',
    ruc: '20601234567',
    address: 'Av. Principal 123, Lima, Perú',
    phone: '+51 999 999 999',
    email: 'ventas@cuymarket.com',
    website: 'www.cuymarket.com'
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.pedidoId = this.route.snapshot.params['id'];
    this.loadPedido();
  }

  loadPedido() {
    // Simular carga de pedido
    this.pedido = {
      id: this.pedidoId,
      fecha: '2025-12-05',
      cliente: {
        nombre: 'Juan Pérez',
        dni: '12345678',
        direccion: 'Calle Los Olivos 456, Lima',
        telefono: '999 888 777',
        email: 'juan@example.com'
      },
      productos: [
        { 
          codigo: 'CUY-001',
          nombre: 'Cuy Raza Perú', 
          cantidad: 2, 
          precioUnitario: 45.00,
          subtotal: 90.00
        },
        { 
          codigo: 'ACC-015',
          nombre: 'Alimento Premium', 
          cantidad: 1, 
          precioUnitario: 35.00,
          subtotal: 35.00
        }
      ],
      subtotal: 125.00,
      igv: 22.50, // 18%
      envio: 15.00,
      descuento: 10.00,
      total: 152.50,
      metodoPago: 'Yape',
      estado: 'Entregado'
    };
  }

  print() {
    window.print();
  }

  goBack() {
    this.router.navigate(['/cliente/mis-pedidos']);
  }

  downloadPDF() {
    // En producción, generar PDF en backend
    alert('Generando PDF...');
  }
}
