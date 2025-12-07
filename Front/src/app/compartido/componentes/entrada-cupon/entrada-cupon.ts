import { Component, EventEmitter, Output, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minAmount: number;
  maxDiscount?: number;
  expiryDate: Date;
  description: string;
}

@Component({
  selector: 'app-entrada-cupon',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './entrada-cupon.html',
  styleUrl: './entrada-cupon.scss'
})
export class EntradaCuponComponent {
  @Input() cartTotal: number = 0;
  @Output() couponApplied = new EventEmitter<{ coupon: Coupon; discount: number; }>();
  
  couponCode: string = '';
  appliedCoupon: Coupon | null = null;
  errorMessage: string = '';
  isLoading: boolean = false;

  // Lista de cupones disponibles (simulación)
  availableCoupons: Coupon[] = [
    {
      code: 'PRIMERA20',
      type: 'percentage',
      value: 20,
      minAmount: 50,
      maxDiscount: 100,
      expiryDate: new Date('2025-12-31'),
      description: '20% de descuento en tu primera compra (máx. S/ 100)'
    },
    {
      code: 'NAVIDAD15',
      type: 'percentage',
      value: 15,
      minAmount: 100,
      expiryDate: new Date('2025-12-25'),
      description: '15% de descuento por Navidad'
    },
    {
      code: 'BIENVENIDO10',
      type: 'fixed',
      value: 10,
      minAmount: 30,
      expiryDate: new Date('2025-12-31'),
      description: 'S/ 10 de descuento en compras mayores a S/ 30'
    },
    {
      code: 'VERANO25',
      type: 'percentage',
      value: 25,
      minAmount: 150,
      maxDiscount: 150,
      expiryDate: new Date('2026-03-31'),
      description: '25% de descuento por verano (máx. S/ 150)'
    },
    {
      code: 'FIDELIDAD30',
      type: 'fixed',
      value: 30,
      minAmount: 200,
      expiryDate: new Date('2025-12-31'),
      description: 'S/ 30 de descuento para clientes frecuentes'
    }
  ];

  applyCoupon() {
    if (!this.couponCode.trim()) {
      this.errorMessage = 'Ingresa un código de cupón';
      return;
    }

    if (!this.cartTotal || this.cartTotal <= 0) {
      this.errorMessage = 'El carrito está vacío';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    // Simular llamada al servidor
    setTimeout(() => {
      const coupon = this.availableCoupons.find(
        c => c.code.toLowerCase() === this.couponCode.trim().toLowerCase()
      );

      if (!coupon) {
        this.errorMessage = 'Cupón inválido o expirado';
        this.isLoading = false;
        return;
      }

      // Verificar expiración
      if (new Date() > coupon.expiryDate) {
        this.errorMessage = 'Este cupón ha expirado';
        this.isLoading = false;
        return;
      }

      // Verificar monto mínimo
      if (this.cartTotal < coupon.minAmount) {
        this.errorMessage = `Monto mínimo de compra: S/ ${coupon.minAmount}`;
        this.isLoading = false;
        return;
      }

      // Calcular descuento
      let discount = 0;
      if (coupon.type === 'percentage') {
        discount = (this.cartTotal * coupon.value) / 100;
        if (coupon.maxDiscount && discount > coupon.maxDiscount) {
          discount = coupon.maxDiscount;
        }
      } else {
        discount = coupon.value;
      }

      // Aplicar cupón
      this.appliedCoupon = coupon;
      this.couponApplied.emit({ coupon, discount });
      this.saveAppliedCoupon(coupon, discount);
      this.isLoading = false;
    }, 800);
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.couponCode = '';
    this.errorMessage = '';
    this.couponApplied.emit({ coupon: null as any, discount: 0 });
    localStorage.removeItem('appliedCoupon');
  }

  private saveAppliedCoupon(coupon: Coupon, discount: number) {
    localStorage.setItem('appliedCoupon', JSON.stringify({
      code: coupon.code,
      discount: discount
    }));
  }

  loadSavedCoupon() {
    const saved = localStorage.getItem('appliedCoupon');
    if (saved && this.cartTotal > 0) {
      const { code } = JSON.parse(saved);
      this.couponCode = code;
      this.applyCoupon();
    }
  }

  getDiscountText(): string {
    if (!this.appliedCoupon) return '';
    
    if (this.appliedCoupon.type === 'percentage') {
      return `${this.appliedCoupon.value}% de descuento`;
    } else {
      return `S/ ${this.appliedCoupon.value} de descuento`;
    }
  }
}
