package com.cuymarket.backend.dto.carrito;

import com.cuymarket.backend.dto.producto.ProductoResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CarritoResponse {

    private Long id;
    private Long usuarioId;
    private List<ItemCarritoResponse> items;
    private BigDecimal total;
    private Integer totalItems;
    private LocalDateTime fechaActualizacion;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemCarritoResponse {
        private Long id;
        private ProductoResponse producto;
        private Integer cantidad;
        private BigDecimal subtotal;
    }
}
