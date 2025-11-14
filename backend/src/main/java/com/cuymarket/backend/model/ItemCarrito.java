package com.cuymarket.backend.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.*;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "items_carrito")
public class ItemCarrito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Usuario usuario;

    @ManyToOne(optional = false)
    private Producto producto;

    @Min(1)
    @Builder.Default
    private Integer cantidad = 1;

    @Builder.Default
    private BigDecimal precioUnitario = BigDecimal.ZERO;

    // Si pertenece a un pedido, este campo no es null; si es carrito activo, es null
    @ManyToOne
    private Pedido pedido;

    @Builder.Default
    private Instant creadoEn = Instant.now();

    @PrePersist
    public void prePersist() {
        if (precioUnitario == null || precioUnitario.compareTo(BigDecimal.ZERO) <= 0) {
            if (producto != null && producto.getPrecio() != null) {
                precioUnitario = producto.getPrecio();
            }
        }
    }
}
