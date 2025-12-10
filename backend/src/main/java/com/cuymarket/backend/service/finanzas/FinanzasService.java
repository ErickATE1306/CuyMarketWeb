package com.cuymarket.backend.service.finanzas;

import com.cuymarket.backend.dto.finanzas.FinanzasResumenDTO;
import com.cuymarket.backend.model.enums.EstadoPago;
import com.cuymarket.backend.model.pedido.Pedido;
import com.cuymarket.backend.repository.pedido.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FinanzasService {

    private final PedidoRepository pedidoRepository;

    public FinanzasResumenDTO obtenerResumenFinanzas() {
        FinanzasResumenDTO resumen = new FinanzasResumenDTO();
        
        LocalDateTime ahora = LocalDateTime.now();
        LocalDate hoy = LocalDate.now();
        
        // Obtener todos los pedidos pagados
        List<Pedido> todosPedidosPagados = pedidoRepository.findByEstadoPago(EstadoPago.PAGADO);
        
        // 1. Ingresos Totales
        BigDecimal ingresosTotales = todosPedidosPagados.stream()
                .map(Pedido::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        resumen.setIngresosTotales(ingresosTotales);
        
        // 2. Ingresos Mes Actual
        LocalDate inicioMes = hoy.withDayOfMonth(1);
        LocalDateTime inicioMesDateTime = inicioMes.atStartOfDay();
        
        List<Pedido> pedidosMesActual = todosPedidosPagados.stream()
                .filter(p -> p.getFechaPedido().isAfter(inicioMesDateTime))
                .collect(Collectors.toList());
        
        BigDecimal ingresosMesActual = pedidosMesActual.stream()
                .map(Pedido::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        resumen.setIngresosMesActual(ingresosMesActual);
        
        // 3. Ingresos Mes Anterior (para comparación)
        LocalDate inicioMesAnterior = hoy.minusMonths(1).withDayOfMonth(1);
        LocalDate finMesAnterior = inicioMes.minusDays(1);
        
        BigDecimal ingresosMesAnterior = todosPedidosPagados.stream()
                .filter(p -> {
                    LocalDate fechaPedido = p.getFechaPedido().toLocalDate();
                    return !fechaPedido.isBefore(inicioMesAnterior) && !fechaPedido.isAfter(finMesAnterior);
                })
                .map(Pedido::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        // Calcular cambio porcentual
        BigDecimal cambio = BigDecimal.ZERO;
        if (ingresosMesAnterior.compareTo(BigDecimal.ZERO) > 0) {
            cambio = ingresosMesActual.subtract(ingresosMesAnterior)
                    .divide(ingresosMesAnterior, 4, RoundingMode.HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        resumen.setCambioMesAnterior(cambio);
        
        // 4. Promedio Diario (últimos 30 días)
        LocalDate hace30Dias = hoy.minusDays(30);
        BigDecimal ingresos30Dias = todosPedidosPagados.stream()
                .filter(p -> !p.getFechaPedido().toLocalDate().isBefore(hace30Dias))
                .map(Pedido::getTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        
        BigDecimal promedioDiario = ingresos30Dias.divide(BigDecimal.valueOf(30), 2, RoundingMode.HALF_UP);
        resumen.setPromedioDiario(promedioDiario);
        
        // 5. Pedidos pagados
        resumen.setPedidosPagados((long) todosPedidosPagados.size());
        
        // 6. Pedidos hoy
        int pedidosHoy = (int) todosPedidosPagados.stream()
                .filter(p -> p.getFechaPedido().toLocalDate().equals(hoy))
                .count();
        resumen.setPedidosHoy(pedidosHoy);
        
        // 7. Ingresos Mensuales (últimos 6 meses)
        resumen.setIngresosMensuales(calcularIngresosMensuales(todosPedidosPagados));
        
        // 8. Métodos de Pago
        resumen.setMetodosPago(calcularMetodosPago(todosPedidosPagados));
        
        // 9. Transacciones Recientes (últimas 10)
        resumen.setTransaccionesRecientes(obtenerTransaccionesRecientes(todosPedidosPagados));
        
        return resumen;
    }
    
    private List<FinanzasResumenDTO.IngresoMensualDTO> calcularIngresosMensuales(List<Pedido> pedidos) {
        List<FinanzasResumenDTO.IngresoMensualDTO> ingresos = new ArrayList<>();
        LocalDate ahora = LocalDate.now();
        
        for (int i = 5; i >= 0; i--) {
            LocalDate mes = ahora.minusMonths(i);
            int mesNum = mes.getMonthValue();
            int anio = mes.getYear();
            
            LocalDate inicioMes = mes.withDayOfMonth(1);
            LocalDate finMes = mes.withDayOfMonth(mes.lengthOfMonth());
            
            List<Pedido> pedidosMes = pedidos.stream()
                    .filter(p -> {
                        LocalDate fecha = p.getFechaPedido().toLocalDate();
                        return !fecha.isBefore(inicioMes) && !fecha.isAfter(finMes);
                    })
                    .collect(Collectors.toList());
            
            BigDecimal montoMes = pedidosMes.stream()
                    .map(Pedido::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            ingresos.add(new FinanzasResumenDTO.IngresoMensualDTO(
                    mesNum, anio, montoMes, (long) pedidosMes.size()
            ));
        }
        
        return ingresos;
    }
    
    private Map<String, FinanzasResumenDTO.MetodoPagoDTO> calcularMetodosPago(List<Pedido> pedidos) {
        Map<String, FinanzasResumenDTO.MetodoPagoDTO> metodos = new HashMap<>();
        
        long totalPedidos = pedidos.size();
        
        // Agrupar por método de pago
        Map<String, List<Pedido>> pedidosPorMetodo = pedidos.stream()
                .filter(p -> p.getMetodoPago() != null)
                .collect(Collectors.groupingBy(p -> p.getMetodoPago().name()));
        
        pedidosPorMetodo.forEach((metodo, pedidosMetodo) -> {
            long cantidad = pedidosMetodo.size();
            BigDecimal monto = pedidosMetodo.stream()
                    .map(Pedido::getTotal)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            double porcentaje = totalPedidos > 0 ? (cantidad * 100.0) / totalPedidos : 0;
            
            metodos.put(metodo, new FinanzasResumenDTO.MetodoPagoDTO(
                    metodo, cantidad, monto, porcentaje
            ));
        });
        
        return metodos;
    }
    
    private List<FinanzasResumenDTO.TransaccionDTO> obtenerTransaccionesRecientes(List<Pedido> pedidos) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
        
        return pedidos.stream()
                .sorted(Comparator.comparing(Pedido::getFechaPedido).reversed())
                .limit(10)
                .map(p -> new FinanzasResumenDTO.TransaccionDTO(
                        p.getId(),
                        p.getNumeroPedido(),
                        p.getFechaPedido().format(formatter),
                        obtenerNombreCliente(p),
                        p.getMetodoPago() != null ? p.getMetodoPago().name() : "N/A",
                        p.getTotal(),
                        p.getEstadoPago().name()
                ))
                .collect(Collectors.toList());
    }
    
    private String obtenerNombreCliente(Pedido pedido) {
        if (pedido.getUsuario() == null) {
            return "Cliente Desconocido";
        }
        
        String nombre = pedido.getUsuario().getNombre();
        String apellido = pedido.getUsuario().getApellido();
        
        if (nombre != null && apellido != null) {
            return nombre + " " + apellido;
        } else if (nombre != null) {
            return nombre;
        } else {
            return pedido.getUsuario().getEmail();
        }
    }
}
