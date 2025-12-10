package com.cuymarket.backend.service.producto;

import com.cuymarket.backend.model.producto.Categoria;
import com.cuymarket.backend.model.producto.Producto;
import com.cuymarket.backend.repository.producto.CategoriaRepository;
import com.cuymarket.backend.repository.producto.ProductoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductoService {

    private final ProductoRepository productoRepository;
    private final CategoriaRepository categoriaRepository;

    // Crear producto
    public Producto crear(Producto producto, Long categoriaId) {
        Categoria categoria = categoriaRepository.findById(categoriaId)
                .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));

        producto.setCategoria(categoria);
        producto.setActivo(true);

        return productoRepository.save(producto);
    }

    // Actualizar producto
    public Producto actualizar(Long id, Producto productoActualizado, Long categoriaId) {
        Producto producto = obtenerPorId(id);

        if (categoriaId != null) {
            Categoria categoria = categoriaRepository.findById(categoriaId)
                    .orElseThrow(() -> new RuntimeException("Categoría no encontrada"));
            producto.setCategoria(categoria);
        }

        producto.setNombre(productoActualizado.getNombre());
        producto.setDescripcion(productoActualizado.getDescripcion());
        producto.setPrecio(productoActualizado.getPrecio());
        producto.setRaza(productoActualizado.getRaza());
        producto.setPeso(productoActualizado.getPeso());
        producto.setTipo(productoActualizado.getTipo());
        producto.setCertificado(productoActualizado.getCertificado());
        producto.setCaracteristicas(productoActualizado.getCaracteristicas());
        producto.setImagen(productoActualizado.getImagen());
        producto.setActivo(productoActualizado.getActivo());
        producto.setStockDisponible(productoActualizado.getStockDisponible());
        producto.setStockMinimo(productoActualizado.getStockMinimo());

        return productoRepository.save(producto);
    }

    // Cambiar estado activo/inactivo
    public Producto cambiarEstado(Long id, Boolean activo) {
        Producto producto = obtenerPorId(id);
        producto.setActivo(activo);
        return productoRepository.save(producto);
    }

    // Actualizar precio
    public Producto actualizarPrecio(Long id, BigDecimal precio) {
        Producto producto = obtenerPorId(id);

        if (precio.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("El precio debe ser mayor a 0");
        }

        producto.setPrecio(precio);
        return productoRepository.save(producto);
    }

    // Consultas
    @Transactional(readOnly = true)
    public Producto obtenerPorId(Long id) {
        return productoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado con ID: " + id));
    }

    @Transactional(readOnly = true)
    public Producto obtenerPorIdConResenas(Long id) {
        return productoRepository.findByIdWithResenas(id)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));
    }

    @Transactional(readOnly = true)
    public List<Producto> listarTodos() {
        return productoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Page<Producto> listarTodosPaginado(Pageable pageable) {
        return productoRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public List<Producto> listarActivos() {
        return productoRepository.findByActivo(true);
    }

    @Transactional(readOnly = true)
    public List<Producto> listarPorCategoria(Long categoriaId) {
        return productoRepository.findByCategoriaId(categoriaId);
    }

    @Transactional(readOnly = true)
    public List<Producto> buscarPorNombre(String nombre) {
        return productoRepository.findByNombreContainingIgnoreCase(nombre);
    }

    @Transactional(readOnly = true)
    public List<Producto> buscarConFiltros(Long categoriaId,
            BigDecimal precioMin, BigDecimal precioMax, Boolean certificado) {
        return productoRepository.buscarConFiltros(categoriaId, precioMin, precioMax, certificado);
    }

    @Transactional(readOnly = true)
    public List<Producto> listarMasVendidos() {
        return productoRepository.findProductosMasVendidos();
    }

    @Transactional(readOnly = true)
    public List<Producto> listarMejorValorados(Double calificacionMin) {
        return productoRepository.findProductosMejorValorados(calificacionMin);
    }

    @Transactional(readOnly = true)
    public Long contarActivos() {
        return productoRepository.contarProductosActivos();
    }

    @Transactional(readOnly = true)
    public Long contarPorCategoria(Long categoriaId) {
        return (long) productoRepository.findByCategoriaId(categoriaId).size();
    }

    @Transactional(readOnly = true)
    public BigDecimal obtenerPrecioFinal(Long id) {
        Producto producto = obtenerPorId(id);
        return producto.getPrecio();
    }

    // Métodos de gestión de stock
    public Producto incrementarStock(Long id, Integer cantidad, String motivo) {
        if (cantidad <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a 0");
        }

        Producto producto = obtenerPorId(id);
        Integer stockAnterior = producto.getStockDisponible();
        producto.setStockDisponible(stockAnterior + cantidad);

        // TODO: Registrar movimiento en MovimientoInventario si se requiere auditoría

        return productoRepository.save(producto);
    }

    public Producto descontarStock(Long id, Integer cantidad, String motivo) {
        if (cantidad <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a 0");
        }

        Producto producto = obtenerPorId(id);

        if (producto.getStockDisponible() < cantidad) {
            throw new RuntimeException("Stock insuficiente. Disponible: " + producto.getStockDisponible());
        }

        Integer stockAnterior = producto.getStockDisponible();
        producto.setStockDisponible(stockAnterior - cantidad);

        // TODO: Registrar movimiento en MovimientoInventario si se requiere auditoría

        return productoRepository.save(producto);
    }

    public Producto actualizarStock(Long id, Integer nuevoStock) {
        if (nuevoStock < 0) {
            throw new RuntimeException("El stock no puede ser negativo");
        }

        Producto producto = obtenerPorId(id);
        producto.setStockDisponible(nuevoStock);

        return productoRepository.save(producto);
    }

    @Transactional(readOnly = true)
    public boolean tieneStockDisponible(Long id, Integer cantidad) {
        Producto producto = obtenerPorId(id);
        return producto.getStockDisponible() >= cantidad;
    }

    // Eliminar
    public void eliminar(Long id) {
        Producto producto = obtenerPorId(id);
        productoRepository.delete(producto);
    }
}
