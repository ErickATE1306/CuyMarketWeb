package com.cuymarket.backend.dto.auth;

import com.cuymarket.backend.model.enums.NombreRol;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RoleSelectionResponse {
    
    private String mensaje;
    private String email;
    private List<NombreRol> rolesDisponibles;
    private boolean requiereSeleccion;
}
