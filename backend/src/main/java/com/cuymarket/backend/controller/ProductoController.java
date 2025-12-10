package com.cuymarket.backend.controller;

import com.cuymarket.backend.dto.producto.ProductoRequest;
import com.cuymarket.backend.dto.producto.ProductoResponse;
import com.cuymarket.backend.model.producto.Producto;
import com.cuymarket.backend.service.producto.ProductoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/productos")
@RequiredArgsConstructor
public class ProductoController {

    private final ProductoService productoService;

    /**
     * Listar todos los productos (público)
     */
    @GetMapping
    public ResponseEntity<List<ProductoResponse>> listarProductos() {
        List<Producto> productos = productoService.listarTodos();
        List<ProductoResponse> response = productos.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Obtener producto por ID (público)
     */
    @GetMapping("/{id}")
    public ResponseEntity<ProductoResponse> obtenerProducto(@PathVariable Long id) {
        Producto producto = productoService.obtenerPorId(id);
        return ResponseEntity.ok(convertirAResponse(producto));
    }

    /**
     * Listar productos por categoría (público)
     */
    @GetMapping("/categoria/{categoriaId}")
    public ResponseEntity<List<ProductoResponse>> listarPorCategoria(@PathVariable Long categoriaId) {
        List<Producto> productos = productoService.listarPorCategoria(categoriaId);
        List<ProductoResponse> response = productos.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Buscar productos (público)
     */
    @GetMapping("/buscar")
    public ResponseEntity<List<ProductoResponse>> buscarProductos(@RequestParam String query) {
        List<Producto> productos = productoService.buscarPorNombre(query);
        List<ProductoResponse> response = productos.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    /**
     * Crear producto (ADMIN)
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponse> crearProducto(@Valid @RequestBody ProductoRequest request) {
        Producto producto = convertirAEntidad(request);
        Producto productoCreado = productoService.crear(producto, request.getCategoriaId());
        return ResponseEntity.ok(convertirAResponse(productoCreado));
    }

    /**
     * Actualizar producto (ADMIN)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponse> actualizarProducto(
            @PathVariable Long id,
            @Valid @RequestBody ProductoRequest request) {
        Producto producto = convertirAEntidad(request);
        Producto productoActualizado = productoService.actualizar(id, producto, request.getCategoriaId());
        return ResponseEntity.ok(convertirAResponse(productoActualizado));
    }

    /**
     * Eliminar producto (ADMIN)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarProducto(@PathVariable Long id) {
        productoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * Incrementar stock (ADMIN)
     */
    @PutMapping("/{id}/stock/incrementar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponse> incrementarStock(
            @PathVariable Long id,
            @RequestParam Integer cantidad,
            @RequestParam(required = false, defaultValue = "Ajuste manual") String motivo) {
        Producto producto = productoService.incrementarStock(id, cantidad, motivo);
        return ResponseEntity.ok(convertirAResponse(producto));
    }

    /**
     * Descontar stock (ADMIN)
     */
    @PutMapping("/{id}/stock/descontar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponse> descontarStock(
            @PathVariable Long id,
            @RequestParam Integer cantidad,
            @RequestParam(required = false, defaultValue = "Ajuste manual") String motivo) {
        Producto producto = productoService.descontarStock(id, cantidad, motivo);
        return ResponseEntity.ok(convertirAResponse(producto));
    }

    /**
     * Actualizar stock directo (ADMIN)
     */
    @PutMapping("/{id}/stock")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ProductoResponse> actualizarStock(
            @PathVariable Long id,
            @RequestParam Integer stock) {
        Producto producto = productoService.actualizarStock(id, stock);
        return ResponseEntity.ok(convertirAResponse(producto));
    }

    // Métodos de conversión
    private ProductoResponse convertirAResponse(Producto producto) {
        ProductoResponse response = new ProductoResponse();
        response.setId(producto.getId());
        response.setNombre(producto.getNombre());
        response.setRaza(producto.getRaza());
        response.setPeso(producto.getPeso()); // Ahora peso es String en ambos lados
        response.setPrecio(producto.getPrecio());
        response.setTipo(producto.getTipo());
        response.setCertificado(producto.getCertificado() != null && producto.getCertificado() ? "Sí" : "No");
        response.setDescripcion(producto.getDescripcion());
        response.setCaracteristicas(producto.getCaracteristicas());
        
        if (producto.getImagen() != null && producto.getImagen().length > 0) {
            try {
                String base64Image = Base64.getEncoder().encodeToString(producto.getImagen());
                response.setImagen("data:image/jpeg;base64," + base64Image);
            } catch (Exception e) {
                response.setImagen(null);
            }
        } else {
            response.setImagen(null);
        }
        
        response.setActivo(producto.getActivo() != null ? producto.getActivo() : true);
        response.setFechaCreacion(producto.getFechaCreacion());
        response.setStockDisponible(producto.getStockDisponible() != null ? producto.getStockDisponible() : 0);
        response.setStockMinimo(producto.getStockMinimo() != null ? producto.getStockMinimo() : 5);

        if (producto.getCategoria() != null) {
            response.setCategoriaId(producto.getCategoria().getId());
            response.setCategoriaNombre(producto.getCategoria().getNombre());
        }

        return response;
    }

    private Producto convertirAEntidad(ProductoRequest request) {
        Producto producto = new Producto();
        producto.setNombre(request.getNombre());
        producto.setRaza(request.getRaza());
        producto.setPeso(request.getPeso() != null ? String.valueOf(request.getPeso()) : null);
        producto.setPrecio(request.getPrecio());
        producto.setTipo(request.getTipo());
        // Conversión segura de String a Boolean verificando "Sí" o "true"
        producto.setCertificado(
                "Sí".equalsIgnoreCase(request.getCertificado()) || "true".equalsIgnoreCase(request.getCertificado()));
        producto.setDescripcion(request.getDescripcion());
        producto.setCaracteristicas(request.getCaracteristicas());
        
        // Convertir Base64 a bytes si hay imagen
        if (request.getImagen() != null && !request.getImagen().isEmpty()) {
            try {
                // Si la imagen viene con el prefijo data:image, quitarlo
                String base64Image = request.getImagen();
                if (base64Image.contains(",")) {
                    base64Image = base64Image.split(",")[1];
                }
                producto.setImagen(Base64.getDecoder().decode(base64Image));
            } catch (IllegalArgumentException e) {
                // Si falla la decodificación, usar getBytes como fallback
                producto.setImagen(request.getImagen().getBytes());
            }
        }
        
        producto.setActivo(request.getActivo());
        producto.setStockDisponible(request.getStockDisponible() != null ? request.getStockDisponible() : 0);
        producto.setStockMinimo(request.getStockMinimo() != null ? request.getStockMinimo() : 5);
        return producto;
    }
}
