package com.cuymarket.backend.controller;

import com.cuymarket.backend.config.JwtService;
import com.cuymarket.backend.controller.dto.AuthDtos.AuthResponse;
import com.cuymarket.backend.controller.dto.AuthDtos.LoginRequest;
import com.cuymarket.backend.controller.dto.AuthDtos.RegisterRequest;
import com.cuymarket.backend.model.RolUsuario;
import com.cuymarket.backend.model.Usuario;
import com.cuymarket.backend.repository.UsuarioRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthController(AuthenticationManager authenticationManager, UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.authenticationManager = authenticationManager;
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody @Valid LoginRequest request) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.email(), request.password()));
        var user = usuarioRepository.findByEmail(request.email()).orElseThrow();
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token));
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody @Valid RegisterRequest request) {
        if (usuarioRepository.existsByEmail(request.email())) {
            return ResponseEntity.badRequest().build();
        }
        Usuario user = Usuario.builder()
                .nombres(request.nombres())
                .apellidos(request.apellidos())
                .email(request.email())
                .password(passwordEncoder.encode(request.password()))
                .rol(RolUsuario.CLIENTE)
                .build();
        usuarioRepository.save(user);
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
