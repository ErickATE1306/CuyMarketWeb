package com.cuymarket.backend.dto.usuario;

import lombok.Data;
import jakarta.validation.constraints.*;

@Data
public class ActualizarUsuarioAdminRequest {
    private String nombre;
    private String apellido;
    private String dni;
    private String telefono;
    private String email;
    private String rol;
    private Boolean activo;
}
