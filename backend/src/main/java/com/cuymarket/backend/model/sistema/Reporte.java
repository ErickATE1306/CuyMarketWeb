package com.cuymarket.backend.model.sistema;

import com.cuymarket.backend.model.enums.TipoReporte;
import com.cuymarket.backend.model.usuario.Usuario;

import com.cuymarket.backend.model.enums.TipoReporte;
import com.cuymarket.backend.model.usuario.Usuario;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "reportes")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Reporte {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoReporte tipo;
    
    @Column(nullable = false)
    private LocalDate fechaInicio;
    
    @Column(nullable = false)
    private LocalDate fechaFin;
    
    @Column(columnDefinition = "TEXT")
    private String parametros;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] archivo;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaGeneracion;
    
    @ManyToOne
    @JoinColumn(name = "generado_por", nullable = false)
    private Usuario generadoPor;
    
    @PrePersist
    protected void onCreate() {
        fechaGeneracion = LocalDateTime.now();
    }
}
