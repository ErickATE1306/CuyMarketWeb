package com.cuymarket.backend.dto.cupon;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CuponResponse {

    private Long id;
    private String codigo;
    private String tipoDescuento;
    private BigDecimal valorDescuento;
    private BigDecimal minimoCompra;
    private Integer usoMaximo;
    private Integer usoActual;
    private LocalDate fechaVencimiento;
    private Boolean activo;
    private Boolean vigente;
}
