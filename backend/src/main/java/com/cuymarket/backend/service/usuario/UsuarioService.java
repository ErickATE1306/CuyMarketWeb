package com.cuymarket.backend.service.usuario;

import com.cuymarket.backend.model.enums.NombreRol;
import com.cuymarket.backend.model.usuario.Rol;
import com.cuymarket.backend.model.usuario.Usuario;
import com.cuymarket.backend.repository.usuario.RolRepository;
import com.cuymarket.backend.repository.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    // Crear usuario
    public Usuario crear(Usuario usuario, Set<NombreRol> rolesNombres) {
        validarDatosUnicos(usuario.getEmail(), usuario.getDni(), null);

        // Encriptar contraseña
        usuario.setPassword(passwordEncoder.encode(usuario.getPassword()));

        // Asignar roles
        if (rolesNombres == null || rolesNombres.isEmpty()) {
            // Por defecto, rol CLIENTE
            Rol rolCliente = rolRepository.findByNombre(NombreRol.CLIENTE)
                    .orElseThrow(() -> new RuntimeException("Rol CLIENTE no encontrado"));
            usuario.getRoles().add(rolCliente);
        } else {
            for (NombreRol nombreRol : rolesNombres) {
                Rol rol = rolRepository.findByNombre(nombreRol)
                        .orElseThrow(() -> new RuntimeException("Rol " + nombreRol + " no encontrado"));
                usuario.getRoles().add(rol);
            }
        }

        return usuarioRepository.save(usuario);
    }

    // Actualizar usuario
    public Usuario actualizar(Long id, Usuario usuarioActualizado) {
        Usuario usuario = obtenerPorId(id);

        // Validar email y DNI únicos (excluyendo el usuario actual)
        if ((usuarioActualizado.getEmail() != null && !usuario.getEmail().equals(usuarioActualizado.getEmail())) ||
                (usuarioActualizado.getDni() != null && !usuario.getDni().equals(usuarioActualizado.getDni()))) {
            validarDatosUnicos(usuarioActualizado.getEmail(), usuarioActualizado.getDni(), id);
        }

        if (usuarioActualizado.getNombre() != null)
            usuario.setNombre(usuarioActualizado.getNombre());
        if (usuarioActualizado.getApellido() != null)
            usuario.setApellido(usuarioActualizado.getApellido());
        if (usuarioActualizado.getDni() != null)
            usuario.setDni(usuarioActualizado.getDni());
        if (usuarioActualizado.getTelefono() != null)
            usuario.setTelefono(usuarioActualizado.getTelefono());
        if (usuarioActualizado.getEmail() != null)
            usuario.setEmail(usuarioActualizado.getEmail());

        return usuarioRepository.save(usuario);
    }

    // Cambiar contraseña
    public void cambiarPassword(Long id, String passwordActual, String passwordNueva) {
        Usuario usuario = obtenerPorId(id);

        if (!passwordEncoder.matches(passwordActual, usuario.getPassword())) {
            throw new RuntimeException("La contraseña actual es incorrecta");
        }

        usuario.setPassword(passwordEncoder.encode(passwordNueva));
        usuarioRepository.save(usuario);
    }

    // Activar/Desactivar usuario
    public Usuario cambiarEstado(Long id, Boolean activo) {
        Usuario usuario = obtenerPorId(id);
        usuario.setActivo(activo);
        return usuarioRepository.save(usuario);
    }

    // Verificar email
    public Usuario verificarEmail(Long id) {
        Usuario usuario = obtenerPorId(id);
        usuario.setEmailVerificado(true);
        return usuarioRepository.save(usuario);
    }

    // Actualizar último acceso
    public void actualizarUltimoAcceso(Long id) {
        Usuario usuario = obtenerPorId(id);
        usuario.setUltimoAcceso(LocalDateTime.now());
        usuarioRepository.save(usuario);
    }

    // Asignar rol
    public Usuario asignarRol(Long usuarioId, NombreRol nombreRol) {
        Usuario usuario = obtenerPorIdConRoles(usuarioId);
        Rol rol = rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        usuario.getRoles().add(rol);
        return usuarioRepository.save(usuario);
    }

    // Remover rol
    public Usuario removerRol(Long usuarioId, NombreRol nombreRol) {
        Usuario usuario = obtenerPorIdConRoles(usuarioId);

        if (usuario.getRoles().size() == 1) {
            throw new RuntimeException("El usuario debe tener al menos un rol");
        }

        Rol rol = rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        usuario.getRoles().remove(rol);
        return usuarioRepository.save(usuario);
    }

    // Actualizar rol (reemplazar)
    public Usuario actualizarRol(Long usuarioId, NombreRol nombreRol) {
        Usuario usuario = obtenerPorIdConRoles(usuarioId);
        Rol rol = rolRepository.findByNombre(nombreRol)
                .orElseThrow(() -> new RuntimeException("Rol no encontrado"));

        usuario.getRoles().clear();
        usuario.getRoles().add(rol);
        return usuarioRepository.save(usuario);
    }

    // Consultas
    @Transactional(readOnly = true)
    public Usuario obtenerPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con ID: " + id));
    }

    @Transactional(readOnly = true)
    public Usuario obtenerPorEmail(String email) {
        return usuarioRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con email: " + email));
    }

    @Transactional(readOnly = true)
    public Usuario obtenerPorIdConRoles(Long id) {
        return usuarioRepository.findByEmailWithRoles(
                obtenerPorId(id).getEmail()).orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Transactional(readOnly = true)
    public Usuario obtenerPorIdConPedidos(Long id) {
        return usuarioRepository.findByIdWithPedidos(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarTodos() {
        return usuarioRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarActivos() {
        return usuarioRepository.findByActivo(true);
    }

    @Transactional(readOnly = true)
    public List<Usuario> buscarPorNombre(String nombre) {
        return usuarioRepository.buscarPorNombre(nombre);
    }

    @Transactional(readOnly = true)
    public List<Usuario> listarPorRol(NombreRol nombreRol) {
        return usuarioRepository.findByRolNombre(nombreRol);
    }

    @Transactional(readOnly = true)
    public Long contarActivos() {
        return usuarioRepository.contarUsuariosActivos();
    }

    @Transactional(readOnly = true)
    public Long contarRegistradosDespues(LocalDateTime fecha) {
        return usuarioRepository.contarUsuariosRegistradosDespues(fecha);
    }

    // Eliminar
    public void eliminar(Long id) {
        Usuario usuario = obtenerPorId(id);
        usuarioRepository.delete(usuario);
    }

    // Validaciones privadas
    private void validarDatosUnicos(String email, String dni, Long usuarioIdExcluir) {
        if (usuarioRepository.existsByEmail(email)) {
            if (usuarioIdExcluir == null
                    || !usuarioRepository.findByEmail(email).get().getId().equals(usuarioIdExcluir)) {
                throw new RuntimeException("El email ya está registrado");
            }
        }

        if (usuarioRepository.existsByDni(dni)) {
            if (usuarioIdExcluir == null || !usuarioRepository.findByDni(dni).get().getId().equals(usuarioIdExcluir)) {
                throw new RuntimeException("El DNI ya está registrado");
            }
        }
    }
}
