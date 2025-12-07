package com.cuymarket.backend.model.carrito;

import com.cuymarket.backend.model.producto.Producto;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "items_carrito")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ItemCarrito {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Min(1)
    @Column(nullable = false)
    private Integer cantidad;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaAgregado;
    
    @ManyToOne
    @JoinColumn(name = "carrito_id", nullable = false)
    private Carrito carrito;
    
    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
    
    @PrePersist
    protected void onCreate() {
        fechaAgregado = LocalDateTime.now();
    }
}
