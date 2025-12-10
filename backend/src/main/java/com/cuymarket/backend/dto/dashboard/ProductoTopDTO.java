package com.cuymarket.backend.dto.dashboard;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProductoTopDTO {
    private String nombre;
    private Long cantidadVendida;
}
