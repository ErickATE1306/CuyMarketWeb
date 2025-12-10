package com.cuymarket.backend.repository.pedido;

import com.cuymarket.backend.model.enums.MetodoPago;
import com.cuymarket.backend.model.pedido.InformacionPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface InformacionPagoRepository extends JpaRepository<InformacionPago, Long> {
    
    Optional<InformacionPago> findByPedidoId(Long pedidoId);
    
    List<InformacionPago> findByMetodoPago(MetodoPago metodoPago);
    
    List<InformacionPago> findByFechaPagoBetween(LocalDateTime fechaInicio, LocalDateTime fechaFin);
    
    @Query("SELECT COUNT(ip) FROM InformacionPago ip WHERE ip.metodoPago = :metodoPago")
    Long contarPorMetodoPago(@Param("metodoPago") MetodoPago metodoPago);
    
    @Query("SELECT ip FROM InformacionPago ip WHERE ip.estadoTransaccion = :estado")
    List<InformacionPago> findByEstadoTransaccion(@Param("estado") String estado);
}
