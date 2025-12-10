package com.cuymarket.backend.service.sistema;

import com.cuymarket.backend.model.enums.TipoNotificacion;
import com.cuymarket.backend.model.sistema.Notificacion;
import com.cuymarket.backend.model.usuario.Usuario;
import com.cuymarket.backend.repository.sistema.NotificacionRepository;
import com.cuymarket.backend.repository.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NotificacionService {

    private final NotificacionRepository notificacionRepository;
    private final UsuarioRepository usuarioRepository;

    // Crear notificación
    public Notificacion crear(Long usuarioId, TipoNotificacion tipo, String titulo, String mensaje, String urlAccion) {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Notificacion notificacion = new Notificacion();
        notificacion.setUsuario(usuario);
        notificacion.setTipo(tipo);
        notificacion.setTitulo(titulo);
        notificacion.setMensaje(mensaje);
        notificacion.setUrlAccion(urlAccion);
        notificacion.setLeida(false);

        return notificacionRepository.save(notificacion);
    }

    // Marcar como leída
    public Notificacion marcarComoLeida(Long id) {
        Notificacion notificacion = obtenerPorId(id);
        notificacion.setLeida(true);
        return notificacionRepository.save(notificacion);
    }

    // Marcar todas como leídas
    public void marcarTodasComoLeidas(Long usuarioId) {
        List<Notificacion> notificaciones = listarPorUsuario(usuarioId);
        notificaciones.forEach(n -> n.setLeida(true));
        notificacionRepository.saveAll(notificaciones);
    }

    // Consultas
    @Transactional(readOnly = true)
    public Notificacion obtenerPorId(Long id) {
        return notificacionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notificación no encontrada con ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<Notificacion> listarPorUsuario(Long usuarioId) {
        return notificacionRepository.findByUsuarioId(usuarioId);
    }

    @Transactional(readOnly = true)
    public List<Notificacion> listarNoLeidas(Long usuarioId) {
        return notificacionRepository.findByUsuarioIdAndLeida(usuarioId, false);
    }

    @Transactional(readOnly = true)
    public List<Notificacion> listarPorTipo(Long usuarioId, TipoNotificacion tipo) {
        return notificacionRepository.findByUsuarioId(usuarioId).stream()
                .filter(n -> n.getTipo() == tipo)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Notificacion> listarRecientes(Long usuarioId, int limite) {
        return notificacionRepository.findByUsuarioId(usuarioId).stream()
                .sorted((n1, n2) -> n2.getFechaCreacion().compareTo(n1.getFechaCreacion()))
                .limit(limite)
                .toList();
    }

    @Transactional(readOnly = true)
    public Long contarNoLeidas(Long usuarioId) {
        return (long) notificacionRepository.findByUsuarioIdAndLeida(usuarioId, false).size();
    }

    // Eliminar
    public void eliminar(Long id) {
        Notificacion notificacion = obtenerPorId(id);
        notificacionRepository.delete(notificacion);
    }

    public void eliminarTodas(Long usuarioId) {
        List<Notificacion> notificaciones = listarPorUsuario(usuarioId);
        notificacionRepository.deleteAll(notificaciones);
    }

    // Métodos de utilidad para crear notificaciones específicas
    public Notificacion notificarPedido(Long usuarioId, String numeroPedido, String mensaje) {
        return crear(usuarioId, TipoNotificacion.PEDIDO,
                "Pedido " + numeroPedido, mensaje, "/pedidos/" + numeroPedido);
    }

    public Notificacion notificarPromocion(Long usuarioId, String titulo, String mensaje) {
        return crear(usuarioId, TipoNotificacion.PROMOCION, titulo, mensaje, "/promociones");
    }
}
