package com.cuymarket.backend.service.producto;

import com.cuymarket.backend.model.producto.Categoria;
import com.cuymarket.backend.model.producto.Producto;
import com.cuymarket.backend.repository.producto.CategoriaRepository;
import com.cuymarket.backend.repository.producto.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;

    // Crear categoría
    public Categoria crear(Categoria categoria) {
        categoria.setActiva(true);
        return categoriaRepository.save(categoria);
    }

    // Actualizar categoría
    public Categoria actualizar(Long id, Categoria categoriaActualizada) {
        Categoria categoria = obtenerPorId(id);

        categoria.setNombre(categoriaActualizada.getNombre());
        categoria.setDescripcion(categoriaActualizada.getDescripcion());
        categoria.setActiva(categoriaActualizada.getActiva());

        return categoriaRepository.save(categoria);
    }

    // Cambiar estado
    public Categoria cambiarEstado(Long id, Boolean activa) {
        Categoria categoria = obtenerPorId(id);
        categoria.setActiva(activa);
        return categoriaRepository.save(categoria);
    }

    // Consultas
    @Transactional(readOnly = true)
    public Categoria obtenerPorId(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada con ID: " + id));
    }

    @Transactional(readOnly = true)
    public List<Categoria> listarTodas() {
        return categoriaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Categoria> listarActivas() {
        return categoriaRepository.findByActiva(true);
    }

    @Transactional(readOnly = true)
    public List<Categoria> buscarPorNombre(String nombre) {
        return categoriaRepository.findAll().stream()
                .filter(c -> c.getNombre().toLowerCase().contains(nombre.toLowerCase()))
                .toList();
    }

    @Transactional(readOnly = true)
    public Long contarProductos(Long categoriaId) {
        return (long) productoRepository.findByCategoriaId(categoriaId).size();
    }

    @Transactional(readOnly = true)
    public Long contarActivas() {
        return (long) categoriaRepository.findByActiva(true).size();
    }

    @Transactional(readOnly = true)
    public boolean existeNombre(String nombre) {
        return categoriaRepository.findAll().stream()
                .anyMatch(c -> c.getNombre().equalsIgnoreCase(nombre));
    }

    // Eliminar
    public void eliminar(Long id) {
        Categoria categoria = obtenerPorId(id);

        // Verificar si tiene productos
        List<Producto> productos = productoRepository.findByCategoriaId(id);
        if (!productos.isEmpty()) {
            throw new RuntimeException("No se puede eliminar la categoría porque tiene productos asociados");
        }

        categoriaRepository.delete(categoria);
    }
}
