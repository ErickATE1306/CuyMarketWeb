import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
    selector: 'app-reportes',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './reportes.html',
    styleUrl: './reportes.scss',
})
export class Reportes {
    showGenerateModal: boolean = false;
    
    reportConfig: any = {
        type: '',
        typeName: '',
        format: 'PDF',
        dateFrom: '',
        dateTo: '',
        includeDetails: true
    };

    // Abrir modal para generar reporte
    openGenerateModal(reportType: string, reportName: string) {
        console.log('Click detectado!', reportType, reportName);
        this.reportConfig = {
            type: reportType,
            typeName: reportName,
            format: 'PDF',
            dateFrom: this.getDefaultDateFrom(),
            dateTo: this.getDefaultDateTo(),
            includeDetails: true
        };
        this.showGenerateModal = true;
        console.log('Modal debería abrirse:', this.showGenerateModal);
    }

    closeGenerateModal() {
        this.showGenerateModal = false;
    }

    // Generar reporte con la configuración seleccionada
    generateReport() {
        console.log('Generando reporte:', this.reportConfig);
        
        // Simulación de generación de reporte
        alert(`Generando ${this.reportConfig.typeName}\nFormato: ${this.reportConfig.format}\nPeríodo: ${this.reportConfig.dateFrom} - ${this.reportConfig.dateTo}`);
        
        // Aquí iría la lógica para generar el reporte (llamada al backend)
        this.closeGenerateModal();
    }

    // Obtener fecha por defecto (hace 30 días)
    getDefaultDateFrom(): string {
        const date = new Date();
        date.setDate(date.getDate() - 30);
        return date.toISOString().split('T')[0];
    }

    // Obtener fecha actual
    getDefaultDateTo(): string {
        const date = new Date();
        return date.toISOString().split('T')[0];
    }
}
