package com.cuymarket.backend.dto.finanzas;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinanzasResumenDTO {
    
    private BigDecimal ingresosTotales;
    private BigDecimal ingresosMesActual;
    private BigDecimal promedioDiario;
    private Long pedidosPagados;
    
    private BigDecimal cambioMesAnterior; // Porcentaje
    private Integer pedidosHoy;
    
    // Ingresos mensuales (últimos 6 meses)
    private List<IngresoMensualDTO> ingresosMensuales;
    
    // Métodos de pago (distribución)
    private Map<String, MetodoPagoDTO> metodosPago;
    
    // Transacciones recientes
    private List<TransaccionDTO> transaccionesRecientes;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IngresoMensualDTO {
        private Integer mes;
        private Integer anio;
        private BigDecimal monto;
        private Long cantidadPedidos;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MetodoPagoDTO {
        private String metodo;
        private Long cantidad;
        private BigDecimal monto;
        private Double porcentaje;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TransaccionDTO {
        private Long pedidoId;
        private String numeroPedido;
        private String fecha;
        private String clienteNombre;
        private String metodoPago;
        private BigDecimal monto;
        private String estado;
    }
}
