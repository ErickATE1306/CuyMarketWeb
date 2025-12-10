package com.cuymarket.backend.service.auth;

import com.cuymarket.backend.dto.auth.*;
import com.cuymarket.backend.model.carrito.Carrito;
import com.cuymarket.backend.model.enums.NombreRol;
import com.cuymarket.backend.model.usuario.Rol;
import com.cuymarket.backend.model.usuario.Usuario;
import com.cuymarket.backend.repository.carrito.CarritoRepository;
import com.cuymarket.backend.repository.usuario.RolRepository;
import com.cuymarket.backend.repository.usuario.UsuarioRepository;
import com.cuymarket.backend.security.JwtUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final CarritoRepository carritoRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtils jwtUtils;

    /**
     * Paso 1 del login: Validar credenciales y verificar si requiere selección de
     * rol
     */
    public Object authenticate(LoginRequest request) {
        // Buscar usuario por email
        Usuario usuario = usuarioRepository.findByEmailWithRoles(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Credenciales incorrectas"));

        // Validar contraseña
        if (!passwordEncoder.matches(request.getPassword(), usuario.getPassword())) {
            throw new RuntimeException("Credenciales incorrectas");
        }

        // Validar que el usuario esté activo
        if (!usuario.getActivo()) {
            throw new RuntimeException("Usuario inactivo. Contacte al administrador.");
        }

        // Obtener nombres de roles
        Set<NombreRol> rolesUsuario = usuario.getRoles().stream()
                .map(Rol::getNombre)
                .collect(Collectors.toSet());

        // Verificar si el usuario tiene rol EMPLEADO o ADMIN (además de otros roles)
        boolean tieneEmpleadoOAdmin = rolesUsuario.contains(NombreRol.EMPLEADO) ||
                rolesUsuario.contains(NombreRol.ADMIN);

        // Si tiene EMPLEADO o ADMIN, debe seleccionar rol
        if (tieneEmpleadoOAdmin) {
            // Crear lista de roles disponibles para seleccionar
            List<NombreRol> rolesDisponibles = rolesUsuario.stream()
                    .filter(rol -> rol == NombreRol.EMPLEADO ||
                            rol == NombreRol.ADMIN ||
                            rol == NombreRol.CLIENTE)
                    .collect(Collectors.toList());

            // Regla de negocio: Un ADMIN siempre puede actuar como CLIENTE
            if (rolesUsuario.contains(NombreRol.ADMIN) && !rolesDisponibles.contains(NombreRol.CLIENTE)) {
                rolesDisponibles.add(NombreRol.CLIENTE);
            }

            return new RoleSelectionResponse(
                    "Por favor seleccione el rol con el que desea ingresar",
                    usuario.getEmail(),
                    rolesDisponibles,
                    true);
        }

        // Si solo tiene rol CLIENTE, login directo
        NombreRol rolActivo = rolesUsuario.stream().findFirst()
                .orElseThrow(() -> new RuntimeException("Usuario sin roles asignados"));

        return generarAuthResponse(usuario, rolActivo);
    }

    /**
     * Paso 2 del login: Usuario selecciona el rol con el que quiere ingresar
     */
    public AuthResponse loginWithRole(RoleSelectionRequest request) {
        try {
            System.out.println("LoginWithRole initiated for: " + request.getEmail());
            System.out.println("Selected Role: " + request.getRolSeleccionado());

            // Buscar usuario por email
            Usuario usuario = usuarioRepository.findByEmailWithRoles(request.getEmail())
                    .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

            // Validar que el usuario esté activo
            if (!usuario.getActivo()) {
                throw new RuntimeException("Usuario inactivo. Contacte al administrador.");
            }

            // Obtener roles del usuario
            Set<NombreRol> rolesUsuario = usuario.getRoles().stream()
                    .map(Rol::getNombre)
                    .collect(Collectors.toSet());

            System.out.println("User roles found: " + rolesUsuario);

            // Validar que el rol seleccionado esté en los roles del usuario
            boolean isAdmin = rolesUsuario.contains(NombreRol.ADMIN);
            boolean isEmpleado = rolesUsuario.contains(NombreRol.EMPLEADO);
            boolean isRequestedRoleAllowed = rolesUsuario.contains(request.getRolSeleccionado());

            // Un ADMIN puede seleccionar cualquier rol
            // Un EMPLEADO puede seleccionar CLIENTE (para comprar como cliente)
            if (request.getRolSeleccionado() == NombreRol.CLIENTE) {
                if (isAdmin || isEmpleado) {
                    isRequestedRoleAllowed = true;
                }
            }

            if (!isRequestedRoleAllowed) {
                System.out.println("Role mismatch! User roles: " + rolesUsuario + " vs Requested: "
                        + request.getRolSeleccionado());
                throw new RuntimeException("No tiene permisos para el rol seleccionado");
            }

            // Actualizar último acceso
            usuarioRepository.findById(usuario.getId()).ifPresent(u -> {
                u.setUltimoAcceso(java.time.LocalDateTime.now());
                usuarioRepository.save(u);
            });

            return generarAuthResponse(usuario, request.getRolSeleccionado());
        } catch (Exception e) {
            System.err.println("Error in loginWithRole: " + e.getMessage());
            e.printStackTrace();
            throw e;
        }
    }

    /**
     * Registrar nuevo usuario (siempre con rol CLIENTE)
     */
    public AuthResponse register(RegisterRequest request) {
        // Validar que el email no exista
        if (usuarioRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("El email ya está registrado");
        }

        // Validar que el DNI no exista
        if (usuarioRepository.existsByDni(request.getDni())) {
            throw new RuntimeException("El DNI ya está registrado");
        }

        // Crear usuario
        Usuario usuario = new Usuario();
        usuario.setNombre(request.getNombre());
        usuario.setApellido(request.getApellido());
        usuario.setDni(request.getDni());
        usuario.setEmail(request.getEmail());
        usuario.setTelefono(request.getTelefono());
        usuario.setPassword(passwordEncoder.encode(request.getPassword()));
        usuario.setActivo(true);
        usuario.setEmailVerificado(false);

        // Asignar rol CLIENTE por defecto
        Rol rolCliente = rolRepository.findByNombre(NombreRol.CLIENTE)
                .orElseThrow(() -> new RuntimeException("Rol CLIENTE no encontrado en el sistema"));

        Set<Rol> roles = new HashSet<>();
        roles.add(rolCliente);
        usuario.setRoles(roles);

        // Guardar usuario
        Usuario usuarioGuardado = usuarioRepository.save(usuario);

        // Crear carrito para el nuevo usuario
        Carrito carrito = new Carrito();
        carrito.setUsuario(usuarioGuardado);
        carritoRepository.save(carrito);

        // Generar token y respuesta
        return generarAuthResponse(usuarioGuardado, NombreRol.CLIENTE);
    }

    /**
     * Método privado para generar la respuesta de autenticación con JWT
     */
    private AuthResponse generarAuthResponse(Usuario usuario, NombreRol rolActivo) {
        // Generar token JWT con el rol activo
        String token = jwtUtils.generateToken(
                usuario.getEmail(),
                usuario.getId(),
                rolActivo);

        // Obtener todos los roles del usuario
        Set<NombreRol> todosLosRoles = usuario.getRoles().stream()
                .map(Rol::getNombre)
                .collect(Collectors.toSet());

        return new AuthResponse(
                token,
                usuario.getId(),
                usuario.getEmail(),
                usuario.getNombre(),
                usuario.getApellido(),
                rolActivo,
                todosLosRoles);
    }

    /**
     * Validar token JWT
     */
    @Transactional(readOnly = true)
    public boolean validateToken(String token) {
        return jwtUtils.validateToken(token);
    }

    /**
     * Obtener email del token
     */
    @Transactional(readOnly = true)
    public String getEmailFromToken(String token) {
        return jwtUtils.getEmailFromToken(token);
    }

    /**
     * Cambiar de rol (para usuarios con múltiples roles)
     */
    public AuthResponse switchRole(String email, NombreRol nuevoRol) {
        Usuario usuario = usuarioRepository.findByEmailWithRoles(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Set<NombreRol> rolesUsuario = usuario.getRoles().stream()
                .map(Rol::getNombre)
                .collect(Collectors.toSet());

        if (!rolesUsuario.contains(nuevoRol)) {
            throw new RuntimeException("No tiene permisos para el rol solicitado");
        }

        return generarAuthResponse(usuario, nuevoRol);
    }
}
