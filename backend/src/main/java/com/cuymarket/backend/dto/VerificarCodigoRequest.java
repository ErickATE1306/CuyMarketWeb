package com.cuymarket.backend.dto;

import lombok.Data;

@Data
public class VerificarCodigoRequest {
    private String email;
    private String codigo;
}
