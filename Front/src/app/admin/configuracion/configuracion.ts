import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ConfiguracionDTO {
    nombreNegocio: string;
    emailContacto: string;
    telefono: string;
    direccion: string;
    lunesViernesInicio: string;
    lunesViernesFin: string;
    sabadoInicio: string;
    sabadoFin: string;
    abiertoDomingos: boolean;
    pagoEfectivo: boolean;
    pagoTarjeta: boolean;
    pagoTransferencia: boolean;
    pagoYapePlin: boolean;
    notifEmailPedidos: boolean;
    notifSms: boolean;
    notifPush: boolean;
    moneda: string;
    zonaHoraria: string;
    idioma: string;
}

@Component({
    selector: 'app-configuracion',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './configuracion.html',
    styleUrl: './configuracion.scss',
})
export class Configuracion implements OnInit {
    private http = inject(HttpClient);
    private apiUrl = `${environment.apiUrl}/configuracion`;

    // Configuración general
    nombreNegocio = '';
    emailContacto = '';
    telefono = '';
    direccion = '';

    // Horarios
    lunesViernesInicio = '';
    lunesViernesFin = '';
    sabadoInicio = '';
    sabadoFin = '';
    abiertoDomingos = false;

    // Métodos de pago
    efectivo = false;
    tarjeta = false;
    transferencia = false;
    yapePlin = false;

    // Notificaciones
    emailPedidos = false;
    smsConfirmaciones = false;
    notifPush = false;

    // Sistema
    moneda = '';
    zonaHoraria = '';
    idioma = '';

    modulosActivos = 8;
    totalUsuarios = 0;
    nivelSeguridad = 'Alto';

    ngOnInit() {
        this.cargarConfiguracion();
        this.cargarEstadisticas();
    }

    cargarConfiguracion() {
        this.http.get<ConfiguracionDTO>(this.apiUrl).subscribe({
            next: (config) => {
                this.nombreNegocio = config.nombreNegocio;
                this.emailContacto = config.emailContacto;
                this.telefono = config.telefono;
                this.direccion = config.direccion;
                
                this.lunesViernesInicio = config.lunesViernesInicio;
                this.lunesViernesFin = config.lunesViernesFin;
                this.sabadoInicio = config.sabadoInicio;
                this.sabadoFin = config.sabadoFin;
                this.abiertoDomingos = config.abiertoDomingos;
                
                this.efectivo = config.pagoEfectivo;
                this.tarjeta = config.pagoTarjeta;
                this.transferencia = config.pagoTransferencia;
                this.yapePlin = config.pagoYapePlin;
                
                this.emailPedidos = config.notifEmailPedidos;
                this.smsConfirmaciones = config.notifSms;
                this.notifPush = config.notifPush;
                
                this.moneda = config.moneda;
                this.zonaHoraria = config.zonaHoraria;
                this.idioma = config.idioma;
            },
            error: (error) => console.error('Error al cargar configuración:', error)
        });
    }

    cargarEstadisticas() {
        // Aquí puedes cargar estadísticas reales desde el backend
        this.http.get<any>(`${environment.apiUrl}/usuarios/count`).subscribe({
            next: (data) => this.totalUsuarios = data,
            error: () => this.totalUsuarios = 1234
        });
    }
}
