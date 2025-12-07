package com.cuymarket.backend.model.inventario;

import com.cuymarket.backend.model.enums.TipoMovimiento;
import com.cuymarket.backend.model.producto.Producto;

import com.cuymarket.backend.model.enums.TipoMovimiento;
import com.cuymarket.backend.model.producto.Producto;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "movimientos_inventario")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class MovimientoInventario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoMovimiento tipo;
    
    @Column(nullable = false)
    private Integer cantidad;
    
    @Column(nullable = false)
    private Integer stockAnterior;
    
    @Column(nullable = false)
    private Integer stockNuevo;
    
    @Column(length = 255)
    private String motivo;
    
    @Column(nullable = false, length = 100)
    private String usuario;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;
    
    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
    
    @PrePersist
    protected void onCreate() {
        fecha = LocalDateTime.now();
    }
}
