import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PedidoService, Pedido } from '../../compartido/servicios/pedido.service';
import { ReporteService } from '../../compartido/servicios/reporte.service';

interface EstadisticasCompletados {
    totalCompletados: number;
    completadosHoy: number;
    ingresosGenerados: number;
    tasaExito: number;
    cambioVsAyer: number;
}

@Component({
    selector: 'app-completados',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './completados.html',
    styleUrl: './completados.scss',
})
export class Completados implements OnInit {
    private pedidoService = inject(PedidoService);
    private reporteService = inject(ReporteService);

    pedidos: Pedido[] = [];
    pedidosFiltrados: Pedido[] = [];
    loading: boolean = false;
    error: string = '';
    
    showDetailsModal: boolean = false;
    showExportModal: boolean = false;
    selectedOrder: any = null;
    
    filtroActivo: string = 'HOY';
    busqueda: string = '';
    
    formatoExportacion: 'PDF' | 'EXCEL' = 'PDF';
    exportando: boolean = false;
    
    estadisticas: EstadisticasCompletados = {
        totalCompletados: 0,
        completadosHoy: 0,
        ingresosGenerados: 0,
        tasaExito: 0,
        cambioVsAyer: 0
    };

    ngOnInit() {
        this.cargarPedidosCompletados();
    }

    cargarPedidosCompletados() {
        this.loading = true;
        this.error = '';
        
        this.pedidoService.listarPorEstado('ENTREGADO').subscribe({
            next: (pedidos) => {
                this.pedidos = pedidos.sort((a, b) => 
                    new Date(b.fechaPedido).getTime() - new Date(a.fechaPedido).getTime()
                );
                this.aplicarFiltros();
                this.calcularEstadisticas();
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar pedidos completados:', err);
                this.error = 'Error al cargar los pedidos completados';
                this.loading = false;
            }
        });
    }

    aplicarFiltros() {
        let pedidosFiltrados = [...this.pedidos];
        
        // Filtro por período
        const ahora = new Date();
        const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        
        switch (this.filtroActivo) {
            case 'HOY':
                pedidosFiltrados = pedidosFiltrados.filter(p => {
                    const fechaPedido = new Date(p.fechaPedido);
                    return fechaPedido >= hoy;
                });
                break;
            case 'SEMANA':
                const haceUnaSemana = new Date(hoy);
                haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);
                pedidosFiltrados = pedidosFiltrados.filter(p => {
                    const fechaPedido = new Date(p.fechaPedido);
                    return fechaPedido >= haceUnaSemana;
                });
                break;
            case 'MES':
                const haceUnMes = new Date(hoy);
                haceUnMes.setMonth(haceUnMes.getMonth() - 1);
                pedidosFiltrados = pedidosFiltrados.filter(p => {
                    const fechaPedido = new Date(p.fechaPedido);
                    return fechaPedido >= haceUnMes;
                });
                break;
            case 'TODO':
                // No filtrar
                break;
        }
        
        // Filtro por búsqueda
        if (this.busqueda.trim()) {
            const busquedaLower = this.busqueda.toLowerCase();
            pedidosFiltrados = pedidosFiltrados.filter(p =>
                p.numeroPedido.toLowerCase().includes(busquedaLower) ||
                (p.usuarioNombre && p.usuarioNombre.toLowerCase().includes(busquedaLower)) ||
                (p.usuarioEmail && p.usuarioEmail.toLowerCase().includes(busquedaLower))
            );
        }
        
