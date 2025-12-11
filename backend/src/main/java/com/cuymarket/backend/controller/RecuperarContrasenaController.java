package com.cuymarket.backend.controller;

import com.cuymarket.backend.dto.RestablecerContrasenaRequest;
import com.cuymarket.backend.dto.SolicitarRecuperacionRequest;
import com.cuymarket.backend.dto.VerificarCodigoRequest;
import com.cuymarket.backend.model.usuario.CodigoRecuperacion;
import com.cuymarket.backend.model.usuario.Usuario;
import com.cuymarket.backend.repository.CodigoRecuperacionRepository;
import com.cuymarket.backend.repository.usuario.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.Random;

@RestController
@RequestMapping("/api/auth/recuperar-contrasena")
@CrossOrigin(origins = "http://localhost:4200")
public class RecuperarContrasenaController {

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CodigoRecuperacionRepository codigoRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @PostMapping("/solicitar")
    @Transactional
    public ResponseEntity<Map<String, String>> solicitarRecuperacion(@RequestBody SolicitarRecuperacionRequest request) {
        Map<String, String> response = new HashMap<>();

        // Buscar usuario por email
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail()).orElse(null);

        if (usuario == null) {
            response.put("message", "Este correo no está vinculado a ninguna cuenta de CuyMarket");
            return ResponseEntity.badRequest().body(response);
        }

        // Eliminar códigos anteriores no usados
        codigoRepository.deleteByEmailAndUsadoFalse(request.getEmail());

        // Generar código de 6 dígitos
        String codigo = String.format("%06d", new Random().nextInt(999999));

        // Crear y guardar código
        CodigoRecuperacion codigoRecuperacion = new CodigoRecuperacion();
        codigoRecuperacion.setEmail(request.getEmail());
        codigoRecuperacion.setCodigo(codigo);
        codigoRecuperacion.setFechaCreacion(LocalDateTime.now());
        codigoRecuperacion.setFechaExpiracion(LocalDateTime.now().plusMinutes(10));
        codigoRecuperacion.setUsado(false);

        codigoRepository.save(codigoRecuperacion);

        // TODO: Enviar email con el código
        // Por ahora lo devolvemos en la consola del servidor
        System.out.println("==============================================");
        System.out.println("CÓDIGO DE RECUPERACIÓN PARA: " + request.getEmail());
        System.out.println("CÓDIGO: " + codigo);
        System.out.println("Válido por 10 minutos");
        System.out.println("==============================================");

        response.put("message", "Si el correo existe, recibirás un código de recuperación");
        response.put("codigo", codigo); // Solo para desarrollo, eliminar en producción
        return ResponseEntity.ok(response);
    }

    @PostMapping("/verificar-codigo")
    public ResponseEntity<Map<String, Object>> verificarCodigo(@RequestBody VerificarCodigoRequest request) {
        Map<String, Object> response = new HashMap<>();

        CodigoRecuperacion codigo = codigoRepository
                .findByEmailAndCodigoAndUsadoFalseAndFechaExpiracionAfter(
                        request.getEmail(),
                        request.getCodigo(),
                        LocalDateTime.now())
                .orElse(null);

        if (codigo == null) {
            response.put("valido", false);
            response.put("message", "Código inválido o expirado");
            return ResponseEntity.ok(response);
        }

        response.put("valido", true);
        response.put("message", "Código verificado correctamente");
        return ResponseEntity.ok(response);
    }

    @PostMapping("/restablecer")
    @Transactional
    public ResponseEntity<Map<String, String>> restablecerContrasena(@RequestBody RestablecerContrasenaRequest request) {
        Map<String, String> response = new HashMap<>();

        // Verificar código
        CodigoRecuperacion codigo = codigoRepository
                .findByEmailAndCodigoAndUsadoFalseAndFechaExpiracionAfter(
                        request.getEmail(),
                        request.getCodigo(),
                        LocalDateTime.now())
                .orElse(null);

        if (codigo == null) {
            response.put("message", "Código inválido o expirado");
            return ResponseEntity.badRequest().body(response);
        }

        // Buscar usuario
        Usuario usuario = usuarioRepository.findByEmail(request.getEmail()).orElse(null);

        if (usuario == null) {
            response.put("message", "Usuario no encontrado");
            return ResponseEntity.badRequest().body(response);
        }

        // Actualizar contraseña
        usuario.setPassword(passwordEncoder.encode(request.getNuevaContrasena()));
        usuarioRepository.save(usuario);

        // Marcar código como usado
        codigo.setUsado(true);
        codigoRepository.save(codigo);

        response.put("message", "Contraseña actualizada exitosamente");
        return ResponseEntity.ok(response);
    }
}
