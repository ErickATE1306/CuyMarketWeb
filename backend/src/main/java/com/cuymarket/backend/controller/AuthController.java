package com.cuymarket.backend.controller;

import com.cuymarket.backend.dto.auth.*;
import com.cuymarket.backend.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    
    private final AuthService authService;
    
    /**
     * Paso 1: Login inicial - valida credenciales
     * Retorna AuthResponse si es cliente directo
     * Retorna RoleSelectionResponse si es empleado/admin (requiere selección)
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        Object response = authService.authenticate(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Paso 2: Usuario selecciona rol (solo para empleado/admin)
     * Retorna AuthResponse con el token JWT
     */
    @PostMapping("/login/select-role")
    public ResponseEntity<AuthResponse> loginWithRole(@Valid @RequestBody RoleSelectionRequest request) {
        AuthResponse response = authService.loginWithRole(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Registro de nuevo usuario (siempre con rol CLIENTE)
     */
    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.ok(response);
    }
    
    /**
     * Cambiar de rol (para usuarios con múltiples roles ya autenticados)
     */
    @PostMapping("/switch-role")
    public ResponseEntity<AuthResponse> switchRole(@RequestParam String email, 
                                                   @RequestParam String nuevoRol) {
        AuthResponse response = authService.switchRole(email, 
            com.cuymarket.backend.model.enums.NombreRol.valueOf(nuevoRol));
        return ResponseEntity.ok(response);
    }
    
    /**
     * Validar token
     */
    @GetMapping("/validate")
    public ResponseEntity<Boolean> validateToken(@RequestParam String token) {
        boolean isValid = authService.validateToken(token);
        return ResponseEntity.ok(isValid);
    }
}
