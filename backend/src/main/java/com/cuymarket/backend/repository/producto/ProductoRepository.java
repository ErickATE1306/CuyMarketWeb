package com.cuymarket.backend.repository.producto;

import com.cuymarket.backend.model.producto.Producto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface ProductoRepository extends JpaRepository<Producto, Long> {
    
    // Búsquedas básicas
    List<Producto> findByActivo(Boolean activo);
    
    List<Producto> findByCategoriaId(Long categoriaId);
    
    List<Producto> findByNombreContainingIgnoreCase(String nombre);
    
    // Búsquedas por características
    List<Producto> findByRaza(String raza);
    
    List<Producto> findByTipo(String tipo);
    
    List<Producto> findByCertificado(Boolean certificado);
    
    // Búsquedas por precio
    List<Producto> findByPrecioBetween(BigDecimal precioMin, BigDecimal precioMax);
    
    List<Producto> findByPrecioLessThanEqual(BigDecimal precioMax);
    
    List<Producto> findByPrecioGreaterThanEqual(BigDecimal precioMin);
    
    // Búsqueda con stock
    @Query("SELECT p FROM Producto p WHERE p.stockDisponible > 0 AND p.activo = true")
    List<Producto> findProductosDisponibles();
    
    @Query("SELECT p FROM Producto p WHERE p.stockDisponible <= p.stockMinimo")
    List<Producto> findProductosConStockBajo();
    
    // Calcular stock total
    @Query("SELECT COALESCE(SUM(p.stockDisponible), 0) FROM Producto p")
    Long calcularStockTotal();
    
    // Búsqueda avanzada
    @Query("SELECT p FROM Producto p WHERE " +
           "(:categoriaId IS NULL OR p.categoria.id = :categoriaId) AND " +
           "(:precioMin IS NULL OR p.precio >= :precioMin) AND " +
           "(:precioMax IS NULL OR p.precio <= :precioMax) AND " +
           "(:certificado IS NULL OR p.certificado = :certificado) AND " +
           "p.activo = true")
    List<Producto> buscarConFiltros(
        @Param("categoriaId") Long categoriaId,
        @Param("precioMin") BigDecimal precioMin,
        @Param("precioMax") BigDecimal precioMax,
        @Param("certificado") Boolean certificado
    );
    
    // Productos más vendidos
    @Query("SELECT p FROM Producto p " +
           "LEFT JOIN p.itemsPedido ip " +
           "GROUP BY p " +
           "ORDER BY COUNT(ip) DESC")
    List<Producto> findProductosMasVendidos();
    
    // Productos mejor valorados
    @Query("SELECT p FROM Producto p " +
           "LEFT JOIN p.resenas r " +
           "WHERE p.activo = true " +
           "GROUP BY p " +
           "HAVING AVG(r.calificacion) >= :calificacionMin " +
           "ORDER BY AVG(r.calificacion) DESC")
    List<Producto> findProductosMejorValorados(@Param("calificacionMin") Double calificacionMin);
    
    // Estadísticas
    @Query("SELECT COUNT(p) FROM Producto p WHERE p.activo = true")
    Long contarProductosActivos();
    
    // Con relaciones
    @Query("SELECT DISTINCT p FROM Producto p LEFT JOIN FETCH p.resenas WHERE p.id = :id")
    Optional<Producto> findByIdWithResenas(@Param("id") Long id);
}
