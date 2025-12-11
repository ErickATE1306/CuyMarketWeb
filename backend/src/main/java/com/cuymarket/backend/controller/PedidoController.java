package com.cuymarket.backend.controller;

import com.cuymarket.backend.dto.pedido.CrearPedidoRequest;
import com.cuymarket.backend.dto.pedido.PedidoResponse;
import com.cuymarket.backend.model.enums.EstadoPedido;
import com.cuymarket.backend.model.pedido.InformacionPago;
import com.cuymarket.backend.model.pedido.Pedido;
import com.cuymarket.backend.security.JwtUtils;
import com.cuymarket.backend.service.pedido.InformacionPagoService;
import com.cuymarket.backend.service.pedido.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/pedidos")
@RequiredArgsConstructor
public class PedidoController {

    private final PedidoService pedidoService;
    private final InformacionPagoService informacionPagoService;
    private final JwtUtils jwtUtils;

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PedidoResponse> crearPedido(
            @RequestHeader("Authorization") String token,
            @ModelAttribute @Valid CrearPedidoRequest request) throws Exception {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        Pedido pedido = pedidoService.crearDesdeCarrito(
                usuarioId,
                request.getDireccionEnvioId(),
                request.getMetodoPago(),
                request.getCodigoCupon(),
                request);
        return ResponseEntity.ok(convertirAResponse(pedido));
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PedidoResponse>> listarMisPedidos(@RequestHeader("Authorization") String token) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        List<Pedido> pedidos = pedidoService.listarPorUsuario(usuarioId);
        List<PedidoResponse> response = pedidos.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PedidoResponse> obtenerPedido(@PathVariable Long id) {
        Pedido pedido = pedidoService.obtenerPorId(id);
        return ResponseEntity.ok(convertirAResponse(pedido));
    }

    @PutMapping("/{id}/cancelar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PedidoResponse> cancelarPedido(
            @PathVariable Long id,
            @RequestHeader("Authorization") String token) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        Pedido pedido = pedidoService.obtenerPorId(id);
        
        // Verificar que el pedido pertenece al usuario
        if (!pedido.getUsuario().getId().equals(usuarioId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Solo se puede cancelar si está PENDIENTE o PROCESANDO
        if (pedido.getEstado() != EstadoPedido.PENDIENTE && pedido.getEstado() != EstadoPedido.PROCESANDO) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        
        Pedido pedidoCancelado = pedidoService.actualizarEstado(id, EstadoPedido.CANCELADO);
        return ResponseEntity.ok(convertirAResponse(pedidoCancelado));
    }

    @PutMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('EMPLEADO', 'ADMIN')")
    public ResponseEntity<PedidoResponse> actualizarEstado(
            @PathVariable Long id,
            @RequestBody EstadoPedidoRequest request) {
        Pedido pedido = pedidoService.actualizarEstado(id, request.getEstado());
        return ResponseEntity.ok(convertirAResponse(pedido));
    }

    @PutMapping("/{id}/estado-pago")
    @PreAuthorize("hasAnyRole('EMPLEADO', 'ADMIN')")
    public ResponseEntity<PedidoResponse> actualizarEstadoPago(
            @PathVariable Long id,
            @RequestBody EstadoPagoRequest request) {
        Pedido pedido = pedidoService.actualizarEstadoPago(id, request.getEstadoPago());
        return ResponseEntity.ok(convertirAResponse(pedido));
    }

    // DTO interno para recibir el estado
    public static class EstadoPedidoRequest {
        private String estado;
        
        public EstadoPedido getEstado() {
            return EstadoPedido.valueOf(estado);
        }
        
        public void setEstado(String estado) {
            this.estado = estado;
        }
    }

    // DTO interno para recibir el estado de pago
    public static class EstadoPagoRequest {
        private String estadoPago;
        
        public com.cuymarket.backend.model.enums.EstadoPago getEstadoPago() {
            return com.cuymarket.backend.model.enums.EstadoPago.valueOf(estadoPago);
        }
        
        public void setEstadoPago(String estadoPago) {
            this.estadoPago = estadoPago;
        }
    }

    @GetMapping("/empleado/todos")
    @PreAuthorize("hasAnyRole('EMPLEADO', 'ADMIN')")
    public ResponseEntity<List<PedidoResponse>> listarTodosPedidosEmpleado() {
        List<Pedido> pedidos = pedidoService.listarTodos();
        List<PedidoResponse> response = pedidos.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/admin/todos")
    @PreAuthorize("hasAnyRole('EMPLEADO', 'ADMIN')")
    public ResponseEntity<List<PedidoResponse>> listarTodosPedidos() {
        List<Pedido> pedidos = pedidoService.listarTodos();
        List<PedidoResponse> response = pedidos.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/estado/{estado}")
    @PreAuthorize("hasAnyRole('EMPLEADO', 'ADMIN')")
    public ResponseEntity<List<PedidoResponse>> listarPorEstado(@PathVariable EstadoPedido estado) {
        List<Pedido> pedidos = pedidoService.listarPorEstado(estado);
        List<PedidoResponse> response = pedidos.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{pedidoId}/comprobante")
    @PreAuthorize("hasAnyRole('EMPLEADO', 'ADMIN')")
    public ResponseEntity<byte[]> obtenerComprobantePago(@PathVariable Long pedidoId) {
        try {
            InformacionPago infoPago = informacionPagoService.obtenerPorPedido(pedidoId);
            if (infoPago == null || infoPago.getComprobante() == null) {
                return ResponseEntity.notFound().build();
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.IMAGE_JPEG);
            headers.setContentLength(infoPago.getComprobante().length);
            
            return new ResponseEntity<>(infoPago.getComprobante(), headers, HttpStatus.OK);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    private Long obtenerUsuarioIdDelToken(String token) {
        String jwt = token.substring(7);
        return jwtUtils.getUserIdFromToken(jwt);
    }

    private PedidoResponse convertirAResponse(Pedido pedido) {
        PedidoResponse response = new PedidoResponse();
        response.setId(pedido.getId());
        response.setNumeroPedido(pedido.getNumeroPedido());
        response.setFechaPedido(pedido.getFechaPedido());
        response.setEstado(pedido.getEstado().name());
        response.setEstadoPago(pedido.getEstadoPago() != null ? pedido.getEstadoPago().name() : null);
        response.setSubtotal(pedido.getSubtotal());
        response.setDescuento(pedido.getDescuento());
        response.setCostoEnvio(pedido.getCostoEnvio());
        response.setTotal(pedido.getTotal());
        response.setMetodoPago(pedido.getMetodoPago() != null ? pedido.getMetodoPago().name() : null);
        response.setNotas(pedido.getNotas());

        if (pedido.getDireccionEnvio() != null) {
            response.setDireccionEnvio(
                    pedido.getDireccionEnvio().getDireccion() + ", " +
                            pedido.getDireccionEnvio().getDistrito() + ", " +
                            pedido.getDireccionEnvio().getCiudad());
        }

        if (pedido.getUsuario() != null) {
            response.setUsuarioNombre(
                    (pedido.getUsuario().getNombre() != null ? pedido.getUsuario().getNombre() : "") + " " +
                    (pedido.getUsuario().getApellido() != null ? pedido.getUsuario().getApellido() : "")
            );
            response.setUsuarioEmail(pedido.getUsuario().getEmail());
        }

        response.setItems(pedido.getItems().stream()
                .map(item -> new PedidoResponse.ItemPedidoResponse(
                        item.getId(),
                        item.getProducto().getId(),
                        item.getProducto().getNombre(),
                        item.getProducto().getRaza(),
                        item.getCantidad(),
                        item.getPrecioUnitario(),
                        item.getSubtotal()))
                .collect(Collectors.toList()));

        // Agregar información del comprobante de pago
        try {
            InformacionPago infoPago = informacionPagoService.obtenerPorPedido(pedido.getId());
            if (infoPago != null) {
                response.setInformacionPagoId(infoPago.getId());
                response.setTieneComprobante(infoPago.getComprobante() != null && infoPago.getComprobante().length > 0);
            }
        } catch (Exception e) {
            response.setTieneComprobante(false);
        }

        return response;
    }
}
