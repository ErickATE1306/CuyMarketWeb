package com.cuymarket.backend.dto.sistema;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConfiguracionDTO {
    
    // Información del negocio
    private String nombreNegocio;
    private String emailContacto;
    private String telefono;
    private String direccion;
    
    // Horarios
    private String lunesViernesInicio;
    private String lunesViernesFin;
    private String sabadoInicio;
    private String sabadoFin;
    private boolean abiertoDomingos;
    
    // Métodos de pago
    private boolean pagoEfectivo;
    private boolean pagoTarjeta;
    private boolean pagoTransferencia;
    private boolean pagoYapePlin;
    
    // Notificaciones
    private boolean notifEmailPedidos;
    private boolean notifSms;
    private boolean notifPush;
    
    // Sistema
    private String moneda;
    private String zonaHoraria;
    private String idioma;
}
