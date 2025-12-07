package com.cuymarket.backend.model.sistema;

import com.cuymarket.backend.model.enums.TipoConfiguracion;

import com.cuymarket.backend.model.enums.TipoConfiguracion;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "configuraciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Configuracion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(unique = true, nullable = false, length = 100)
    private String clave;
    
    @Column(columnDefinition = "TEXT")
    private String valor;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoConfiguracion tipo;
    
    private LocalDateTime fechaActualizacion;
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
