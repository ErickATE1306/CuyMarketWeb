package com.cuymarket.backend.dto.sistema;

import com.cuymarket.backend.model.enums.TipoReporte;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ReporteResponse {
    private Long id;
    private String nombre;
    private TipoReporte tipo;
    private String formato;
    private LocalDateTime fechaGeneracion;
    private UsuarioSimpleDTO generadoPor;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsuarioSimpleDTO {
        private Long id;
        private String nombre;
        private String email;
    }
}
