import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ReporteService, ReporteHistorial } from '../../compartido/servicios/reporte.service';
import { PedidoService } from '../../compartido/servicios/pedido.service';

interface EstadisticasReportes {
    reportesGenerados: number;
    pedidosProcesados: number;
    tiempoPromedio: string;
    tasaExito: string;
}

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reportes.html',
    styleUrl: './reportes.scss'  
})
export class Reportes implements OnInit {
    private reporteService = inject(ReporteService);
    private pedidoService = inject(PedidoService);

    showGenerateModal: boolean = false;
    loading: boolean = false;
    error: string = '';
    
    reportConfig = {
        type: '',
        typeName: '',
        format: 'PDF' as 'PDF' | 'EXCEL',
        dateFrom: '',
        dateTo: '',
        includeDetails: true
    };

    estadisticas: EstadisticasReportes = {
        reportesGenerados: 0,
        pedidosProcesados: 0,
        tiempoPromedio: '0h',
        tasaExito: '0%'
    };

    reportesRecientes: ReporteHistorial[] = [];
    generandoReporte: boolean = false;

    ngOnInit() {
        this.cargarEstadisticas();
        this.cargarReportesRecientes();
    }

    cargarEstadisticas() {
        this.loading = true;
        
        // Cargar reportes recientes para contar
        this.reporteService.listarRecientes().subscribe({
            next: (reportes) => {
                this.estadisticas.reportesGenerados = reportes.length;
            },
            error: (err) => console.error('Error al cargar reportes:', err)
        });

        // Cargar pedidos completados del mes actual
        const primerDiaMes = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const ultimoDiaMes = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0);

        this.pedidoService.listarPorFecha(
            primerDiaMes.toISOString().split('T')[0],
            ultimoDiaMes.toISOString().split('T')[0]
        ).subscribe({
            next: (pedidos) => {
                const completados = pedidos.filter(p => p.estado === 'ENTREGADO');
                this.estadisticas.pedidosProcesados = completados.length;
                
                // Calcular tiempo promedio (simulado - necesitarías la fecha real de procesamiento)
                this.estadisticas.tiempoPromedio = '2.5h';
                
                // Calcular tasa de éxito
                if (pedidos.length > 0) {
                    const tasa = (completados.length / pedidos.length) * 100;
                    this.estadisticas.tasaExito = `${Math.round(tasa)}%`;
                } else {
                    this.estadisticas.tasaExito = '0%';
                }
                
                this.loading = false;
            },
            error: (err) => {
                console.error('Error al cargar pedidos:', err);
                this.loading = false;
            }
        });
    }

    cargarReportesRecientes() {
        this.reporteService.listarRecientes().subscribe({
            next: (reportes) => {
                this.reportesRecientes = reportes;
            },
            error: (err) => {
                console.error('Error al cargar reportes recientes:', err);
            }
        });
    }

    openGenerateModal(reportType: string, reportName: string) {
        this.reportConfig = {
            type: reportType,
            typeName: reportName,
            format: 'PDF',
            dateFrom: this.getDefaultDateFrom(),
            dateTo: this.getDefaultDateTo(),
            includeDetails: true
        };
        this.showGenerateModal = true;
    }

    closeGenerateModal() {
        this.showGenerateModal = false;
    }

    generateReport() {
        if (!this.reportConfig.dateFrom || !this.reportConfig.dateTo) {
            alert('Por favor selecciona un rango de fechas válido');
            return;
        }

        this.generandoReporte = true;
        const formato = this.reportConfig.format === 'PDF' ? 'PDF' : 'EXCEL';

        let observable;
        
        switch (this.reportConfig.type) {
            case 'pedidos':
                observable = this.reporteService.generarReportePedidos(
                    formato,
                    this.reportConfig.dateFrom,
                    this.reportConfig.dateTo
                );
                break;
            case 'entregas':
                // Usar el mismo endpoint de pedidos pero filtrado por entregados
                observable = this.reporteService.generarReportePedidosCompletados(
                    formato,
                    this.reportConfig.dateFrom,
                    this.reportConfig.dateTo
                );
                break;
            case 'rendimiento':
                // Por ahora usar reporte de pedidos
                observable = this.reporteService.generarReportePedidos(
                    formato,
                    this.reportConfig.dateFrom,
                    this.reportConfig.dateTo
                );
                break;
            default:
                alert('Tipo de reporte no soportado');
                this.generandoReporte = false;
                return;
        }

        observable.subscribe({
            next: (blob) => {
                // Descargar el archivo
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                
                const extension = formato === 'PDF' ? 'pdf' : 'xlsx';
                const fecha = new Date().toISOString().split('T')[0];
                link.download = `${this.reportConfig.type}_${fecha}.${extension}`;
                
                link.click();
                window.URL.revokeObjectURL(url);
                
                this.generandoReporte = false;
                this.closeGenerateModal();
                
                // Recargar lista de reportes
                this.cargarReportesRecientes();
                this.cargarEstadisticas();
                
                alert('Reporte generado exitosamente');
            },
            error: (err) => {
                console.error('Error al generar reporte:', err);
                this.generandoReporte = false;
                alert('Error al generar el reporte. Por favor intenta de nuevo.');
            }
        });
    }

    descargarReporte(reporte: ReporteHistorial) {
        // Por ahora solo mostrar mensaje
        alert(`Descargando reporte: ${reporte.nombre}`);
        // Aquí iría la lógica para descargar el reporte guardado
    }

    verTodosReportes() {
        this.reporteService.listarHistorial().subscribe({
            next: (reportes) => {
                console.log('Todos los reportes:', reportes);
                // Aquí podrías abrir un modal o navegar a otra vista
                alert(`Total de reportes: ${reportes.length}`);
            },
            error: (err) => {
                console.error('Error al cargar historial:', err);
            }
        });
    }

    getDefaultDateFrom(): string {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    }

    getDefaultDateTo(): string {
        const date = new Date();
        return date.toISOString().split('T')[0];
    }

    formatearFecha(fecha: string): string {
        const date = new Date(fecha);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    obtenerBadgeFormato(formato: string): string {
        return formato.toUpperCase() === 'PDF' ? 'completed' : 'processing';
    }
}
