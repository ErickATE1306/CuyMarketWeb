package com.cuymarket.backend.controller;

import com.cuymarket.backend.dto.direccion.DireccionRequest;
import com.cuymarket.backend.dto.direccion.DireccionResponse;
import com.cuymarket.backend.model.usuario.DireccionEnvio;
import com.cuymarket.backend.security.JwtUtils;
import com.cuymarket.backend.service.usuario.DireccionEnvioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/direcciones")
@RequiredArgsConstructor
public class DireccionController {

    private final DireccionEnvioService direccionService;
    private final JwtUtils jwtUtils;

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<DireccionResponse>> listarMisDirecciones(@RequestHeader("Authorization") String token) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        List<DireccionEnvio> direcciones = direccionService.listarPorUsuario(usuarioId);
        List<DireccionResponse> response = direcciones.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/principal")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DireccionResponse> obtenerDireccionPrincipal(@RequestHeader("Authorization") String token) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        try {
            DireccionEnvio direccion = direccionService.obtenerPrincipalDeUsuario(usuarioId);
            return ResponseEntity.ok(convertirAResponse(direccion));
        } catch (RuntimeException e) {
            return ResponseEntity.noContent().build();
        }
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DireccionResponse> crearDireccion(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody DireccionRequest request) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        DireccionEnvio direccion = convertirAEntidad(request);
        DireccionEnvio direccionCreada = direccionService.crear(usuarioId, direccion);
        return ResponseEntity.ok(convertirAResponse(direccionCreada));
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DireccionResponse> actualizarDireccion(
            @PathVariable Long id,
            @Valid @RequestBody DireccionRequest request) {
        DireccionEnvio direccion = convertirAEntidad(request);
        DireccionEnvio direccionActualizada = direccionService.actualizar(id, direccion);
        return ResponseEntity.ok(convertirAResponse(direccionActualizada));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> eliminarDireccion(@PathVariable Long id) {
        direccionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/principal")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<DireccionResponse> marcarComoPrincipal(@PathVariable Long id) {
        DireccionEnvio direccion = direccionService.establecerComoPrincipal(id);
        return ResponseEntity.ok(convertirAResponse(direccion));
    }

    private Long obtenerUsuarioIdDelToken(String token) {
        String jwt = token.substring(7);
        return jwtUtils.getUserIdFromToken(jwt);
    }

    private DireccionResponse convertirAResponse(DireccionEnvio direccion) {
        return new DireccionResponse(
                direccion.getId(),
                direccion.getNombre(),
                direccion.getApellido(),
                direccion.getTelefono(),
                direccion.getDireccion(),
                direccion.getReferencia(),
                direccion.getCiudad(),
                direccion.getDistrito(),
                direccion.getCodigoPostal(),
                direccion.getEsPrincipal());
    }

    private DireccionEnvio convertirAEntidad(DireccionRequest request) {
        DireccionEnvio direccion = new DireccionEnvio();
        direccion.setNombre(request.getNombre());
        direccion.setApellido(request.getApellido());
        direccion.setTelefono(request.getTelefono());
        direccion.setDireccion(request.getDireccion());
        direccion.setReferencia(request.getReferencia());
        direccion.setCiudad(request.getCiudad());
        direccion.setDistrito(request.getDistrito());
        direccion.setCodigoPostal(request.getCodigoPostal());
        direccion.setEsPrincipal(request.getEsPrincipal());
        return direccion;
    }
}