        this.pedidosFiltrados = pedidosFiltrados;
    }

    calcularEstadisticas() {
        const ahora = new Date();
        const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        const ayer = new Date(hoy);
        ayer.setDate(ayer.getDate() - 1);
        
        const pedidosHoy = this.pedidos.filter(p => {
            const fechaPedido = new Date(p.fechaPedido);
            return fechaPedido >= hoy;
        });
        
        const pedidosAyer = this.pedidos.filter(p => {
            const fechaPedido = new Date(p.fechaPedido);
            return fechaPedido >= ayer && fechaPedido < hoy;
        });
        
        const ingresosHoy = pedidosHoy.reduce((sum, p) => sum + p.total, 0);
        
        this.estadisticas = {
            totalCompletados: this.pedidos.length,
            completadosHoy: pedidosHoy.length,
            ingresosGenerados: ingresosHoy,
            tasaExito: 98, // Esto se podría calcular con más datos
            cambioVsAyer: pedidosHoy.length - pedidosAyer.length
        };
    }

    cambiarFiltro(filtro: string) {
        this.filtroActivo = filtro;
        this.aplicarFiltros();
    }

    buscarPedido() {
        this.aplicarFiltros();
    }

    viewOrderDetails(pedido: Pedido) {
        this.selectedOrder = {
            id: pedido.numeroPedido,
            customer: {
                name: pedido.usuarioNombre || 'Cliente',
                phone: pedido.usuarioEmail || '',
                address: pedido.direccionEnvio || 'No especificada'
            },
            products: pedido.items.map(item => ({
                name: `${item.productoNombre}${item.productoRaza ? ' (' + item.productoRaza + ')' : ''}`,
                quantity: item.cantidad,
                price: item.subtotal
            })),
            total: pedido.total,
            date: this.formatearFecha(pedido.fechaPedido),
            completedDate: this.formatearFecha(pedido.fechaPedido),
            totalTime: this.calcularTiempoTotal(pedido.fechaPedido),
            notes: pedido.notas || 'Sin notas adicionales',
            metodoPago: pedido.metodoPago || 'No especificado'
        };
        this.showDetailsModal = true;
    }

    closeDetailsModal() {
        this.showDetailsModal = false;
    }

    printReceipt(pedido: any) {
        console.log('Imprimiendo comprobante del pedido:', pedido.id);
        alert(`Generando comprobante para el pedido ${pedido.id}...`);
    }

    exportarLista() {
        this.showExportModal = true;
    }

    closeExportModal() {
        this.showExportModal = false;
        this.formatoExportacion = 'PDF';
    }

    confirmarExportacion() {
        this.exportando = true;
        
        // Determinar las fechas según el filtro activo
        const ahora = new Date();
        const hoy = new Date(ahora.getFullYear(), ahora.getMonth(), ahora.getDate());
        let fechaInicio: string | undefined;
        let fechaFin: string | undefined;

        switch (this.filtroActivo) {
            case 'HOY':
                fechaInicio = this.formatearFechaISO(hoy);
                fechaFin = this.formatearFechaISO(ahora);
                break;
            case 'SEMANA':
                const haceUnaSemana = new Date(hoy);
                haceUnaSemana.setDate(haceUnaSemana.getDate() - 7);
                fechaInicio = this.formatearFechaISO(haceUnaSemana);
                fechaFin = this.formatearFechaISO(ahora);
                break;
            case 'MES':
                const haceUnMes = new Date(hoy);
                haceUnMes.setMonth(haceUnMes.getMonth() - 1);
                fechaInicio = this.formatearFechaISO(haceUnMes);
                fechaFin = this.formatearFechaISO(ahora);
                break;
            case 'TODO':
                // No enviar fechas para obtener todo
                fechaInicio = undefined;
                fechaFin = undefined;
                break;
        }

        this.reporteService.generarReportePedidosCompletados(this.formatoExportacion, fechaInicio, fechaFin)
            .subscribe({
                next: (blob) => {
                    // Crear URL y descargar archivo
                    const url = window.URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    const extension = this.formatoExportacion === 'PDF' ? 'pdf' : 'xlsx';
                    const fecha = new Date().toISOString().split('T')[0];
                    link.download = `Pedidos_Completados_${fecha}.${extension}`;
                    link.click();
                    window.URL.revokeObjectURL(url);
                    
                    this.exportando = false;
                    this.closeExportModal();
                    alert(`Reporte exportado exitosamente en formato ${this.formatoExportacion} y guardado en la base de datos`);
                },
                error: (err) => {
                    console.error('Error al exportar reporte:', err);
                    this.exportando = false;
                    alert('Error al generar el reporte. Por favor, intente nuevamente.');
                }
            });
    }

    formatearFechaISO(fecha: Date): string {
        const year = fecha.getFullYear();
        const month = String(fecha.getMonth() + 1).padStart(2, '0');
        const day = String(fecha.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    formatearFecha(fecha: string): string {
        const date = new Date(fecha);
        const dia = String(date.getDate()).padStart(2, '0');
        const mes = String(date.getMonth() + 1).padStart(2, '0');
        const anio = date.getFullYear();
        const horas = String(date.getHours()).padStart(2, '0');
        const minutos = String(date.getMinutes()).padStart(2, '0');
        return `${dia}/${mes}/${anio} ${horas}:${minutos}`;
    }

    calcularTiempoTotal(fechaInicio: string): string {
        // Simulación: calcular horas transcurridas desde el inicio
        const inicio = new Date(fechaInicio);
        const ahora = new Date();
        const diffHoras = Math.abs(ahora.getTime() - inicio.getTime()) / 36e5;
        return `${diffHoras.toFixed(1)}h`;
    }

    obtenerClaseTiempo(tiempo: string): string {
        const horas = parseFloat(tiempo);
        if (horas < 3) return 'fast';
        if (horas < 5) return 'normal';
        return 'slow';
    }

    obtenerIniciales(nombre: string): string {
        if (!nombre) return 'C';
        const partes = nombre.trim().split(' ');
        if (partes.length >= 2) {
            return (partes[0][0] + partes[1][0]).toUpperCase();
        }
        return nombre.substring(0, 2).toUpperCase();
    }
}
