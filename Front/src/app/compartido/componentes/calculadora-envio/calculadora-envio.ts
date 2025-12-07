import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface District {
  name: string;
  zone: string;
  basePrice: number;
}

interface ShippingResult {
  district: string;
  price: number;
  deliveryDays: string;
  zone: string;
}

@Component({
  selector: 'app-calculadora-envio',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './calculadora-envio.html',
  styleUrl: './calculadora-envio.scss'
})
export class CalculadoraEnvioComponent {
  @Output() shippingCalculated = new EventEmitter<ShippingResult>();

  selectedDistrict: string = '';
  weight: number = 1;
  quantity: number = 1;
  showResult: boolean = false;
  result: ShippingResult | null = null;

  districts: District[] = [
    // Centro
    { name: 'Lima Cercado', zone: 'centro', basePrice: 10 },
    { name: 'Miraflores', zone: 'centro', basePrice: 10 },
    { name: 'San Isidro', zone: 'centro', basePrice: 10 },
    { name: 'Barranco', zone: 'centro', basePrice: 10 },
    { name: 'Surco', zone: 'centro', basePrice: 12 },
    { name: 'San Borja', zone: 'centro', basePrice: 12 },
    { name: 'La Molina', zone: 'centro', basePrice: 12 },
    
    // Norte
    { name: 'Los Olivos', zone: 'norte', basePrice: 15 },
    { name: 'Independencia', zone: 'norte', basePrice: 15 },
    { name: 'San Martín de Porres', zone: 'norte', basePrice: 15 },
    { name: 'Comas', zone: 'norte', basePrice: 18 },
    { name: 'Carabayllo', zone: 'norte', basePrice: 20 },
    { name: 'Puente Piedra', zone: 'norte', basePrice: 20 },
    { name: 'Santa Rosa', zone: 'norte', basePrice: 22 },
    { name: 'Ancón', zone: 'norte', basePrice: 25 },
    
    // Sur
    { name: 'San Juan de Miraflores', zone: 'sur', basePrice: 15 },
    { name: 'Villa El Salvador', zone: 'sur', basePrice: 18 },
    { name: 'Villa María del Triunfo', zone: 'sur', basePrice: 18 },
    { name: 'Chorrillos', zone: 'sur', basePrice: 12 },
    { name: 'San Juan de Lurigancho', zone: 'sur', basePrice: 18 },
    { name: 'Lurín', zone: 'sur', basePrice: 22 },
    { name: 'Pachacámac', zone: 'sur', basePrice: 25 },
    { name: 'Punta Hermosa', zone: 'sur', basePrice: 30 },
    
    // Este
    { name: 'Ate', zone: 'este', basePrice: 15 },
    { name: 'Santa Anita', zone: 'este', basePrice: 15 },
    { name: 'El Agustino', zone: 'este', basePrice: 15 },
    { name: 'La Victoria', zone: 'este', basePrice: 12 },
    { name: 'San Luis', zone: 'este', basePrice: 12 },
    { name: 'Chaclacayo', zone: 'este', basePrice: 25 },
    { name: 'Lurigancho', zone: 'este', basePrice: 20 },
    
    // Oeste
    { name: 'Callao', zone: 'oeste', basePrice: 15 },
    { name: 'Bellavista', zone: 'oeste', basePrice: 15 },
    { name: 'La Perla', zone: 'oeste', basePrice: 15 },
    { name: 'Carmen de la Legua', zone: 'oeste', basePrice: 15 },
    { name: 'Ventanilla', zone: 'oeste', basePrice: 20 },
    { name: 'Mi Perú', zone: 'oeste', basePrice: 22 }
  ].sort((a, b) => a.name.localeCompare(b.name));

  calculate() {
    if (!this.selectedDistrict) {
      return;
    }

    const district = this.districts.find(d => d.name === this.selectedDistrict);
    if (!district) {
      return;
    }

    // Calcular precio base
    let totalPrice = district.basePrice;

    // Adicional por peso (S/2 por cada kg adicional después del primero)
    if (this.weight > 1) {
      totalPrice += (this.weight - 1) * 2;
    }

    // Adicional por cantidad (S/5 por cada unidad adicional después de la primera)
    if (this.quantity > 1) {
      totalPrice += (this.quantity - 1) * 5;
    }

    // Calcular días de entrega según zona
    let deliveryDays = '';
    switch (district.zone) {
      case 'centro':
        deliveryDays = '24-48 horas';
        break;
      case 'norte':
      case 'sur':
      case 'este':
      case 'oeste':
        deliveryDays = '2-3 días';
        break;
    }

    this.result = {
      district: district.name,
      price: totalPrice,
      deliveryDays: deliveryDays,
      zone: district.zone
    };

    this.showResult = true;
    this.shippingCalculated.emit(this.result);
  }

  reset() {
    this.selectedDistrict = '';
    this.weight = 1;
    this.quantity = 1;
    this.showResult = false;
    this.result = null;
  }

  getZoneLabel(zone: string): string {
    const labels: any = {
      centro: 'Centro de Lima',
      norte: 'Lima Norte',
      sur: 'Lima Sur',
      este: 'Lima Este',
      oeste: 'Callao'
    };
    return labels[zone] || zone;
  }

  getZoneColor(zone: string): string {
    const colors: any = {
      centro: '#10b981',
      norte: '#3b82f6',
      sur: '#f59e0b',
      este: '#8b5cf6',
      oeste: '#06b6d4'
    };
    return colors[zone] || '#6b7280';
  }
}
