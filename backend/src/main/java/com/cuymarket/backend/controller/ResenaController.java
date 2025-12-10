package com.cuymarket.backend.controller;

import com.cuymarket.backend.dto.resena.ResenaRequest;
import com.cuymarket.backend.dto.resena.ResenaResponse;
import com.cuymarket.backend.model.producto.Resena;
import com.cuymarket.backend.security.JwtUtils;
import com.cuymarket.backend.service.producto.ResenaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/resenas")
@RequiredArgsConstructor
public class ResenaController {

    private final ResenaService resenaService;
    private final JwtUtils jwtUtils;

    @GetMapping("/producto/{productoId}")
    public ResponseEntity<List<ResenaResponse>> listarResenasDeProducto(@PathVariable Long productoId) {
        List<Resena> resenas = resenaService.listarPorProducto(productoId);
        List<ResenaResponse> response = resenas.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/producto/{productoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResenaResponse> crearResena(
            @RequestHeader("Authorization") String token,
            @PathVariable Long productoId,
            @Valid @RequestBody ResenaRequest request) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        Resena resena = resenaService.crear(productoId, usuarioId, request.getCalificacion(), request.getComentario());
        return ResponseEntity.ok(convertirAResponse(resena));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<ResenaResponse> actualizarResena(
            @PathVariable Long id,
            @Valid @RequestBody ResenaRequest request) {
        Resena resena = resenaService.actualizar(id, request.getCalificacion(), request.getComentario());
        return ResponseEntity.ok(convertirAResponse(resena));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> eliminarResena(@PathVariable Long id) {
        resenaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/verificar")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ResenaResponse> verificarResena(@PathVariable Long id) {
        Resena resena = resenaService.verificar(id);
        return ResponseEntity.ok(convertirAResponse(resena));
    }

    private Long obtenerUsuarioIdDelToken(String token) {
        String jwt = token.substring(7);
        return jwtUtils.getUserIdFromToken(jwt);
    }

    private ResenaResponse convertirAResponse(Resena resena) {
        return new ResenaResponse(
                resena.getId(),
                resena.getProducto().getId(),
                resena.getProducto().getNombre(),
                resena.getUsuario().getId(),
                resena.getUsuario().getNombre() + " " + resena.getUsuario().getApellido(),
                resena.getCalificacion(),
                resena.getComentario(),
                resena.getVerificado(),
                resena.getFechaCreacion());
    }
}
