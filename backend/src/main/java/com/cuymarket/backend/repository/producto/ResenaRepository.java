package com.cuymarket.backend.repository.producto;

import com.cuymarket.backend.model.producto.Resena;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResenaRepository extends JpaRepository<Resena, Long> {
    
    List<Resena> findByProductoId(Long productoId);
    
    List<Resena> findByUsuarioId(Long usuarioId);
    
    List<Resena> findByProductoIdAndVerificado(Long productoId, Boolean verificado);
    
    List<Resena> findByProductoIdOrderByFechaCreacionDesc(Long productoId);
    
    List<Resena> findByCalificacion(Integer calificacion);
    
    @Query("SELECT AVG(r.calificacion) FROM Resena r WHERE r.producto.id = :productoId")
    Double calcularPromedioCalificacion(@Param("productoId") Long productoId);
    
    @Query("SELECT COUNT(r) FROM Resena r WHERE r.producto.id = :productoId")
    Long contarResenasByProducto(@Param("productoId") Long productoId);
    
    @Query("SELECT COUNT(r) FROM Resena r WHERE r.producto.id = :productoId AND r.calificacion = :calificacion")
    Long contarPorCalificacion(@Param("productoId") Long productoId, @Param("calificacion") Integer calificacion);
    
    @Query("SELECT r FROM Resena r WHERE r.producto.id = :productoId ORDER BY r.util DESC")
    List<Resena> findMasUtilesByProducto(@Param("productoId") Long productoId);
    
    boolean existsByUsuarioIdAndProductoId(Long usuarioId, Long productoId);
}
