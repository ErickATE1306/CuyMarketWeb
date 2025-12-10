package com.cuymarket.backend.controller;

import com.cuymarket.backend.dto.sistema.ConfiguracionDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/configuracion")
@RequiredArgsConstructor
public class ConfiguracionController {

    // Información del negocio
    @Value("${app.negocio.nombre}")
    private String nombreNegocio;
    
    @Value("${app.negocio.email}")
    private String emailContacto;
    
    @Value("${app.negocio.telefono}")
    private String telefono;
    
    @Value("${app.negocio.direccion}")
    private String direccion;

    // Horarios
    @Value("${app.horario.lunes-viernes.inicio}")
    private String lunesViernesInicio;
    
    @Value("${app.horario.lunes-viernes.fin}")
    private String lunesViernesFin;
    
    @Value("${app.horario.sabado.inicio}")
    private String sabadoInicio;
    
    @Value("${app.horario.sabado.fin}")
    private String sabadoFin;
    
    @Value("${app.horario.domingo.abierto}")
    private boolean abiertoDomingos;

    // Métodos de pago
    @Value("${app.pago.efectivo.habilitado}")
    private boolean pagoEfectivo;
    
    @Value("${app.pago.tarjeta.habilitado}")
    private boolean pagoTarjeta;
    
    @Value("${app.pago.transferencia.habilitado}")
    private boolean pagoTransferencia;
    
    @Value("${app.pago.yape-plin.habilitado}")
    private boolean pagoYapePlin;

    // Notificaciones
    @Value("${app.notificaciones.email-pedidos}")
    private boolean notifEmailPedidos;
    
    @Value("${app.notificaciones.sms-confirmaciones}")
    private boolean notifSms;
    
    @Value("${app.notificaciones.push}")
    private boolean notifPush;

    // Sistema
    @Value("${app.sistema.moneda}")
    private String moneda;
    
    @Value("${app.sistema.zona-horaria}")
    private String zonaHoraria;
    
    @Value("${app.sistema.idioma}")
    private String idioma;

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ConfiguracionDTO> obtenerConfiguracion() {
        ConfiguracionDTO config = new ConfiguracionDTO();
        
        // Negocio
        config.setNombreNegocio(nombreNegocio);
        config.setEmailContacto(emailContacto);
        config.setTelefono(telefono);
        config.setDireccion(direccion);
        
        // Horarios
        config.setLunesViernesInicio(lunesViernesInicio);
        config.setLunesViernesFin(lunesViernesFin);
        config.setSabadoInicio(sabadoInicio);
        config.setSabadoFin(sabadoFin);
        config.setAbiertoDomingos(abiertoDomingos);
        
        // Pagos
        config.setPagoEfectivo(pagoEfectivo);
        config.setPagoTarjeta(pagoTarjeta);
        config.setPagoTransferencia(pagoTransferencia);
        config.setPagoYapePlin(pagoYapePlin);
        
        // Notificaciones
        config.setNotifEmailPedidos(notifEmailPedidos);
        config.setNotifSms(notifSms);
        config.setNotifPush(notifPush);
        
        // Sistema
        config.setMoneda(moneda);
        config.setZonaHoraria(zonaHoraria);
        config.setIdioma(idioma);
        
        return ResponseEntity.ok(config);
    }
}
