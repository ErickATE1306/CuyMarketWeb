package com.cuymarket.backend.service.sistema;

import com.cuymarket.backend.dto.dashboard.*;
import com.cuymarket.backend.model.pedido.Pedido;
import com.cuymarket.backend.model.enums.EstadoPedido;
import com.cuymarket.backend.model.enums.EstadoPago;
import com.cuymarket.backend.repository.usuario.UsuarioRepository;
import com.cuymarket.backend.repository.pedido.PedidoRepository;
import com.cuymarket.backend.repository.producto.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final UsuarioRepository usuarioRepository;
    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;

    @Transactional(readOnly = true)
    public DashboardResumenDTO obtenerResumen() {
        DashboardResumenDTO dto = new DashboardResumenDTO();

        // 1. Estadisticas Generales
        dto.setTotalUsuarios(usuarioRepository.count());

        Long stock = productoRepository.calcularStockTotal();
        dto.setProductosStock(stock != null ? stock : 0L);

        List<EstadoPedido> estadosActivos = Arrays.asList(EstadoPedido.PENDIENTE, EstadoPedido.EN_PROCESO);
        dto.setPedidosActivos(pedidoRepository.countByEstadoIn(estadosActivos));
        if (dto.getPedidosActivos() == null)
            dto.setPedidosActivos(0L);

        // Ingresos del mes actual
        LocalDate inicioMes = LocalDate.now().withDayOfMonth(1);
        List<Pedido> pedidosMes = pedidoRepository.findByEstadoPagoAndFechaPedidoAfter(
                EstadoPago.PAGADO, inicioMes.atStartOfDay());

        BigDecimal ingresos = pedidosMes.stream()
                .map(Pedido::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        dto.setIngresosMes(ingresos);

        dto.setCambioUsuarios("+12% este mes"); // Mock
        dto.setCambioIngresos("+18% vs mes anterior"); // Mock

        // 2. Grafico de Ventas Mensuales (Ultimos 6 meses)
        dto.setVentasMensuales(calcularVentasMensuales());

        // 3. Productos Top
        dto.setProductosTop(pedidoRepository.findTopSellingProducts(PageRequest.of(0, 5)));

        // 4. Pedidos Recientes
        List<Pedido> recientes = pedidoRepository.findTop5ByOrderByFechaPedidoDesc();
        dto.setPedidosRecientes(recientes.stream().map(this::mapToRecienteDTO).collect(Collectors.toList()));

        return dto;
    }

    private List<VentaMensualDTO> calcularVentasMensuales() {
        List<VentaMensualDTO> result = new ArrayList<>();
        LocalDate now = LocalDate.now();

        for (int i = 5; i >= 0; i--) {
            LocalDate d = now.minusMonths(i);
            LocalDate start = d.withDayOfMonth(1);
            LocalDate end = d.withDayOfMonth(d.lengthOfMonth());

            BigDecimal total = pedidoRepository
                    .findByEstadoPagoAndFechaPedidoAfter(EstadoPago.PAGADO, start.atStartOfDay())
                    .stream()
                    .filter(p -> p.getFechaPedido().isBefore(end.plusDays(1).atStartOfDay()))
                    .map(Pedido::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            result.add(new VentaMensualDTO(d.getMonthValue(), d.getYear(), total));
        }
        return result;
    }

    private PedidoRecienteDTO mapToRecienteDTO(Pedido p) {
        PedidoRecienteDTO dto = new PedidoRecienteDTO();
        dto.setId(p.getId());
        dto.setNumeroPedido(p.getNumeroPedido());

        String nombreCliente = "Cliente Desconocido";
        if (p.getUsuario() != null) {
            if (p.getUsuario().getNombre() != null) {
                nombreCliente = p.getUsuario().getNombre() + " " + p.getUsuario().getApellido();
            } else {
                nombreCliente = p.getUsuario().getEmail();
            }
        }
        dto.setClienteNombre(nombreCliente);

        dto.setTotal(p.getTotal());
        dto.setEstado(p.getEstado());

        dto.setCantidadItems(p.getItems().size());
        if (!p.getItems().isEmpty()) {
            dto.setProductoPrincipal(p.getItems().get(0).getNombreProducto());
            if (p.getItems().size() > 1) {
                // dto.setProductoPrincipal(dto.getProductoPrincipal() + " y " +
                // (p.getItems().size() - 1) + " más");
            }
        } else {
            dto.setProductoPrincipal("Sin items");
        }
        return dto;
    }
}
