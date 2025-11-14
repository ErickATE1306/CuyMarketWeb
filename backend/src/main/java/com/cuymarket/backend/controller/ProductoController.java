package com.cuymarket.backend.controller;

import com.cuymarket.backend.model.Producto;
import com.cuymarket.backend.repository.ProductoRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {
    private final ProductoRepository productoRepository;

    public ProductoController(ProductoRepository productoRepository) { this.productoRepository = productoRepository; }

    @GetMapping
    public List<Producto> listar() { return productoRepository.findAll(); }

    @GetMapping("/{id}")
    public ResponseEntity<Producto> obtener(@PathVariable Long id) {
        return productoRepository.findById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','EMPLEADO')")
    public ResponseEntity<Producto> crear(@RequestBody @Valid Producto p) { return ResponseEntity.ok(productoRepository.save(p)); }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLEADO')")
    public ResponseEntity<Producto> editar(@PathVariable Long id, @RequestBody @Valid Producto p) {
        return productoRepository.findById(id)
                .map(db -> {
                    db.setNombre(p.getNombre());
                    db.setDescripcion(p.getDescripcion());
                    db.setPrecio(p.getPrecio());
                    db.setStock(p.getStock());
                    db.setImagenUrl(p.getImagenUrl());
                    db.setActivo(p.getActivo());
                    return ResponseEntity.ok(productoRepository.save(db));
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN','EMPLEADO')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        if (!productoRepository.existsById(id)) return ResponseEntity.notFound().build();
        productoRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
