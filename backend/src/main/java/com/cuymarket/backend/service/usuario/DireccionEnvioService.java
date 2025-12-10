package com.cuymarket.backend.service.usuario;

import com.cuymarket.backend.model.usuario.DireccionEnvio;
import com.cuymarket.backend.model.usuario.Usuario;
import com.cuymarket.backend.repository.usuario.DireccionEnvioRepository;
import com.cuymarket.backend.repository.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DireccionEnvioService {

    private final DireccionEnvioRepository direccionRepository;
    private final UsuarioRepository usuarioRepository;

    // Crear dirección
    public DireccionEnvio crear(Long usuarioId, DireccionEnvio direccion) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        direccion.setUsuario(usuario);

        // Si es la primera dirección o se marca como principal, establecerla como
        // principal
        List<DireccionEnvio> direccionesExistentes = direccionRepository.findByUsuarioId(usuarioId);
        if (direccionesExistentes.isEmpty() || direccion.getEsPrincipal()) {
            // Si hay direcciones y se marca como principal, quitar principal a las demás
            if (direccion.getEsPrincipal()) {
                quitarPrincipalATodas(usuarioId);
            }
            direccion.setEsPrincipal(true);
        } else {
            direccion.setEsPrincipal(false);
        }

        return direccionRepository.save(direccion);
    }

    // Actualizar dirección
    public DireccionEnvio actualizar(Long id, DireccionEnvio direccionActualizada) {
        DireccionEnvio direccion = obtenerPorId(id);

        direccion.setNombre(direccionActualizada.getNombre());
        direccion.setApellido(direccionActualizada.getApellido());
        direccion.setDireccion(direccionActualizada.getDireccion());
        direccion.setDistrito(direccionActualizada.getDistrito());
        direccion.setCiudad(direccionActualizada.getCiudad());
        direccion.setReferencia(direccionActualizada.getReferencia());
        direccion.setTelefono(direccionActualizada.getTelefono());
        direccion.setCodigoPostal(direccionActualizada.getCodigoPostal());

        // Si se marca como principal
        if (direccionActualizada.getEsPrincipal() && !direccion.getEsPrincipal()) {
            establecerComoPrincipal(id);
        }

        return direccionRepository.save(direccion);
    }

    // Establecer como dirección principal
    public DireccionEnvio establecerComoPrincipal(Long id) {
        DireccionEnvio direccion = obtenerPorId(id);

        // Quitar principal a todas las direcciones del usuario
        quitarPrincipalATodas(direccion.getUsuario().getId());

        // Establecer esta como principal
        direccion.setEsPrincipal(true);
        return direccionRepository.save(direccion);
    }

    // Consultas
    @Transactional(readOnly = true)
    public DireccionEnvio obtenerPorId(Long id) {
        return direccionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Dirección no encontrada con ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<DireccionEnvio> listarPorUsuario(Long usuarioId) {
        return direccionRepository.findByUsuarioId(usuarioId);
    }

    @Transactional(readOnly = true)
    public DireccionEnvio obtenerPrincipalDeUsuario(Long usuarioId) {
        return direccionRepository.findByUsuarioId(usuarioId).stream()
                .filter(DireccionEnvio::getEsPrincipal)
                .findFirst()
                .orElseThrow(() -> new RuntimeException("El usuario no tiene dirección principal"));
    }

    @Transactional(readOnly = true)
    public Long contarPorUsuario(Long usuarioId) {
        return (long) direccionRepository.findByUsuarioId(usuarioId).size();
    }

    // Eliminar
    public void eliminar(Long id) {
        DireccionEnvio direccion = obtenerPorId(id);
        Long usuarioId = direccion.getUsuario().getId();
        boolean eraPrincipal = direccion.getEsPrincipal();

        direccionRepository.delete(direccion);

        // Si era principal, establecer otra como principal
        if (eraPrincipal) {
            List<DireccionEnvio> direccionesRestantes = direccionRepository.findByUsuarioId(usuarioId);
            if (!direccionesRestantes.isEmpty()) {
                DireccionEnvio nuevaPrincipal = direccionesRestantes.get(0);
                nuevaPrincipal.setEsPrincipal(true);
                direccionRepository.save(nuevaPrincipal);
            }
        }
    }

    // Método privado para quitar principal a todas las direcciones
    private void quitarPrincipalATodas(Long usuarioId) {
        List<DireccionEnvio> direcciones = direccionRepository.findByUsuarioId(usuarioId);
        for (DireccionEnvio dir : direcciones) {
            if (dir.getEsPrincipal()) {
                dir.setEsPrincipal(false);
                direccionRepository.save(dir);
            }
        }
    }
}
