package com.cuymarket.backend.dto.dashboard;

import lombok.Data;
import java.math.BigDecimal;
import java.util.List;

@Data
public class DashboardResumenDTO {
    private Long totalUsuarios;
    private Long productosStock;
    private Long pedidosActivos;
    private BigDecimal ingresosMes;

    // Metricas de cambio (opcional, por ahora placeholders)
    private String cambioUsuarios;
    private String cambioIngresos;

    // Graficos y listas
    private List<VentaMensualDTO> ventasMensuales;
    private List<ProductoTopDTO> productosTop;
    private List<PedidoRecienteDTO> pedidosRecientes;
}
