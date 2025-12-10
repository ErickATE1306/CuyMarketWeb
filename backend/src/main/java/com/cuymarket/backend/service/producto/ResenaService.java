package com.cuymarket.backend.service.producto;

import com.cuymarket.backend.model.producto.Producto;
import com.cuymarket.backend.model.producto.Resena;
import com.cuymarket.backend.model.usuario.Usuario;
import com.cuymarket.backend.repository.producto.ProductoRepository;
import com.cuymarket.backend.repository.producto.ResenaRepository;
import com.cuymarket.backend.repository.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ResenaService {

    private final ResenaRepository resenaRepository;
    private final ProductoRepository productoRepository;
    private final UsuarioRepository usuarioRepository;

    // Crear reseña
    public Resena crear(Long productoId, Long usuarioId, Integer calificacion, String comentario) {
        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        // Verificar si ya existe reseña
        boolean yaReseno = resenaRepository.findByProductoId(productoId).stream()
                .anyMatch(r -> r.getUsuario().getId().equals(usuarioId));
        if (yaReseno) {
            throw new RuntimeException("El usuario ya ha reseñado este producto");
        }

        if (calificacion < 1 || calificacion > 5) {
            throw new RuntimeException("La calificación debe estar entre 1 y 5");
        }

        Resena resena = new Resena();
        resena.setProducto(producto);
        resena.setUsuario(usuario);
        resena.setCalificacion(calificacion);
        resena.setComentario(comentario);
        resena.setVerificado(false);

        return resenaRepository.save(resena);
    }

    // Actualizar reseña
    public Resena actualizar(Long id, Integer calificacion, String comentario) {
        Resena resena = obtenerPorId(id);

        if (calificacion != null) {
            if (calificacion < 1 || calificacion > 5) {
                throw new RuntimeException("La calificación debe estar entre 1 y 5");
            }
            resena.setCalificacion(calificacion);
        }

        if (comentario != null) {
            resena.setComentario(comentario);
        }

        return resenaRepository.save(resena);
    }

    // Verificar reseña
    public Resena verificar(Long id) {
        Resena resena = obtenerPorId(id);
        resena.setVerificado(true);
        return resenaRepository.save(resena);
    }

    // Consultas
    @Transactional(readOnly = true)
    public Resena obtenerPorId(Long id) {
        return resenaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reseña no encontrada con ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<Resena> listarPorProducto(Long productoId) {
        return resenaRepository.findByProductoId(productoId);
    }

    @Transactional(readOnly = true)
    public List<Resena> listarVerificadas(Long productoId) {
        return resenaRepository.findByProductoId(productoId).stream()
                .filter(Resena::getVerificado)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Resena> listarPorUsuario(Long usuarioId) {
        return resenaRepository.findByUsuarioId(usuarioId);
    }

    @Transactional(readOnly = true)
    public List<Resena> listarNoVerificadas() {
        return resenaRepository.findAll().stream()
                .filter(r -> !r.getVerificado())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<Resena> listarPorCalificacion(Long productoId, Integer calificacion) {
        return resenaRepository.findByProductoId(productoId).stream()
                .filter(r -> r.getCalificacion().equals(calificacion))
                .toList();
    }

    @Transactional(readOnly = true)
    public Double calcularPromedioCalificacion(Long productoId) {
        List<Resena> resenas = listarVerificadas(productoId);
        if (resenas.isEmpty())
            return 0.0;

        return resenas.stream()
                .mapToInt(Resena::getCalificacion)
                .average()
                .orElse(0.0);
    }

    @Transactional(readOnly = true)
    public Long contarPorProducto(Long productoId) {
        return (long) resenaRepository.findByProductoId(productoId).size();
    }

    @Transactional(readOnly = true)
    public boolean yaReseno(Long productoId, Long usuarioId) {
        return resenaRepository.findByProductoId(productoId).stream()
                .anyMatch(r -> r.getUsuario().getId().equals(usuarioId));
    }

    // Eliminar
    public void eliminar(Long id) {
        Resena resena = obtenerPorId(id);
        resenaRepository.delete(resena);
    }

    public void eliminarPorProducto(Long productoId) {
        List<Resena> resenas = resenaRepository.findByProductoId(productoId);
        resenaRepository.deleteAll(resenas);
    }
}
