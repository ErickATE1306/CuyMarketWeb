import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

interface Pedido {
    id: number;
    numeroPedido: string;
    fechaPedido: string;
    estado: string;
    estadoPago?: string;
    items: Array<{
        id: number;
        productoId: number;
        productoNombre: string;
        productoRaza?: string;
        cantidad: number;
        precioUnitario: number;
        subtotal: number;
    }>;
    subtotal: number;
    descuento: number;
    costoEnvio: number;
    total: number;
    metodoPago?: string;
    notas?: string;
    direccionEnvio?: string;
    usuarioNombre?: string;
    usuarioEmail?: string;
    informacionPagoId?: number;
    tieneComprobante?: boolean;
}

interface EstadisticasPedidos {
    totalPendientes: number;
    completadosHoy: number;
    entregasProgramadas: number;
    tiempoPromedio: string;
}

@Component({
    selector: 'app-gestion-pedidos',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './gestion-pedidos.html',
    styleUrl: './gestion-pedidos.scss',
})
export class GestionPedidos implements OnInit {
    private http = inject(HttpClient);
    private sanitizer = inject(DomSanitizer);
    private apiUrl = `${environment.apiUrl}/pedidos`;

    showDetailsModal: boolean = false;
    showProcessModal: boolean = false;
    showComprobanteModal: boolean = false;
    comprobanteUrl: SafeUrl | string = '';
    pedidoSeleccionadoComprobante: Pedido | null = null;
    
    pedidos: Pedido[] = [];
    pedidosFiltrados: Pedido[] = [];
    selectedOrder: any = null;
    processAction: string = '';
    processNotes: string = '';
    
    // Estadísticas
    totalPendientes = 0;
    totalEnProceso = 0;
    totalListos = 0;
    completadosHoy = 0;
    entregasProgramadas = 0;
    tiempoPromedio = '2.5h';
    
    // Filtros
    filtroActual = 'TODOS';
    busqueda = '';

    ngOnInit() {
        this.cargarPedidos();
        this.cargarEstadisticas();
    }

    cargarPedidos() {
        this.http.get<Pedido[]>(`${this.apiUrl}/empleado/todos`).subscribe({
            next: (pedidos) => {
                console.log('Pedidos recibidos:', pedidos);
                this.pedidos = pedidos;
                this.aplicarFiltros();
            },
            error: (error) => {
                console.error('Error al cargar pedidos:', error);
                // Datos de ejemplo en caso de error
                this.pedidos = [];
            }
        });
    }

    cargarEstadisticas() {
        // Calcular estadísticas desde los pedidos cargados
        this.totalPendientes = this.pedidos.filter(p => p.estado === 'PENDIENTE').length;
        this.totalEnProceso = this.pedidos.filter(p => p.estado === 'EN_PROCESO').length;
        this.totalListos = this.pedidos.filter(p => p.estado === 'ENTREGADO').length;
        
        const hoy = new Date().toISOString().split('T')[0];
        this.completadosHoy = this.pedidos.filter(p => 
            p.estado === 'ENTREGADO' && p.fechaPedido.startsWith(hoy)
        ).length;
        
        this.entregasProgramadas = this.pedidos.filter(p => 
            p.estado === 'EN_CAMINO'
        ).length;
    }

    aplicarFiltros() {
        let resultado = [...this.pedidos];

        // Filtro por estado
        if (this.filtroActual !== 'TODOS') {
            if (this.filtroActual === 'PENDIENTES') {
                resultado = resultado.filter(p => p.estado === 'PENDIENTE');
            } else if (this.filtroActual === 'EN_PROCESO') {
                resultado = resultado.filter(p => p.estado === 'EN_PROCESO');
            } else if (this.filtroActual === 'LISTOS') {
                resultado = resultado.filter(p => p.estado === 'ENTREGADO');
            }
        }

        // Filtro por búsqueda
        if (this.busqueda) {
            const termino = this.busqueda.toLowerCase();
            resultado = resultado.filter(p => 
                p.numeroPedido.toLowerCase().includes(termino) ||
                (p.usuarioNombre && p.usuarioNombre.toLowerCase().includes(termino)) ||
                (p.usuarioEmail && p.usuarioEmail.toLowerCase().includes(termino))
            );
        }

        this.pedidosFiltrados = resultado;
    }

