package com.cuymarket.backend.model.producto;

import com.cuymarket.backend.model.usuario.Usuario;

import com.cuymarket.backend.model.usuario.Usuario;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "resenas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Resena {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String nombreUsuario;
    
    @Min(1)
    @Max(5)
    @Column(nullable = false)
    private Integer calificacion;
    
    @Column(length = 200)
    private String titulo;
    
    @Column(columnDefinition = "TEXT")
    private String comentario;
    
    @Column(nullable = false)
    private Boolean verificado = false;
    
    @Column(nullable = false)
    private Integer util = 0;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] imagen1;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] imagen2;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] imagen3;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
}
