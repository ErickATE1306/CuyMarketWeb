package com.cuymarket.backend.dto.usuario;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class ActualizarPerfilRequest {

    @Size(max = 100, message = "El nombre no puede exceder 100 caracteres")
    private String nombre;

    @Size(max = 100, message = "El apellido no puede exceder 100 caracteres")
    private String apellido;

    @Email(message = "El email debe ser válido")
    private String email;

    @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
    private String telefono;
}
