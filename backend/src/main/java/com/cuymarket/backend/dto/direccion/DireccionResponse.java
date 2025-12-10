package com.cuymarket.backend.dto.direccion;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DireccionResponse {

    private Long id;
    private String nombre;
    private String apellido;
    private String telefono;
    private String direccion;
    private String referencia;
    private String ciudad;
    private String distrito;
    private String codigoPostal;
    private Boolean esPrincipal;
}
