package com.cuymarket.backend.model.sistema;

import com.cuymarket.backend.model.enums.TipoReporte;
import com.cuymarket.backend.model.usuario.Usuario;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    @Column(nullable = false)
    private String nombre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TipoReporte tipo;

    @Column(nullable = false)
    private String formato; // PDF o EXCEL

    @Column(name = "fecha_generacion", nullable = false)
    private LocalDateTime fechaGeneracion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generado_por", nullable = true)
    private Usuario generadoPor;

    @PrePersist
    protected void onCreate() {
        fechaGeneracion = LocalDateTime.now();
    }
}
