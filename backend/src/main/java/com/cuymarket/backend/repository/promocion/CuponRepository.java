package com.cuymarket.backend.repository.promocion;

import com.cuymarket.backend.model.enums.TipoCupon;
import com.cuymarket.backend.model.promocion.Cupon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface CuponRepository extends JpaRepository<Cupon, Long> {
    
    Optional<Cupon> findByCodigo(String codigo);
    
    List<Cupon> findByActivo(Boolean activo);
    
    List<Cupon> findByTipoCupon(TipoCupon tipoCupon);
    
    @Query("SELECT c FROM Cupon c WHERE c.activo = true AND :fecha BETWEEN c.fechaInicio AND c.fechaVencimiento")
    List<Cupon> findCuponesVigentes(@Param("fecha") LocalDate fecha);
    
    @Query("SELECT c FROM Cupon c WHERE c.codigo = :codigo AND c.activo = true AND :fecha BETWEEN c.fechaInicio AND c.fechaVencimiento")
    Optional<Cupon> findCuponVigenteByCodig(@Param("codigo") String codigo, @Param("fecha") LocalDate fecha);
    
    @Query("SELECT c FROM Cupon c WHERE c.activo = true AND c.usosActuales < c.usosMaximos AND :fecha BETWEEN c.fechaInicio AND c.fechaVencimiento")
    List<Cupon> findCuponesDisponibles(@Param("fecha") LocalDate fecha);
    
    @Query("SELECT c FROM Cupon c WHERE c.fechaVencimiento < :fecha")
    List<Cupon> findCuponesVencidos(@Param("fecha") LocalDate fecha);
    
    @Query("SELECT c FROM Cupon c WHERE c.usosActuales >= c.usosMaximos")
    List<Cupon> findCuponesAgotados();
    
    boolean existsByCodigo(String codigo);
    
    @Query("SELECT COUNT(c) FROM Cupon c WHERE c.activo = true AND :fecha BETWEEN c.fechaInicio AND c.fechaVencimiento")
    Long contarCuponesVigentes(@Param("fecha") LocalDate fecha);
}
