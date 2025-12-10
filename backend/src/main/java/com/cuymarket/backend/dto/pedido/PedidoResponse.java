package com.cuymarket.backend.dto.pedido;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PedidoResponse {

    private Long id;
    private String numeroPedido;
    private LocalDateTime fechaPedido;
    private String estado;
    private String estadoPago;

    // Items del pedido
    private List<ItemPedidoResponse> items;

    // Montos
    private BigDecimal subtotal;
    private BigDecimal descuento;
    private BigDecimal costoEnvio;
    private BigDecimal total;

    // Información adicional
    private String metodoPago;
    private String notas;
    private String direccionEnvio;

    // Información del usuario (para admin)
    private String usuarioNombre;
    private String usuarioEmail;
    
    // Información de pago
    private Long informacionPagoId;
    private boolean tieneComprobante;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ItemPedidoResponse {
        private Long id;
        private Long productoId;
        private String productoNombre;
        private String productoRaza;
        private Integer cantidad;
        private BigDecimal precioUnitario;
        private BigDecimal subtotal;
    }
}