    cambiarFiltro(filtro: string) {
        this.filtroActual = filtro;
        this.aplicarFiltros();
    }

    buscarPedido() {
        this.aplicarFiltros();
    }

    // Ver detalles del pedido
    viewOrderDetails(pedido: Pedido) {
        this.selectedOrder = {
            id: pedido.numeroPedido,
            customer: {
                name: pedido.usuarioNombre || 'Cliente',
                phone: pedido.usuarioEmail || 'No disponible',
                address: pedido.direccionEnvio || 'No especificada'
            },
            products: pedido.items.map(item => ({
                name: item.productoNombre,
                quantity: item.cantidad,
                price: item.precioUnitario
            })),
            quantity: `${pedido.items.reduce((sum, item) => sum + item.cantidad, 0)} unidades`,
            total: pedido.total,
            date: new Date(pedido.fechaPedido).toLocaleString('es-PE'),
            status: this.traducirEstado(pedido.estado),
            estadoPago: pedido.estadoPago ? this.traducirEstadoPago(pedido.estadoPago) : 'Pendiente',
            metodoPago: pedido.metodoPago ? this.traducirMetodoPago(pedido.metodoPago) : 'No especificado',
            notes: ''
        };
        this.showDetailsModal = true;
    }

    closeDetailsModal() {
        this.showDetailsModal = false;
    }

    // Procesar pedido (aprobar, completar, entregar)
    processOrder(pedido: Pedido, action: string) {
        this.selectedOrder = {
            id: pedido.id,
            numeroPedido: pedido.numeroPedido,
            customer: {
                name: pedido.usuarioNombre || 'Cliente',
                phone: pedido.usuarioEmail || 'No disponible',
                address: pedido.direccionEnvio || 'No especificada'
            },
            total: pedido.total,
            estadoActual: pedido.estado
        };
        this.processAction = action;
        this.processNotes = '';
        this.showProcessModal = true;
    }

    closeProcessModal() {
        this.showProcessModal = false;
    }

    confirmProcess() {
        const pedidoId = this.selectedOrder.id;
        let nuevoEstado = '';

        switch (this.processAction) {
            case 'aprobar':
                nuevoEstado = 'EN_PROCESO';
                break;
            case 'completar':
                nuevoEstado = 'EN_CAMINO';
                break;
            case 'entregar':
                nuevoEstado = 'ENTREGADO';
                break;
        }

        if (!nuevoEstado) {
            console.error('Acción no válida');
            return;
        }

        this.http.put(`${this.apiUrl}/${pedidoId}/estado`, { estado: nuevoEstado }).subscribe({
            next: () => {
                console.log('Pedido actualizado correctamente');
                this.cargarPedidos();
                this.cargarEstadisticas();
                this.closeProcessModal();
            },
            error: (error) => {
                console.error('Error al actualizar pedido:', error);
                alert('Error al actualizar el pedido');
            }
        });
    }

    traducirEstado(estado: string): string {
        const estados: any = {
            'PENDIENTE': 'Pendiente',
            'EN_PROCESO': 'En Proceso',
            'EN_CAMINO': 'En Camino',
            'ENTREGADO': 'Entregado',
            'CANCELADO': 'Cancelado'
        };
        return estados[estado] || estado;
    }

    traducirEstadoPago(estado: string): string {
        const estados: any = {
            'PENDIENTE': 'Pendiente',
            'PAGADO': 'Pagado',
            'RECHAZADO': 'Rechazado'
        };
        return estados[estado] || estado;
    }

    traducirMetodoPago(metodo: string): string {
        const metodos: any = {
            'TARJETA': 'Tarjeta',
            'TRANSFERENCIA': 'Transferencia',
            'YAPE': 'Yape',
            'PLIN': 'Plin'
        };
        return metodos[metodo] || metodo;
    }

