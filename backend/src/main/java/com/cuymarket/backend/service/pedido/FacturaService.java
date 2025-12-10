package com.cuymarket.backend.service.pedido;

import com.cuymarket.backend.model.pedido.Factura;
import com.cuymarket.backend.model.pedido.Pedido;
import com.cuymarket.backend.repository.pedido.FacturaRepository;
import com.cuymarket.backend.repository.pedido.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class FacturaService {

    private final FacturaRepository facturaRepository;
    private final PedidoRepository pedidoRepository;

    // Crear factura para pedido
    public Factura crear(Long pedidoId, String rucCliente, String razonSocialCliente) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        // Verificar si ya existe factura
        if (facturaRepository.findByPedidoId(pedidoId).isPresent()) {
            throw new RuntimeException("El pedido ya tiene factura");
        }

        Factura factura = new Factura();
        factura.setPedido(pedido);
        factura.setNumeroFactura(generarNumeroFactura());
        factura.setRucCliente(rucCliente);
        factura.setRazonSocialCliente(razonSocialCliente);
        factura.setFechaEmision(LocalDate.now());

        // Calcular montos
        BigDecimal subtotal = pedido.getSubtotal();
        BigDecimal igv = subtotal.multiply(BigDecimal.valueOf(0.18));
        BigDecimal total = subtotal.add(igv);

        factura.setSubtotal(subtotal);
        factura.setIgv(igv);
        factura.setTotal(total);

        return facturaRepository.save(factura);
    }

    // Generar PDF de factura
    public Factura generarPdf(Long id) {
        Factura factura = obtenerPorId(id);

        // Aquí iría la lógica para generar el PDF
        // Por ahora solo retornamos la factura
        byte[] pdf = new byte[0]; // Placeholder
        factura.setArchivoPdf(pdf);

        return facturaRepository.save(factura);
    }

    // Consultas
    @Transactional(readOnly = true)
    public Factura obtenerPorId(Long id) {
        return facturaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada con ID: " + id));
    }

    @Transactional(readOnly = true)
    public Factura obtenerPorPedido(Long pedidoId) {
        return facturaRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada para el pedido"));
    }

    @Transactional(readOnly = true)
    public Factura obtenerPorNumero(String numeroFactura) {
        return facturaRepository.findByNumeroFactura(numeroFactura)
                .orElseThrow(() -> new RuntimeException("Factura no encontrada con número: " + numeroFactura));
    }

    @Transactional(readOnly = true)
    public List<Factura> listarTodas() {
        return facturaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Factura> listarPorCliente(String rucCliente) {
        return facturaRepository.findByRucCliente(rucCliente);
    }

    @Transactional(readOnly = true)
    public List<Factura> listarPorFechas(LocalDate desde, LocalDate hasta) {
        return facturaRepository.findByFechaEmisionBetween(desde, hasta);
    }

    @Transactional(readOnly = true)
    public boolean existeParaPedido(Long pedidoId) {
        return facturaRepository.findByPedidoId(pedidoId).isPresent();
    }

    // Eliminar
    public void eliminar(Long id) {
        Factura factura = obtenerPorId(id);
        facturaRepository.delete(factura);
    }

    // Método privado para generar número de factura
    private String generarNumeroFactura() {
        return "F001-" + String.format("%08d", System.currentTimeMillis() % 100000000);
    }
}
