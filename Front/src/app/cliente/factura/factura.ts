import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PedidoService } from '../../compartido/servicios/pedido.service';
import { AlertaService } from '../../compartido/servicios/alerta.service';

@Component({
  selector: 'app-factura',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './factura.html',
  styleUrl: './factura.scss'
})
export class FacturaComponent implements OnInit {
  private pedidoService = inject(PedidoService);
  private alertaService = inject(AlertaService);
  
  pedidoId: number = 0;
  pedido: any = null;
  cargando = true;
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
    const id = this.route.snapshot.params['id'];
    this.pedidoId = parseInt(id, 10);
    this.loadPedido();
  }

  loadPedido() {
    this.cargando = true;
    this.pedidoService.obtenerPorId(this.pedidoId).subscribe({
      next: (pedido) => {
        this.pedido = pedido;
        this.cargando = false;
      },
      error: (error) => {
        console.error('Error al cargar pedido:', error);
        this.alertaService.mostrarError('Error al cargar la factura');
        this.cargando = false;
        this.goBack();
      }
    });
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
