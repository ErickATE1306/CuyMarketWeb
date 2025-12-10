import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FinanzasService, FinanzasResumen, MetodoPago } from '../../compartido/servicios/finanzas.service';

@Component({
    selector: 'app-finanzas',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './finanzas.html',
    styleUrl: './finanzas.scss',
})
export class Finanzas implements OnInit {
    private finanzasService = inject(FinanzasService);

    resumen: FinanzasResumen | null = null;
    loading: boolean = false;
    metodosPagoArray: MetodoPago[] = [];
    periodoSeleccionado: string = '6meses';

    ngOnInit() {
        this.cargarResumen();
    }

    cargarResumen() {
        this.loading = true;
        this.finanzasService.obtenerResumen().subscribe({
            next: (resumen) => {
                this.resumen = resumen;
                this.procesarMetodosPago();
                this.loading = false;
            },
            error: (error) => {
                console.error('Error al cargar resumen de finanzas:', error);
                this.loading = false;
            }
        });
    }

    procesarMetodosPago() {
        if (!this.resumen || !this.resumen.metodosPago) {
            return;
        }

        this.metodosPagoArray = Object.values(this.resumen.metodosPago)
            .sort((a, b) => b.porcentaje - a.porcentaje);
    }

    formatearMoneda(monto: number): string {
        return `S/ ${monto?.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || '0.00'}`;
    }

    formatearPorcentaje(valor: number): string {
        const signo = valor >= 0 ? '+' : '';
        return `${signo}${valor?.toFixed(1) || '0'}%`;
    }

    obtenerClaseCambio(valor: number): string {
        return valor >= 0 ? 'positive' : 'negative';
    }

    getNombreMes(mes: number): string {
        const meses = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        return meses[mes - 1] || '';
    }

    traducirMetodoPago(metodo: string): string {
        const traducciones: { [key: string]: string } = {
            'EFECTIVO': 'Efectivo',
            'TARJETA': 'Tarjeta',
            'TRANSFERENCIA': 'Transferencia',
            'YAPE': 'Yape',
            'PLIN': 'Plin'
        };
        return traducciones[metodo] || metodo;
    }

    traducirEstado(estado: string): string {
        const traducciones: { [key: string]: string } = {
            'PAGADO': 'Completado',
            'PENDIENTE': 'Pendiente',
            'PROCESANDO': 'Procesando',
            'CANCELADO': 'Cancelado'
        };
        return traducciones[estado] || estado;
    }

    getEstadoBadgeClass(estado: string): string {
        const clases: { [key: string]: string } = {
            'PAGADO': 'completed',
            'PENDIENTE': 'pending',
            'PROCESANDO': 'processing',
            'CANCELADO': 'cancelled'
        };
        return clases[estado] || 'pending';
    }

    generarReporte() {
        alert('Funcionalidad de generación de reportes en desarrollo');
    }

    cambiarPeriodo(periodo: string) {
        this.periodoSeleccionado = periodo;
        // Aquí se podría implementar la lógica para cambiar el período de visualización
    }

    calcularAlturaBarra(monto: number): number {
        if (!this.resumen || !this.resumen.ingresosMensuales || this.resumen.ingresosMensuales.length === 0) {
            return 0;
        }

        const maxMonto = Math.max(...this.resumen.ingresosMensuales.map(i => i.monto));
        if (maxMonto === 0) return 0;

        return (monto / maxMonto) * 100;
    }
}
