package com.cuymarket.backend.repository.carrito;

import com.cuymarket.backend.model.carrito.ItemCarrito;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemCarritoRepository extends JpaRepository<ItemCarrito, Long> {
    
    List<ItemCarrito> findByCarritoId(Long carritoId);
    
    Optional<ItemCarrito> findByCarritoIdAndProductoId(Long carritoId, Long productoId);
    
    void deleteByCarritoId(Long carritoId);
    
    void deleteByCarritoIdAndProductoId(Long carritoId, Long productoId);
    
    @Query("SELECT COUNT(ic) FROM ItemCarrito ic WHERE ic.carrito.id = :carritoId")
    Long contarItemsByCarrito(@Param("carritoId") Long carritoId);
    
    @Query("SELECT SUM(ic.cantidad) FROM ItemCarrito ic WHERE ic.carrito.id = :carritoId")
    Long sumarCantidadTotalByCarrito(@Param("carritoId") Long carritoId);
    
    @Query("SELECT ic FROM ItemCarrito ic WHERE ic.carrito.id = :carritoId ORDER BY ic.fechaAgregado DESC")
    List<ItemCarrito> findByCarritoIdOrderByFechaDesc(@Param("carritoId") Long carritoId);
    
    boolean existsByCarritoIdAndProductoId(Long carritoId, Long productoId);
}
