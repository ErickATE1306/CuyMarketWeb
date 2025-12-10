package com.cuymarket.backend.dto.resena;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ResenaResponse {

    private Long id;
    private Long productoId;
    private String productoNombre;
    private Long usuarioId;
    private String usuarioNombre;
    private Integer calificacion;
    private String comentario;
    private Boolean verificado;
    private LocalDateTime fechaCreacion;
}
