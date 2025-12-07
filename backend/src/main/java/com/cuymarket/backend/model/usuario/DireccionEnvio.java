package com.cuymarket.backend.model.usuario;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "direcciones_envio")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DireccionEnvio {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @NotBlank(message = "El apellido es obligatorio")
    @Column(nullable = false, length = 100)
    private String apellido;
    
    @NotBlank(message = "El teléfono es obligatorio")
    @Pattern(regexp = "\\d{9}", message = "El teléfono debe tener 9 dígitos")
    @Column(nullable = false, length = 9)
    private String telefono;
    
    @NotBlank(message = "La dirección es obligatoria")
    @Column(nullable = false, length = 255)
    private String direccion;
    
    @Column(columnDefinition = "TEXT")
    private String referencia;
    
    @Column(nullable = false, length = 100)
    private String ciudad = "Lima";
    
    @NotBlank(message = "El distrito es obligatorio")
    @Column(nullable = false, length = 100)
    private String distrito;
    
    @Column(length = 10)
    private String codigoPostal;
    
    @Column(nullable = false)
    private Boolean esPrincipal = false;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
