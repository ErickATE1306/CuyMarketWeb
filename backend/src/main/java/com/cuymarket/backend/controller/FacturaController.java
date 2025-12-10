package com.cuymarket.backend.controller;

import com.cuymarket.backend.model.pedido.Factura;
import com.cuymarket.backend.service.pedido.FacturaService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/facturas")
@RequiredArgsConstructor
public class FacturaController {

    private final FacturaService facturaService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE')")
    public ResponseEntity<Factura> crear(@RequestBody CrearFacturaRequest request) {
        Factura factura = facturaService.crear(
                request.getPedidoId(),
                request.getRucCliente(),
                request.getRazonSocialCliente());
        return ResponseEntity.ok(factura);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE')")
    public ResponseEntity<Factura> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(facturaService.obtenerPorId(id));
    }

    @GetMapping("/pedido/{pedidoId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE')")
    public ResponseEntity<Factura> obtenerPorPedido(@PathVariable Long pedidoId) {
        return ResponseEntity.ok(facturaService.obtenerPorPedido(pedidoId));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<Factura>> listarTodas() {
        return ResponseEntity.ok(facturaService.listarTodas());
    }

    @Data
    public static class CrearFacturaRequest {
        private Long pedidoId;
        private String rucCliente;
        private String razonSocialCliente;
    }
}
