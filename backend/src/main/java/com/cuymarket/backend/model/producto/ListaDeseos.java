package com.cuymarket.backend.model.producto;

import com.cuymarket.backend.model.usuario.Usuario;

import com.cuymarket.backend.model.usuario.Usuario;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "lista_deseos", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"usuario_id", "producto_id"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ListaDeseos {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaAgregado;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
    
    @PrePersist
    protected void onCreate() {
        fechaAgregado = LocalDateTime.now();
    }
}
