package com.cuymarket.backend.model.pedido;

import com.cuymarket.backend.model.enums.MetodoPago;

import com.cuymarket.backend.model.enums.MetodoPago;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "informacion_pago")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class InformacionPago {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MetodoPago metodoPago;
    
    @Column(length = 4)
    private String ultimosDigitosTarjeta;
    
    @Column(length = 150)
    private String titularTarjeta;
    
    @Column(length = 9)
    private String telefono;
    
    @Column(length = 100)
    private String banco;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] comprobante;
    
    private LocalDateTime fechaPago;
    
    @Column(length = 100)
    private String estadoTransaccion;
    
    @OneToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;
}
