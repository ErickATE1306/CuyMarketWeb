package com.cuymarket.backend.model.promocion;

import com.cuymarket.backend.model.enums.TipoCupon;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "cupones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Cupon {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(unique = true, nullable = false, length = 50)
    private String codigo;
    
    @NotNull
    @DecimalMin(value = "0.0", inclusive = false)
    @Digits(integer = 8, fraction = 2)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal descuento;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoCupon tipoCupon;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal minimoCompra;
    
    @Column(nullable = false)
    private LocalDate fechaInicio;
    
    @Column(nullable = false)
    private LocalDate fechaVencimiento;
    
    private Integer usosMaximos;
    
    @Column(nullable = false)
    private Integer usosActuales = 0;
    
    @Column(nullable = false)
    private Boolean activo = true;
}
