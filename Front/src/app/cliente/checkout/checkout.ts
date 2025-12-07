import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EntradaCuponComponent } from '../../compartido/componentes/entrada-cupon/entrada-cupon';

interface CartItem {
  id: string;
  nombre: string;
  precio: number;
  cantidad: number;
  categoria: string;
  peso: string;
}

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, EntradaCuponComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit {
  currentStep = 1;
  cartItems: CartItem[] = [];
  discountAmount = 0;
  appliedCoupon: any = null;
  
  // Información de envío
  shippingInfo = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    dni: '',
    direccion: '',
    referencia: '',
    ciudad: 'Lima',
    distrito: '',
    codigoPostal: ''
  };

  // Información de pago
  paymentMethod: 'tarjeta' | 'yape' | 'plin' | 'transferencia' = 'tarjeta';
  cardInfo = {
    numero: '',
    titular: '',
    vencimiento: '',
    cvv: ''
  };

  yapeInfo = {
    telefono: '',
    comprobante: null as File | null
  };

  transferInfo = {
    banco: 'BCP',
    comprobante: null as File | null
  };

  // Resumen
  acceptTerms = false;
  processingPayment = false;

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadCart();
    this.loadUserData();
  }

  loadCart() {
    const cart = localStorage.getItem('cart');
    if (cart) {
      this.cartItems = JSON.parse(cart);
    }
    if (this.cartItems.length === 0) {
      this.router.navigate(['/cliente/carrito']);
    }
  }

  loadUserData() {
    const user = localStorage.getItem('user');
    if (user) {
      const userData = JSON.parse(user);
      this.shippingInfo.nombre = userData.nombre || '';
      this.shippingInfo.apellido = userData.apellido || '';
      this.shippingInfo.email = userData.email || '';
      this.shippingInfo.telefono = userData.telefono || '';
      this.shippingInfo.dni = userData.dni || '';
    }
  }

  getSubtotal(): number {
    return this.cartItems.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  }

  getEnvio(): number {
    return 15.00;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getEnvio() - this.discountAmount;
  }

  onCouponApplied(event: any) {
    this.appliedCoupon = event.coupon;
    this.discountAmount = event.discount;
    console.log('Cupón aplicado:', this.appliedCoupon, 'Descuento:', this.discountAmount);
  }

  nextStep() {
    if (this.currentStep === 1 && this.validateShipping()) {
      this.currentStep = 2;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else if (this.currentStep === 2 && this.validatePayment()) {
      this.currentStep = 3;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  goToStep(step: number) {
    if (step < this.currentStep) {
      this.currentStep = step;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  validateShipping(): boolean {
    const { nombre, apellido, email, telefono, dni, direccion, distrito } = this.shippingInfo;
    return !!(nombre && apellido && email && telefono && dni && direccion && distrito);
  }

  validatePayment(): boolean {
    if (this.paymentMethod === 'tarjeta') {
      const { numero, titular, vencimiento, cvv } = this.cardInfo;
      return !!(numero && titular && vencimiento && cvv) && 
             numero.replace(/\s/g, '').length === 16 &&
             cvv.length === 3;
    } else if (this.paymentMethod === 'yape' || this.paymentMethod === 'plin') {
      return !!(this.yapeInfo.telefono && this.yapeInfo.comprobante);
    } else if (this.paymentMethod === 'transferencia') {
      return !!(this.transferInfo.comprobante);
    }
    return false;
  }

  onFileSelected(event: Event, type: 'yape' | 'transfer') {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (type === 'yape') {
        this.yapeInfo.comprobante = file;
      } else {
        this.transferInfo.comprobante = file;
      }
    }
  }

  formatCardNumber(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\s/g, '');
    let formattedValue = '';
    for (let i = 0; i < value.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        formattedValue += ' ';
      }
      formattedValue += value[i];
    }
    this.cardInfo.numero = formattedValue;
  }

  formatExpiry(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, '');
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2, 4);
    }
    this.cardInfo.vencimiento = value;
  }

  async processPayment() {
    if (!this.acceptTerms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }

    this.processingPayment = true;

    // Simular procesamiento de pago
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Crear orden
    const order = {
      id: 'ORD-' + Date.now(),
      fecha: new Date().toISOString(),
      items: this.cartItems,
      envio: this.shippingInfo,
      metodoPago: this.paymentMethod,
      subtotal: this.getSubtotal(),
      costoEnvio: this.getEnvio(),
      total: this.getTotal(),
      estado: 'procesando'
    };

    // Guardar orden
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Limpiar carrito
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cart-updated'));

    this.processingPayment = false;

    // Redirigir a confirmación
    this.router.navigate(['/cliente/orden-confirmada', order.id]);
  }
}
