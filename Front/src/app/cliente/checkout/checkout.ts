import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EntradaCuponComponent } from '../../compartido/componentes/entrada-cupon/entrada-cupon';
import { CarritoService, ItemCarrito } from '../../compartido/servicios/carrito.service';
import { DireccionService, Direccion } from '../../compartido/servicios/direccion.service';
import { PedidoService } from '../../compartido/servicios/pedido.service';
import { UsuarioService } from '../../compartido/servicios/usuario.service';
import { ToastService } from '../../compartido/servicios/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, EntradaCuponComponent],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss'
})
export class Checkout implements OnInit, OnDestroy {
  currentStep = 1;
  cartItems: ItemCarrito[] = [];
  total = 0;
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
    ciudad: '',
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
    numeroOperacion: '',
    comprobante: null as File | null
  };

  // Resumen
  acceptTerms = false;
  processingPayment = false;

  private carritoSubscription?: Subscription;

  constructor(
    private router: Router,
    private carritoService: CarritoService,
    private direccionService: DireccionService,
    private pedidoService: PedidoService,
    private usuarioService: UsuarioService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.cargarCarrito();
    this.loadUserData();
  }

  ngOnDestroy() {
    this.carritoSubscription?.unsubscribe();
  }

  cargarCarrito() {
    this.carritoSubscription = this.carritoService.carrito$.subscribe(carrito => {
      if (carrito) {
        this.cartItems = carrito.items;
        this.total = carrito.total;
      } else {
        this.cartItems = [];
        this.total = 0;
      }

      if (this.cartItems.length === 0) {
        // Si carga y está vacío, redirigir. 
        // Ojo: al inicio puede ser null mientras carga, validar mejor si queremos redirigir solo si cargó y está vacío.
        // Por ahora dejamos validación en proceedToCheckout del carrito.
      }
    });
    this.carritoService.cargarCarrito();
  }

  loadUserData() {
    this.usuarioService.obtenerPerfil().subscribe({
      next: (perfil) => {
        if (perfil) {
          this.shippingInfo.nombre = perfil.nombre;
          this.shippingInfo.apellido = perfil.apellido;
          this.shippingInfo.email = perfil.email;
          this.shippingInfo.telefono = perfil.telefono;
          this.shippingInfo.dni = perfil.dni;
        }
      },
      error: () => console.log('No se pudo cargar perfil')
    });

    // Cargar dirección principal si existe
    this.direccionService.obtenerDireccionPrincipal().subscribe({
      next: (direccion) => {
        if (direccion) {
          this.shippingInfo.nombre = direccion.nombre;
          this.shippingInfo.apellido = direccion.apellido;
          this.shippingInfo.telefono = direccion.telefono;
          this.shippingInfo.direccion = direccion.direccion;
          this.shippingInfo.referencia = direccion.referencia || '';
          this.shippingInfo.ciudad = direccion.ciudad;
          this.shippingInfo.distrito = direccion.distrito;
          this.shippingInfo.codigoPostal = direccion.codigoPostal || '';
        }
      },
      error: () => console.log('No hay dirección principal')
    });
  }

  getSubtotal(): number {
    return this.total;
  }

  getEnvio(): number {
    // Envío gratis para compras mayores o iguales a S/ 100
    return this.total >= 100 ? 0 : 15.00;
  }

  getTotal(): number {
    return this.getSubtotal() + this.getEnvio() - this.discountAmount;
  }

  onCouponApplied(event: any) {
    this.appliedCoupon = event.coupon;
    this.discountAmount = event.discount;
    this.toastService.success(`Cupón ${this.appliedCoupon.codigo} aplicado`);
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
    const { nombre, apellido, email, telefono, dni, direccion, ciudad, distrito } = this.shippingInfo;
    return !!(nombre && apellido && email && telefono && dni && direccion && ciudad && distrito);
  }

  validatePayment(): boolean {
    if (this.paymentMethod === 'tarjeta') {
      const { numero, titular, vencimiento, cvv } = this.cardInfo;
      return !!(numero && titular && vencimiento && cvv) &&
        numero.replace(/\s/g, '').length === 16 &&
        cvv.length === 3;
    } else if (this.paymentMethod === 'yape' || this.paymentMethod === 'plin') {
      // Validar comprobante solo si es necesario subirlo ahora.
      // El backend actual solo pide 'metodoPago'. 
      // Si requerimos comprobante, necesitaríamos subir imagen primero.
      // Por simplicidad, asumiremos que solo registramos la intención de pago o que el backend no procesa imágenes aun.
      return !!this.yapeInfo.telefono;
    } else if (this.paymentMethod === 'transferencia') {
      // Idem
      return true;
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

  processPayment() {
    if (!this.acceptTerms) {
      this.toastService.warning('Debes aceptar los términos y condiciones');
      return;
    }

    this.processingPayment = true;

    // 1. Guardar Dirección
    const nuevaDireccion: Direccion = {
      nombre: this.shippingInfo.nombre,
      apellido: this.shippingInfo.apellido,
      telefono: this.shippingInfo.telefono,
      direccion: this.shippingInfo.direccion,
      referencia: this.shippingInfo.referencia,
      ciudad: this.shippingInfo.ciudad,
      distrito: this.shippingInfo.distrito,
      codigoPostal: this.shippingInfo.codigoPostal,
      esPrincipal: true // Marcar como principal para usarla en futuros pedidos
    };

    this.direccionService.guardar(nuevaDireccion).subscribe({
      next: (direccionGuardada) => {
        if (!direccionGuardada.id) {
          this.toastService.error('Error al guardar dirección');
          this.processingPayment = false;
          return;
        }

        // 2. Crear Pedido con información de pago
        const formData = new FormData();
        formData.append('direccionEnvioId', direccionGuardada.id.toString());
        formData.append('metodoPago', this.paymentMethod.toUpperCase());
        if (this.appliedCoupon) {
          formData.append('codigoCupon', this.appliedCoupon.codigo);
        }

        // Agregar información específica del método de pago
        if (this.paymentMethod === 'yape' || this.paymentMethod === 'plin') {
          if (this.yapeInfo.telefono) {
            formData.append('telefono', this.yapeInfo.telefono);
          }
          if (this.yapeInfo.comprobante) {
            formData.append('comprobante', this.yapeInfo.comprobante);
          }
        } else if (this.paymentMethod === 'transferencia') {
          if (this.transferInfo.banco) {
            formData.append('banco', this.transferInfo.banco);
          }
          if (this.transferInfo.comprobante) {
            formData.append('comprobante', this.transferInfo.comprobante);
          }
          if (this.transferInfo.numeroOperacion) {
            formData.append('numeroOperacion', this.transferInfo.numeroOperacion);
          }
        }

        this.pedidoService.crearPedido(formData).subscribe({
          next: (pedido) => {
            this.toastService.success('Pedido creado exitosamente');
            this.carritoService.vaciarCarrito().subscribe(); // Limpiar carrito (aunque backend ya debería hacerlo al crear pedido)
            this.processingPayment = false;
            this.router.navigate(['/cliente/orden-confirmada', pedido.id]);
          },
          error: (err) => {
            console.error('Error creando pedido', err);
            this.toastService.error('Error al procesar el pedido');
            this.processingPayment = false;
          }
        });
      },
      error: (err) => {
        console.error('Error guardando dirección', err);
        this.toastService.error('Error al guardar la dirección de envío');
        this.processingPayment = false;
      }
    });
  }
}
