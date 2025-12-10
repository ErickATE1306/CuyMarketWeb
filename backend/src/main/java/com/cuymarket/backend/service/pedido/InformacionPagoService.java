package com.cuymarket.backend.service.pedido;

import com.cuymarket.backend.model.pedido.InformacionPago;
import com.cuymarket.backend.model.pedido.Pedido;
import com.cuymarket.backend.repository.pedido.InformacionPagoRepository;
import com.cuymarket.backend.repository.pedido.PedidoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InformacionPagoService {

    private final InformacionPagoRepository pagoRepository;
    private final PedidoRepository pedidoRepository;

    // Registrar información de pago
    public InformacionPago registrar(InformacionPago informacionPago, Long pedidoId) {
        Pedido pedido = pedidoRepository.findById(pedidoId)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));

        informacionPago.setPedido(pedido);
        informacionPago.setFechaPago(LocalDateTime.now());

        return pagoRepository.save(informacionPago);
    }

    // Actualizar información de pago
    public InformacionPago actualizar(Long id, InformacionPago pagoActualizado) {
        InformacionPago pago = obtenerPorId(id);

        pago.setMetodoPago(pagoActualizado.getMetodoPago());
        pago.setUltimosDigitosTarjeta(pagoActualizado.getUltimosDigitosTarjeta());
        pago.setTitularTarjeta(pagoActualizado.getTitularTarjeta());
        pago.setTelefono(pagoActualizado.getTelefono());
        pago.setBanco(pagoActualizado.getBanco());
        pago.setEstadoTransaccion(pagoActualizado.getEstadoTransaccion());

        return pagoRepository.save(pago);
    }

    // Actualizar estado de transacción
    public InformacionPago actualizarEstado(Long id, String nuevoEstado) {
        InformacionPago pago = obtenerPorId(id);
        pago.setEstadoTransaccion(nuevoEstado);
        return pagoRepository.save(pago);
    }

    // Adjuntar comprobante
    public InformacionPago adjuntarComprobante(Long id, byte[] comprobante) {
        InformacionPago pago = obtenerPorId(id);
        pago.setComprobante(comprobante);
        return pagoRepository.save(pago);
    }

    // Consultas
    @Transactional(readOnly = true)
    public InformacionPago obtenerPorId(Long id) {
        return pagoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Información de pago no encontrada con ID: " + id));
    }

    @Transactional(readOnly = true)
    public InformacionPago obtenerPorPedido(Long pedidoId) {
        return pagoRepository.findByPedidoId(pedidoId)
                .orElseThrow(() -> new RuntimeException("Información de pago no encontrada para el pedido"));
    }

    @Transactional(readOnly = true)
    public List<InformacionPago> listarTodos() {
        return pagoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<InformacionPago> listarPorMetodo(String metodoPago) {
        return pagoRepository.findAll().stream()
                .filter(p -> p.getMetodoPago().name().equals(metodoPago))
                .toList();
    }

    // Eliminar
    public void eliminar(Long id) {
        InformacionPago pago = obtenerPorId(id);
        pagoRepository.delete(pago);
    }
}
