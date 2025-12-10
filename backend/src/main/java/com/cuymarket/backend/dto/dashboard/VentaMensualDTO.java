package com.cuymarket.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VentaMensualDTO {
    private Integer mes;
    private Integer anio;
    private BigDecimal totalVentas;
}
