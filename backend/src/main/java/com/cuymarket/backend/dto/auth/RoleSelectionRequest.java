package com.cuymarket.backend.dto.auth;

import com.cuymarket.backend.model.enums.NombreRol;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RoleSelectionRequest {
    
    @NotBlank(message = "El email es obligatorio")
    private String email;
    
    @NotNull(message = "El rol seleccionado es obligatorio")
    private NombreRol rolSeleccionado;
}
