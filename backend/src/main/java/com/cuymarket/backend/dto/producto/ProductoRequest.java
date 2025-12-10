package com.cuymarket.backend.dto.producto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ProductoRequest {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombre;

    @NotBlank(message = "La raza es obligatoria")
    @Size(max = 50, message = "La raza no puede exceder 50 caracteres")
    private String raza;

    @NotNull(message = "El peso es obligatorio")
    @DecimalMin(value = "0.1", message = "El peso debe ser mayor a 0")
    private Double peso;

    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.01", message = "El precio debe ser mayor a 0")
    private BigDecimal precio;

    @NotBlank(message = "El tipo es obligatorio")
    @Size(max = 50, message = "El tipo no puede exceder 50 caracteres")
    private String tipo;

    private String certificado;

    @Size(max = 1000, message = "La descripción no puede exceder 1000 caracteres")
    private String descripcion;

    @Size(max = 500, message = "Las características no pueden exceder 500 caracteres")
    private String caracteristicas;

    private String imagen; // Base64 string

    @Min(value = 0, message = "El stock no puede ser negativo")
    private Integer stockDisponible = 0;

    @Min(value = 0, message = "El stock m\u00ednimo no puede ser negativo")
    private Integer stockMinimo = 5;

    @NotNull(message = "La categor\u00eda es obligatoria")
    private Long categoriaId;

    private Boolean activo = true;
}
