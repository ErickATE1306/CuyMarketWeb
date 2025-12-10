package com.cuymarket.backend.dto.dashboard;

import com.cuymarket.backend.model.enums.EstadoPedido;
import lombok.Data;
import java.math.BigDecimal;

@Data
public class PedidoRecienteDTO {
    private Long id;
    private String numeroPedido;
    private String clienteNombre;
    private String productoPrincipal;
    private Integer cantidadItems;
    private BigDecimal total;
    private EstadoPedido estado;
}