    obtenerClaseEstado(estado: string): string {
        const clases: any = {
            'PENDIENTE': 'pending',
            'EN_PROCESO': 'processing',
            'EN_CAMINO': 'processing',
            'ENTREGADO': 'completed',
            'CANCELADO': 'cancelled'
        };
        return clases[estado] || '';
    }

    obtenerIniciales(nombreCompleto?: string): string {
        if (!nombreCompleto) return 'U';
        const partes = nombreCompleto.trim().split(' ');
        if (partes.length === 1) return partes[0].charAt(0).toUpperCase();
        return partes[0].charAt(0).toUpperCase() + partes[partes.length - 1].charAt(0).toUpperCase();
    }

    calcularTotalUnidades(items: any[]): number {
        return items.reduce((sum, item) => sum + item.cantidad, 0);
    }

    formatearFecha(fecha: string): string {
        return new Date(fecha).toLocaleString('es-PE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    obtenerTextoAccion(estado: string): string {
        const textos: any = {
            'PENDIENTE': 'Aprobar',
            'EN_PROCESO': 'Marcar en camino',
            'EN_CAMINO': 'Marcar como entregado'
        };
        return textos[estado] || 'Procesar';
    }

    obtenerAccion(estado: string): string {
        const acciones: any = {
            'PENDIENTE': 'aprobar',
            'EN_PROCESO': 'completar',
            'EN_CAMINO': 'entregar'
        };
        return acciones[estado] || 'aprobar';
    }

    getComprobanteUrl(pedidoId: number): string {
        const token = localStorage.getItem('token');
        return `${this.apiUrl}/${pedidoId}/comprobante?token=${token}`;
    }

    verComprobante(pedido: Pedido): void {
        if (pedido.tieneComprobante) {
            this.pedidoSeleccionadoComprobante = pedido;
            const token = localStorage.getItem('token');
            const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
            
            this.http.get(`${this.apiUrl}/${pedido.id}/comprobante`, {
                headers: headers,
                responseType: 'blob'
            }).subscribe({
                next: (blob) => {
                    const objectUrl = URL.createObjectURL(blob);
                    this.comprobanteUrl = this.sanitizer.bypassSecurityTrustUrl(objectUrl);
                    this.showComprobanteModal = true;
                },
                error: (error) => {
                    console.error('Error al cargar comprobante:', error);
                    alert('No se pudo cargar el comprobante');
                }
            });
        }
    }

    cerrarComprobanteModal(): void {
        this.showComprobanteModal = false;
        this.pedidoSeleccionadoComprobante = null;
        // Limpiar la URL del objeto para liberar memoria
        if (typeof this.comprobanteUrl === 'object') {
            URL.revokeObjectURL(this.comprobanteUrl as any);
        }
        this.comprobanteUrl = '';
    }

    cambiarEstadoPago(nuevoEstado: string): void {
        if (!this.pedidoSeleccionadoComprobante) return;

        const pedidoId = this.pedidoSeleccionadoComprobante.id;
        
        this.http.put(`${this.apiUrl}/${pedidoId}/estado-pago`, { estadoPago: nuevoEstado }).subscribe({
            next: () => {
                console.log('Estado de pago actualizado correctamente');
                this.cargarPedidos();
                this.cerrarComprobanteModal();
                alert(`Pago ${nuevoEstado === 'PAGADO' ? 'aprobado' : 'rechazado'} exitosamente`);
            },
            error: (error) => {
                console.error('Error al actualizar estado de pago:', error);
                alert('Error al actualizar el estado de pago');
            }
        });
    }

    obtenerClaseEstadoPago(estadoPago?: string): string {
        if (!estadoPago) return '';
        const clases: any = {
            'PENDIENTE': 'pendiente',
            'PAGADO': 'en-camino',
            'RECHAZADO': 'cancelado'
        };
        return clases[estadoPago] || '';
    }
}
