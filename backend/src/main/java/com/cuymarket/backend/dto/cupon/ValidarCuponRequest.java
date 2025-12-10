package com.cuymarket.backend.dto.cupon;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ValidarCuponRequest {

    @NotBlank(message = "El código del cupón es obligatorio")
    private String codigo;
}
