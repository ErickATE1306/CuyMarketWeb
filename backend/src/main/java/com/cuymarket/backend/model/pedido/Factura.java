package com.cuymarket.backend.model.pedido;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "facturas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Factura {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String numeroFactura;
    
    @NotBlank
    @Column(nullable = false, length = 11)
    private String rucEmpresa;
    
    @NotBlank
    @Column(nullable = false, length = 255)
    private String razonSocialEmpresa;
    
    @NotBlank
    @Column(nullable = false, length = 255)
    private String direccionEmpresa;
    
    @Column(length = 11)
    private String rucCliente;
    
    @Column(length = 255)
    private String razonSocialCliente;
    
    @Column(nullable = false)
    private LocalDate fechaEmision;
    
    @NotNull
    @Digits(integer = 8, fraction = 2)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @NotNull
    @Digits(integer = 8, fraction = 2)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal igv;
    
    @NotNull
    @Digits(integer = 8, fraction = 2)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] archivoPdf;
    
    @OneToOne
    @JoinColumn(name = "pedido_id", unique = true, nullable = false)
    private Pedido pedido;
}
