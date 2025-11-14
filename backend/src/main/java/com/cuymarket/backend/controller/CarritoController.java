package com.cuymarket.backend.controller;

import com.cuymarket.backend.model.ItemCarrito;
import com.cuymarket.backend.model.Producto;
import com.cuymarket.backend.model.Usuario;
import com.cuymarket.backend.repository.ItemCarritoRepository;
import com.cuymarket.backend.repository.ProductoRepository;
import jakarta.validation.constraints.Min;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.List;

@RestController
@RequestMapping("/api/carrito")
public class CarritoController {
    private final ItemCarritoRepository itemRepo;
    private final ProductoRepository productoRepo;

    public CarritoController(ItemCarritoRepository itemRepo, ProductoRepository productoRepo) {
        this.itemRepo = itemRepo; this.productoRepo = productoRepo;
    }

    @GetMapping
    public List<ItemCarrito> listar(@AuthenticationPrincipal Usuario user) {
        return itemRepo.findByUsuarioAndPedidoIsNull(user);
    }

    @PostMapping("/agregar/{productoId}")
    public ResponseEntity<ItemCarrito> agregar(@AuthenticationPrincipal Usuario user, @PathVariable Long productoId, @RequestParam(defaultValue = "1") @Min(1) int cantidad) {
        Producto p = productoRepo.findById(productoId).orElse(null);
        if (p == null) return ResponseEntity.notFound().build();
        ItemCarrito item = ItemCarrito.builder().usuario(user).producto(p).cantidad(cantidad).precioUnitario(p.getPrecio()).build();
        return ResponseEntity.ok(itemRepo.save(item));
    }

    @PutMapping("/{itemId}")
    public ResponseEntity<ItemCarrito> actualizarCantidad(@AuthenticationPrincipal Usuario user, @PathVariable Long itemId, @RequestParam @Min(1) int cantidad) {
        return itemRepo.findById(itemId).filter(i -> i.getUsuario().getId().equals(user.getId()) && i.getPedido() == null)
                .map(i -> { i.setCantidad(cantidad); return ResponseEntity.ok(itemRepo.save(i)); })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{itemId}")
    public ResponseEntity<Void> eliminar(@AuthenticationPrincipal Usuario user, @PathVariable Long itemId) {
        var opt = itemRepo.findById(itemId).filter(i -> i.getUsuario().getId().equals(user.getId()) && i.getPedido() == null);
        if (opt.isEmpty()) return ResponseEntity.notFound().build();
        itemRepo.delete(opt.get());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/vaciar")
    public ResponseEntity<Void> vaciar(@AuthenticationPrincipal Usuario user) {
        itemRepo.findByUsuarioAndPedidoIsNull(user).forEach(itemRepo::delete);
        return ResponseEntity.noContent().build();
    }
}
