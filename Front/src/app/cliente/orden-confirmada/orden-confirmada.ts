import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-orden-confirmada',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './orden-confirmada.html',
  styleUrl: './orden-confirmada.scss'
})
export class OrdenConfirmada implements OnInit {
  orderId: string = '';
  order: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.orderId = params['id'];
      this.loadOrder();
    });
  }

  loadOrder() {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    this.order = orders.find((o: any) => o.id === this.orderId);
    
    if (!this.order) {
      this.router.navigate(['/cliente/inicio']);
    }
  }

  downloadInvoice() {
    console.log('Descargando factura...');
    alert('Función de descarga de factura por implementar');
  }

  trackOrder() {
    this.router.navigate(['/cliente/mis-pedidos']);
  }
}
