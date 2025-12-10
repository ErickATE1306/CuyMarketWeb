import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReporteService, ReporteHistorial } from '../../compartido/servicios/reporte.service';

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './reportes.html',
    styleUrl: './reportes.scss',
})
export class Reportes implements OnInit {
    private reporteService = inject(ReporteService);

    showFormatoModal = false;
    reporteSeleccionado = '';
    cargando = false;
    reportesRecientes: ReporteHistorial[] = [];
    totalReportes = 0;
    reportesMes = 0;

    ngOnInit() {
        this.cargarEstadisticas();
        this.cargarReportesRecientes();
    }

    cargarEstadisticas() {
        console.log('Cargando estadísticas...');
        this.reporteService.listarHistorial().subscribe({
            next: (reportes) => {
                console.log('Estadísticas recibidas:', reportes);
                this.totalReportes = reportes.length;
                
                // Contar reportes del mes actual
                const mesActual = new Date().getMonth();
                const añoActual = new Date().getFullYear();
                this.reportesMes = reportes.filter(r => {
                    const fecha = new Date(r.fechaGeneracion);
                    return fecha.getMonth() === mesActual && fecha.getFullYear() === añoActual;
                }).length;
                
                console.log('Total reportes:', this.totalReportes);
                console.log('Reportes este mes:', this.reportesMes);
            },
            error: (error) => {
                console.error('Error al cargar estadísticas:', error);
            }
        });
    }

    cargarReportesRecientes() {
        console.log('Cargando reportes recientes...');
        this.reporteService.listarRecientes().subscribe({
            next: (reportes) => {
                console.log('Reportes recientes recibidos:', reportes);
                this.reportesRecientes = reportes;
            },
            error: (error) => {
                console.error('Error al cargar reportes recientes:', error);
                console.error('Detalles del error:', error.error);
                console.error('Status:', error.status);
            }
        });
    }

    abrirModal(tipo: string) {
        this.reporteSeleccionado = tipo;
        this.showFormatoModal = true;
    }

    cerrarModal() {
        this.showFormatoModal = false;
        this.reporteSeleccionado = '';
    }

    generarReporte(formato: 'PDF' | 'EXCEL') {
        this.cargando = true;
        
        let observable;
        let nombreReporte = '';

        switch(this.reporteSeleccionado) {
            case 'ventas':
                observable = this.reporteService.generarReporteVentas(formato);
                nombreReporte = 'Reporte_Ventas';
                break;
            case 'pedidos':
                observable = this.reporteService.generarReportePedidos(formato);
                nombreReporte = 'Reporte_Pedidos';
                break;
            case 'inventario':
                observable = this.reporteService.generarReporteInventario(formato);
                nombreReporte = 'Reporte_Inventario';
                break;
            case 'clientes':
                observable = this.reporteService.generarReporteClientes(formato);
                nombreReporte = 'Reporte_Clientes';
                break;
            default:
                this.cargando = false;
                this.cerrarModal();
                return;
        }

        observable.subscribe({
            next: (blob) => {
                const extension = formato === 'PDF' ? '.pdf' : '.xlsx';
                const fecha = new Date().toISOString().split('T')[0];
                this.descargarArchivo(blob, `${nombreReporte}_${fecha}${extension}`);
                this.cargando = false;
                this.cerrarModal();
                // Recargar reportes recientes después de generar
                setTimeout(() => this.cargarReportesRecientes(), 500);
            },
            error: (error) => {
                console.error('Error al generar reporte:', error);
                alert('Error al generar el reporte. Por favor intente nuevamente.');
                this.cargando = false;
                this.cerrarModal();
            }
        });
    }

    private descargarArchivo(blob: Blob, nombre: string) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = nombre;
        link.click();
        window.URL.revokeObjectURL(url);
    }

    formatearFecha(fecha: string): string {
        if (!fecha) return 'N/A';
        const date = new Date(fecha);
        return date.toLocaleString('es-PE', { 
            day: '2-digit', 
            month: '2-digit', 
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    formatearHora(fecha: string): string {
        if (!fecha) return 'N/A';
        const date = new Date(fecha);
        return date.toLocaleTimeString('es-PE', { 
            hour: '2-digit',
            minute: '2-digit'
        });
    }
}


