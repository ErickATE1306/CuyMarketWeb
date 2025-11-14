package com.cuymarket.backend.controller;

import com.cuymarket.backend.model.Usuario;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    @GetMapping("/me")
    public ResponseEntity<Usuario> me(@AuthenticationPrincipal Usuario user) {
        return ResponseEntity.ok(user);
    }
}
