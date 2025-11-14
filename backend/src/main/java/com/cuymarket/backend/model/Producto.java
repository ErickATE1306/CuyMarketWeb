package com.cuymarket.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    private String nombre;

    @Column(length = 2000)
    private String descripcion;

    private String imagenUrl;

    @NotNull
    private BigDecimal precio;

    @NotNull
    private Integer stock;

    @Builder.Default
    private Boolean activo = true;

    @Builder.Default
    private Instant creadoEn = Instant.now();

    @Builder.Default
    private Instant actualizadoEn = Instant.now();

    @PreUpdate
    public void preUpdate() { actualizadoEn = Instant.now(); }
}
