package com.cuymarket.backend.dto.auth;

import com.cuymarket.backend.model.enums.NombreRol;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String token;
    private String tipo = "Bearer";
    private Long id;
    private String email;
    private String nombre;
    private String apellido;
    private NombreRol rolActivo;
    private Set<NombreRol> todosLosRoles;
    
    public AuthResponse(String token, Long id, String email, String nombre, String apellido, 
                       NombreRol rolActivo, Set<NombreRol> todosLosRoles) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.nombre = nombre;
        this.apellido = apellido;
        this.rolActivo = rolActivo;
        this.todosLosRoles = todosLosRoles;
    }
}
