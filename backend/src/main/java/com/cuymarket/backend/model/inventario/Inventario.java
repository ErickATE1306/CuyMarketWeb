package com.cuymarket.backend.model.inventario;

import com.cuymarket.backend.model.producto.Producto;

import com.cuymarket.backend.model.producto.Producto;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Inventario {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Min(0)
    @Column(nullable = false)
    private Integer stockActual = 0;
    
    @Min(0)
    @Column(nullable = false)
    private Integer stockMinimo = 0;
    
    @Min(0)
    @Column(nullable = false)
    private Integer stockMaximo = 0;
    
    @Column(length = 100)
    private String ubicacion;
    
    private LocalDateTime ultimaActualizacion;
    
    @OneToOne
    @JoinColumn(name = "producto_id", unique = true, nullable = false)
    private Producto producto;
    
    @PreUpdate
    protected void onUpdate() {
        ultimaActualizacion = LocalDateTime.now();
    }
}
