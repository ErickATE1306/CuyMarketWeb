package com.cuymarket.backend.controller;

import com.cuymarket.backend.model.sistema.Notificacion;
import com.cuymarket.backend.service.sistema.NotificacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.cuymarket.backend.model.usuario.Usuario;
import com.cuymarket.backend.repository.usuario.UsuarioRepository;

import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@RequiredArgsConstructor
public class NotificacionController {

    private final NotificacionService notificacionService;
    private final UsuarioRepository usuarioRepository; // Temporal para obtener ID

    @GetMapping
    public ResponseEntity<List<Notificacion>> misNotificaciones(Authentication authentication) {
        Long usuarioId = obtenerUsuarioId(authentication);
        return ResponseEntity.ok(notificacionService.listarPorUsuario(usuarioId));
    }

    @GetMapping("/no-leidas")
    public ResponseEntity<List<Notificacion>> noLeidas(Authentication authentication) {
        Long usuarioId = obtenerUsuarioId(authentication);
        return ResponseEntity.ok(notificacionService.listarNoLeidas(usuarioId));
    }

    @PutMapping("/{id}/leida")
    public ResponseEntity<Notificacion> marcarLeida(@PathVariable Long id) {
        return ResponseEntity.ok(notificacionService.marcarComoLeida(id));
    }

    @PutMapping("/todas-leidas")
    public ResponseEntity<Void> marcarTodasLeidas(Authentication authentication) {
        Long usuarioId = obtenerUsuarioId(authentication);
        notificacionService.marcarTodasComoLeidas(usuarioId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        notificacionService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    private Long obtenerUsuarioId(Authentication authentication) {
        // Estrategia temporal: buscar por email del principal
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .map(Usuario::getId)
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));
    }
}
