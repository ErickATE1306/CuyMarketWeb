package com.cuymarket.backend.repository.carrito;

import com.cuymarket.backend.model.carrito.Carrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface CarritoRepository extends JpaRepository<Carrito, Long> {
    
    Optional<Carrito> findByUsuarioId(Long usuarioId);
    
    Optional<Carrito> findBySessionId(String sessionId);
    
    @Query("SELECT c FROM Carrito c WHERE c.fechaActualizacion < :fecha")
    List<Carrito> findCarritosInactivos(@Param("fecha") LocalDateTime fecha);
    
    @Query("SELECT DISTINCT c FROM Carrito c LEFT JOIN FETCH c.items i LEFT JOIN FETCH i.producto WHERE c.id = :id")
    Optional<Carrito> findByIdWithItems(@Param("id") Long id);
    
    @Query("SELECT DISTINCT c FROM Carrito c LEFT JOIN FETCH c.items i LEFT JOIN FETCH i.producto WHERE c.usuario.id = :usuarioId")
    Optional<Carrito> findByUsuarioIdWithItems(@Param("usuarioId") Long usuarioId);
    
    boolean existsByUsuarioId(Long usuarioId);
}
