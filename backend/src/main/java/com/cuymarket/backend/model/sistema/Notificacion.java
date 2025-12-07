package com.cuymarket.backend.model.sistema;

import com.cuymarket.backend.model.enums.TipoNotificacion;
import com.cuymarket.backend.model.usuario.Usuario;

import com.cuymarket.backend.model.enums.TipoNotificacion;
import com.cuymarket.backend.model.usuario.Usuario;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Notificacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoNotificacion tipo;
    
    @NotBlank
    @Column(nullable = false, length = 200)
    private String titulo;
    
    @Column(columnDefinition = "TEXT")
    private String mensaje;
    
    @Column(nullable = false)
    private Boolean leida = false;
    
    @Column(length = 500)
    private String urlAccion;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}
