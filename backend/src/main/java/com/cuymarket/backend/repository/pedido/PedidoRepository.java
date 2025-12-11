package com.cuymarket.backend.repository.pedido;

import com.cuymarket.backend.dto.dashboard.ProductoTopDTO;
import com.cuymarket.backend.model.enums.EstadoPedido;
import com.cuymarket.backend.model.enums.EstadoPago;
import com.cuymarket.backend.model.pedido.Pedido;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PedidoRepository extends JpaRepository<Pedido, Long> {

    Optional<Pedido> findByNumeroPedido(String numeroPedido);

    List<Pedido> findByUsuarioId(Long usuarioId);

    List<Pedido> findByUsuarioIdOrderByFechaPedidoDesc(Long usuarioId);

    List<Pedido> findByEstado(EstadoPedido estado);

    List<Pedido> findByEstadoPago(EstadoPago estadoPago);

    @Query("SELECT p FROM Pedido p WHERE p.usuario.id = :usuarioId AND p.estado = :estado")
    List<Pedido> findByUsuarioAndEstado(@Param("usuarioId") Long usuarioId, @Param("estado") EstadoPedido estado);

    @Query("SELECT p FROM Pedido p WHERE p.fechaPedido BETWEEN :fechaInicio AND :fechaFin")
    List<Pedido> findByFechaPedidoBetween(@Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin);

    @Query("SELECT p FROM Pedido p WHERE p.total >= :montoMin ORDER BY p.total DESC")
    List<Pedido> findPedidosMayoresA(@Param("montoMin") BigDecimal montoMin);

    // Estadísticas
    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.estado = :estado")
    Long contarPorEstado(@Param("estado") EstadoPedido estado);

    @Query("SELECT SUM(p.total) FROM Pedido p WHERE p.estadoPago = 'PAGADO' AND p.fechaPedido BETWEEN :fechaInicio AND :fechaFin")
    BigDecimal calcularVentasTotales(@Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin);

    @Query("SELECT COUNT(p) FROM Pedido p WHERE p.usuario.id = :usuarioId")
    Long contarPedidosByUsuario(@Param("usuarioId") Long usuarioId);

    // Consultas con JOIN FETCH para cargar relaciones
    @Query("SELECT DISTINCT p FROM Pedido p " +
           "LEFT JOIN FETCH p.items i " +
           "LEFT JOIN FETCH i.producto " +
           "LEFT JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.direccionEnvio " +
           "ORDER BY p.fechaPedido DESC")
    List<Pedido> findAllWithDetails();

    @Query("SELECT DISTINCT p FROM Pedido p " +
           "LEFT JOIN FETCH p.items i " +
           "LEFT JOIN FETCH i.producto " +
           "LEFT JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.direccionEnvio " +
           "WHERE p.usuario.id = :usuarioId " +
           "ORDER BY p.fechaPedido DESC")
    List<Pedido> findByUsuarioIdWithDetails(@Param("usuarioId") Long usuarioId);

    @Query("SELECT DISTINCT p FROM Pedido p " +
           "LEFT JOIN FETCH p.items i " +
           "LEFT JOIN FETCH i.producto " +
           "LEFT JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.direccionEnvio " +
           "WHERE p.estado = :estado " +
           "ORDER BY p.fechaPedido DESC")
    List<Pedido> findByEstadoWithDetails(@Param("estado") EstadoPedido estado);

    // Con relaciones
    @Query("SELECT DISTINCT p FROM Pedido p " +
           "LEFT JOIN FETCH p.items i " +
           "LEFT JOIN FETCH i.producto " +
           "WHERE p.id = :id")
    Optional<Pedido> findByIdWithItems(@Param("id") Long id);

    @Query("SELECT DISTINCT p FROM Pedido p " +
           "LEFT JOIN FETCH p.items i " +
           "LEFT JOIN FETCH i.producto " +
           "LEFT JOIN FETCH p.usuario " +
           "LEFT JOIN FETCH p.direccionEnvio " +
           "WHERE p.id = :id")
    Optional<Pedido> findByIdCompleto(@Param("id") Long id);

    @Query("SELECT p FROM Pedido p WHERE p.estado IN ('PENDIENTE', 'EN_PROCESO') ORDER BY p.fechaPedido ASC")
    List<Pedido> findPedidosPendientes();

    // Dashboard Queries
    Long countByEstadoIn(List<EstadoPedido> estados);

    @Query("SELECT new com.cuymarket.backend.dto.dashboard.ProductoTopDTO(i.producto.nombre, SUM(i.cantidad)) " +
            "FROM ItemPedido i " +
            "GROUP BY i.producto.id, i.producto.nombre " +
            "ORDER BY SUM(i.cantidad) DESC")
    List<ProductoTopDTO> findTopSellingProducts(
            org.springframework.data.domain.Pageable pageable);

    @Query("SELECT p FROM Pedido p WHERE p.estadoPago = :estadoPago AND p.fechaPedido >= :fecha")
    List<Pedido> findByEstadoPagoAndFechaPedidoAfter(@Param("estadoPago") EstadoPago estadoPago,
            @Param("fecha") LocalDateTime fecha);

    @Query("SELECT p FROM Pedido p WHERE p.estado = :estado AND p.fechaPedido BETWEEN :fechaInicio AND :fechaFin ORDER BY p.fechaPedido DESC")
    List<Pedido> findByEstadoAndFechaPedidoBetween(@Param("estado") EstadoPedido estado,
            @Param("fechaInicio") LocalDateTime fechaInicio,
            @Param("fechaFin") LocalDateTime fechaFin);

    List<Pedido> findTop5ByOrderByFechaPedidoDesc();
}
