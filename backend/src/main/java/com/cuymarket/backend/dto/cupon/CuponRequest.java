package com.cuymarket.backend.dto.cupon;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class CuponRequest {

    @NotBlank(message = "El código es obligatorio")
    @Size(max = 50, message = "El código no puede exceder 50 caracteres")
    private String codigo;

    @NotNull(message = "El tipo de descuento es obligatorio")
    private String tipoDescuento; // PORCENTAJE o MONTO_FIJO

    @NotNull(message = "El valor del descuento es obligatorio")
    @DecimalMin(value = "0.01", message = "El descuento debe ser mayor a 0")
    private BigDecimal valorDescuento;

    @DecimalMin(value = "0.0", message = "El mínimo de compra debe ser mayor o igual a 0")
    private BigDecimal minimoCompra;

    @Min(value = 1, message = "El uso máximo debe ser al menos 1")
    private Integer usoMaximo;

    @NotNull(message = "La fecha de vencimiento es obligatoria")
    private LocalDate fechaVencimiento;

    private Boolean activo = true;
}
