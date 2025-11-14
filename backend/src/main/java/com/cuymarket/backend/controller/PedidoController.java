package com.cuymarket.backend.controller;

import com.cuymarket.backend.model.*;
import com.cuymarket.backend.repository.ItemCarritoRepository;
import com.cuymarket.backend.repository.PedidoRepository;
import jakarta.transaction.Transactional;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {
    private final PedidoRepository pedidoRepository;
    private final ItemCarritoRepository itemCarritoRepository;

    public PedidoController(PedidoRepository pedidoRepository, ItemCarritoRepository itemCarritoRepository) {
        this.pedidoRepository = pedidoRepository;
        this.itemCarritoRepository = itemCarritoRepository;
    }

    @GetMapping
    public List<Pedido> misPedidos(@AuthenticationPrincipal Usuario user) {
        return pedidoRepository.findByUsuario(user);
    }

    @PostMapping("/crear-desde-carrito")
    @Transactional
    public ResponseEntity<Pedido> crearDesdeCarrito(@AuthenticationPrincipal Usuario user) {
        var items = itemCarritoRepository.findByUsuarioAndPedidoIsNull(user);
        if (items.isEmpty()) return ResponseEntity.badRequest().build();
        Pedido pedido = Pedido.builder().usuario(user).estado(EstadoPedido.PENDIENTE).build();
        BigDecimal total = BigDecimal.ZERO;
        for (var it : items) {
            it.setPedido(pedido);
            total = total.add(it.getPrecioUnitario().multiply(BigDecimal.valueOf(it.getCantidad())));
        }
        pedido.setTotal(total);
        Pedido saved = pedidoRepository.save(pedido);
        // al estar en cascade, los items se persisten al asociarse a pedido y guardar el pedido
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{id}/estado")
    public ResponseEntity<Pedido> cambiarEstado(@PathVariable Long id, @RequestParam EstadoPedido estado) {
        return pedidoRepository.findById(id)
                .map(p -> { p.setEstado(estado); return ResponseEntity.ok(pedidoRepository.save(p)); })
                .orElse(ResponseEntity.notFound().build());
    }
}
