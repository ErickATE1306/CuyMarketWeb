package com.cuymarket.backend.repository.pedido;

import com.cuymarket.backend.model.pedido.ItemPedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ItemPedidoRepository extends JpaRepository<ItemPedido, Long> {
    
    List<ItemPedido> findByPedidoId(Long pedidoId);
    
    List<ItemPedido> findByProductoId(Long productoId);
    
    @Query("SELECT COUNT(ip) FROM ItemPedido ip WHERE ip.producto.id = :productoId")
    Long contarVentasByProducto(@Param("productoId") Long productoId);
    
    @Query("SELECT SUM(ip.cantidad) FROM ItemPedido ip WHERE ip.producto.id = :productoId")
    Long sumarCantidadVendidaByProducto(@Param("productoId") Long productoId);
    
    @Query("SELECT ip FROM ItemPedido ip WHERE ip.pedido.id = :pedidoId ORDER BY ip.id")
    List<ItemPedido> findByPedidoIdOrdenado(@Param("pedidoId") Long pedidoId);
}
