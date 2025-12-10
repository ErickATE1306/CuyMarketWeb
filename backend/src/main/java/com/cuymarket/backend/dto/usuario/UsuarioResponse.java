package com.cuymarket.backend.dto.usuario;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UsuarioResponse {

    private Long id;
    private String nombre;
    private String apellido;
    private String dni;
    private String email;
    private String telefono;
    private Boolean activo;
    private Boolean emailVerificado;
    private LocalDateTime fechaRegistro;
    private LocalDateTime ultimoAcceso;
    private java.util.List<String> roles;
}
