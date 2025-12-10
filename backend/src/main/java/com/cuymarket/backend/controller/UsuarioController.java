package com.cuymarket.backend.controller;

import com.cuymarket.backend.dto.usuario.ActualizarPerfilRequest;
import com.cuymarket.backend.dto.usuario.UsuarioResponse;
import com.cuymarket.backend.model.usuario.Usuario;
import com.cuymarket.backend.security.JwtUtils;
import com.cuymarket.backend.service.usuario.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;
    private final JwtUtils jwtUtils;

    @GetMapping("/perfil")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioResponse> obtenerMiPerfil(@RequestHeader("Authorization") String token) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        Usuario usuario = usuarioService.obtenerPorId(usuarioId);
        return ResponseEntity.ok(convertirAResponse(usuario));
    }

    @PutMapping("/perfil")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UsuarioResponse> actualizarPerfil(
            @RequestHeader("Authorization") String token,
            @Valid @RequestBody ActualizarPerfilRequest request) {
        Long usuarioId = obtenerUsuarioIdDelToken(token);
        Usuario usuario = usuarioService.obtenerPorId(usuarioId);

        if (request.getNombre() != null)
            usuario.setNombre(request.getNombre());
        if (request.getApellido() != null)
            usuario.setApellido(request.getApellido());
        if (request.getEmail() != null)
            usuario.setEmail(request.getEmail());
        if (request.getTelefono() != null)
            usuario.setTelefono(request.getTelefono());

        Usuario usuarioActualizado = usuarioService.actualizar(usuarioId, usuario);
        return ResponseEntity.ok(convertirAResponse(usuarioActualizado));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> obtenerUsuario(@PathVariable Long id) {
        Usuario usuario = usuarioService.obtenerPorId(id);
        return ResponseEntity.ok(convertirAResponse(usuario));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UsuarioResponse>> listarUsuarios() {
        List<Usuario> usuarios = usuarioService.listarTodos();
        List<UsuarioResponse> response = usuarios.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> crearUsuario(
            @Valid @RequestBody com.cuymarket.backend.dto.usuario.CrearUsuarioAdminRequest request) {
        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setDni(request.getDni());
        usuario.setTelefono(request.getTelefono());
        usuario.setEmail(request.getEmail());
        usuario.setPassword(request.getPassword());
        usuario.setActivo(true); // Por defecto activo
        usuario.setEmailVerificado(true); // Admin crea, asumimos verificado o no? Mejor asumiendo verificado para
                                          // acceso inmediato

        java.util.Set<com.cuymarket.backend.model.enums.NombreRol> roles = new java.util.HashSet<>();
        if (request.getRol() != null) {
            try {
                roles.add(com.cuymarket.backend.model.enums.NombreRol.valueOf(request.getRol()));
            } catch (IllegalArgumentException e) {
                // Rol invalido, default CLIENTE
                roles.add(com.cuymarket.backend.model.enums.NombreRol.CLIENTE);
            }
        } else {
            roles.add(com.cuymarket.backend.model.enums.NombreRol.CLIENTE);
        }

        Usuario nuevoUsuario = usuarioService.crear(usuario, roles);
        return ResponseEntity.ok(convertirAResponse(nuevoUsuario));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<UsuarioResponse> actualizarUsuario(@PathVariable Long id,
            @RequestBody com.cuymarket.backend.dto.usuario.ActualizarUsuarioAdminRequest request) {

        if (request.getActivo() != null) {
            usuarioService.cambiarEstado(id, request.getActivo());
        }

        Usuario usuarioParaActualizar = new Usuario();
        usuarioParaActualizar.setNombre(request.getNombre());
        usuarioParaActualizar.setApellido(request.getApellido());
        usuarioParaActualizar.setDni(request.getDni());
        usuarioParaActualizar.setTelefono(request.getTelefono());
        usuarioParaActualizar.setEmail(request.getEmail());

        Usuario actualizado = usuarioService.actualizar(id, usuarioParaActualizar);

        // Update Role separately
        if (request.getRol() != null) {
            try {
                com.cuymarket.backend.model.enums.NombreRol nuevoRol = com.cuymarket.backend.model.enums.NombreRol
                        .valueOf(request.getRol());
                // Call service to update role
                actualizado = usuarioService.actualizarRol(id, nuevoRol);
            } catch (IllegalArgumentException e) {
                // Ignore invalid role
            }
        }

        return ResponseEntity.ok(convertirAResponse(actualizado));
    }

    @GetMapping("/reniec/{dni}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> consultarReniec(@PathVariable String dni) {
        String token = "sk_11056.xhd0EYfr9mr6M4sBT558ojgbJdgkZFpk";
        String url = "https://api.decolecta.com/v1/reniec/dni?numero=" + dni;

        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setBearerAuth(token);
        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

        try {
            org.springframework.http.ResponseEntity<String> response = restTemplate.exchange(url,
                    org.springframework.http.HttpMethod.GET, entity, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al consultar RENIEC: " + e.getMessage());
        }
    }

    @GetMapping("/public/reniec/{dni}")
    public ResponseEntity<?> consultarReniecPublico(@PathVariable String dni) {
        String token = "sk_11056.xhd0EYfr9mr6M4sBT558ojgbJdgkZFpk";
        String url = "https://api.decolecta.com/v1/reniec/dni?numero=" + dni;

        org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.setBearerAuth(token);
        org.springframework.http.HttpEntity<String> entity = new org.springframework.http.HttpEntity<>(headers);

        try {
            org.springframework.http.ResponseEntity<String> response = restTemplate.exchange(url,
                    org.springframework.http.HttpMethod.GET, entity, String.class);
            return ResponseEntity.ok(response.getBody());
        } catch (Exception e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error al consultar RENIEC: " + e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarUsuario(@PathVariable Long id) {
        usuarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    private Long obtenerUsuarioIdDelToken(String token) {
        String jwt = token.substring(7);
        return jwtUtils.getUserIdFromToken(jwt);
    }

    private UsuarioResponse convertirAResponse(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getDni(),
                usuario.getEmail(),
                usuario.getTelefono(),
                usuario.getActivo(),
                usuario.getEmailVerificado(),
                usuario.getFechaRegistro(),
                usuario.getUltimoAcceso(),
                usuario.getRoles().stream()
                        .map(rol -> rol.getNombre().name())
                        .collect(Collectors.toList()));
    }

}
