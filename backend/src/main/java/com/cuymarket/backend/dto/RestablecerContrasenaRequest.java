package com.cuymarket.backend.dto;

import lombok.Data;

@Data
public class RestablecerContrasenaRequest {
    private String email;
    private String codigo;
    private String nuevaContrasena;
}
