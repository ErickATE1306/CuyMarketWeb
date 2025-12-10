package com.cuymarket.backend.controller;

import com.cuymarket.backend.dto.carrito.AgregarItemRequest;
import com.cuymarket.backend.dto.carrito.ActualizarCantidadRequest;
import com.cuymarket.backend.dto.carrito.CarritoResponse;
import com.cuymarket.backend.dto.producto.ProductoResponse;
import com.cuymarket.backend.model.carrito.Carrito;
import com.cuymarket.backend.model.producto.Producto;
import com.cuymarket.backend.security.JwtUtils;
import com.cuymarket.backend.service.carrito.CarritoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/carrito")
@RequiredArgsConstructor
public class CarritoController {

    private final CarritoService carritoService;
    private final JwtUtils jwtUtils;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CarritoResponse> obtenerCarrito(@RequestHeader("Authorization") String token) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        Carrito carrito = carritoService.obtenerOCrearCarrito(usuarioId);
        return ResponseEntity.ok(convertirAResponse(carrito));
    }

    @PostMapping("/items")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CarritoResponse> agregarItem(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody AgregarItemRequest request) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        carritoService.agregarProducto(usuarioId, request.getProductoId(), request.getCantidad());
        // Recargar el carrito completo desde la BD para asegurar datos actualizados
        Carrito carrito = carritoService.obtenerCarritoConItems(usuarioId);
        return ResponseEntity.ok(convertirAResponse(carrito));
    }

    @PutMapping("/items/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CarritoResponse> actualizarCantidad(
            @RequestHeader("Authorization") String token,
            @PathVariable Long itemId,
            @Valid @RequestBody ActualizarCantidadRequest request) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        carritoService.actualizarCantidad(usuarioId, itemId, request.getCantidad());
        // Recargar el carrito completo desde la BD
        Carrito carrito = carritoService.obtenerCarritoConItems(usuarioId);
        return ResponseEntity.ok(convertirAResponse(carrito));
    }

    @DeleteMapping("/items/{itemId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CarritoResponse> eliminarItem(
            @RequestHeader("Authorization") String token,
            @PathVariable Long itemId) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        carritoService.removerProducto(usuarioId, itemId);
        // Recargar el carrito completo desde la BD
        Carrito carrito = carritoService.obtenerCarritoConItems(usuarioId);
        return ResponseEntity.ok(convertirAResponse(carrito));
    }

    @DeleteMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> limpiarCarrito(@RequestHeader("Authorization") String token) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        carritoService.limpiarCarrito(usuarioId);
        return ResponseEntity.noContent().build();
    }

    private Long obtenerUsuarioIdDelToken(String token) {
        String jwt = token.substring(7); // Remover "Bearer "
        return jwtUtils.getUserIdFromToken(jwt);
    }

    private CarritoResponse convertirAResponse(Carrito carrito) {
        CarritoResponse response = new CarritoResponse();
        response.setId(carrito.getId());
        response.setUsuarioId(carrito.getUsuario().getId());
        response.setTotal(carritoService.calcularTotal(carrito.getId()));
        response.setTotalItems(carrito.getItems().size());
        response.setFechaActualizacion(carrito.getFechaActualizacion());

        response.setItems(carrito.getItems().stream()
                .map(item -> {
                    ProductoResponse productoResponse = convertirProductoAResponse(item.getProducto());
                    return new CarritoResponse.ItemCarritoResponse(
                            item.getId(),
                            productoResponse,
                            item.getCantidad(),
                            item.getProducto().getPrecio().multiply(java.math.BigDecimal.valueOf(item.getCantidad()))
                    );
                })
                .collect(Collectors.toList()));

        return response;
    }

    private ProductoResponse convertirProductoAResponse(Producto producto) {
        ProductoResponse response = new ProductoResponse();
        response.setId(producto.getId());
        response.setNombre(producto.getNombre());
        response.setRaza(producto.getRaza());
        response.setPeso(producto.getPeso());
        response.setPrecio(producto.getPrecio());
        response.setTipo(producto.getTipo());
        // Convertir Boolean a String "Sí" o "No"
        response.setCertificado(producto.getCertificado() != null && producto.getCertificado() ? "Sí" : "No");
        response.setDescripcion(producto.getDescripcion());
        response.setCaracteristicas(producto.getCaracteristicas());
        
        // Convertir imagen a Base64 si existe
        if (producto.getImagen() != null && producto.getImagen().length > 0) {
            String base64Image = java.util.Base64.getEncoder().encodeToString(producto.getImagen());
            response.setImagen("data:image/jpeg;base64," + base64Image);
        }
        
        response.setActivo(producto.getActivo());
        response.setFechaCreacion(producto.getFechaCreacion());
        
        // Datos de categoría
        if (producto.getCategoria() != null) {
            response.setCategoriaId(producto.getCategoria().getId());
            response.setCategoriaNombre(producto.getCategoria().getNombre());
        }
        
        // Stock
        response.setStockDisponible(producto.getStockDisponible());
        response.setStockMinimo(producto.getStockMinimo());
        
        return response;
    }
}
