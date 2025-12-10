package com.cuymarket.backend.dto.resena;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class ResenaRequest {

    @NotNull(message = "La calificación es obligatoria")
    @Min(value = 1, message = "La calificación mínima es 1")
    @Max(value = 5, message = "La calificación máxima es 5")
    private Integer calificacion;

    @NotBlank(message = "El comentario es obligatorio")
    @Size(max = 1000, message = "El comentario no puede exceder 1000 caracteres")
    private String comentario;
}
