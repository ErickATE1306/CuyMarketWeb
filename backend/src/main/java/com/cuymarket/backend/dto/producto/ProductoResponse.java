package com.cuymarket.backend.dto.producto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoResponse {

    private Long id;
    private String nombre;
    private String raza;
    private String peso; // Cambiado de Double a String para coincidir con el modelo
    private BigDecimal precio;
    private String tipo;
    private String certificado;
    private String descripcion;
    private String caracteristicas;
    private String imagen; // Base64 string
    private Boolean activo;
    private LocalDateTime fechaCreacion;

    // Datos de categoría
    private Long categoriaId;
    private String categoriaNombre;

    // Stock disponible
    private Integer stockDisponible;
    private Integer stockMinimo;

    // Calificaci\u00f3n promedio
    private Double calificacionPromedio;
    private Long totalResenas;
}
