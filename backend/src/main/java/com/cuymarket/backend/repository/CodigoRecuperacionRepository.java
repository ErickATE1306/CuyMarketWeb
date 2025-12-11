package com.cuymarket.backend.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.cuymarket.backend.model.usuario.CodigoRecuperacion;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface CodigoRecuperacionRepository extends JpaRepository<CodigoRecuperacion, Long> {
    Optional<CodigoRecuperacion> findByEmailAndCodigoAndUsadoFalseAndFechaExpiracionAfter(
            String email, String codigo, LocalDateTime fechaActual);
    
    void deleteByEmailAndUsadoFalse(String email);
}
