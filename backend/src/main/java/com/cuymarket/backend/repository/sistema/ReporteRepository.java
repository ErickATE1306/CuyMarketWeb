package com.cuymarket.backend.repository.sistema;

import com.cuymarket.backend.model.enums.TipoReporte;
import com.cuymarket.backend.model.sistema.Reporte;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReporteRepository extends JpaRepository<Reporte, Long> {
    
    List<Reporte> findByTipo(TipoReporte tipo);
    
    List<Reporte> findByGeneradoPorIdOrderByFechaGeneracionDesc(Long usuarioId);
    
    List<Reporte> findByFechaGeneracionBetween(LocalDateTime inicio, LocalDateTime fin);
    
    @Query("SELECT r FROM Reporte r LEFT JOIN FETCH r.generadoPor ORDER BY r.fechaGeneracion DESC LIMIT 10")
    List<Reporte> findTop10ByOrderByFechaGeneracionDesc();
    
    @Query("SELECT r FROM Reporte r LEFT JOIN FETCH r.generadoPor")
    List<Reporte> findAllWithUsuario();
}
