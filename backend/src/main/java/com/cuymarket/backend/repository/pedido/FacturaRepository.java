package com.cuymarket.backend.repository.pedido;

import com.cuymarket.backend.model.pedido.Factura;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FacturaRepository extends JpaRepository<Factura, Long> {
    
    Optional<Factura> findByNumeroFactura(String numeroFactura);
    
    Optional<Factura> findByPedidoId(Long pedidoId);
    
    List<Factura> findByRucCliente(String rucCliente);
    
    List<Factura> findByFechaEmisionBetween(LocalDate fechaInicio, LocalDate fechaFin);
    
    List<Factura> findByFechaEmision(LocalDate fechaEmision);
    
    @Query("SELECT f FROM Factura f WHERE f.fechaEmision >= :fecha ORDER BY f.fechaEmision DESC")
    List<Factura> findFacturasRecientes(@Param("fecha") LocalDate fecha);
    
    @Query("SELECT COUNT(f) FROM Factura f WHERE f.fechaEmision BETWEEN :fechaInicio AND :fechaFin")
    Long contarFacturasPorPeriodo(@Param("fechaInicio") LocalDate fechaInicio, @Param("fechaFin") LocalDate fechaFin);
    
    boolean existsByNumeroFactura(String numeroFactura);
}
