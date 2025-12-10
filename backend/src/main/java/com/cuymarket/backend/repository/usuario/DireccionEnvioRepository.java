package com.cuymarket.backend.repository.usuario;

import com.cuymarket.backend.model.usuario.DireccionEnvio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DireccionEnvioRepository extends JpaRepository<DireccionEnvio, Long> {
    
    List<DireccionEnvio> findByUsuarioId(Long usuarioId);
    
    @Query("SELECT d FROM DireccionEnvio d WHERE d.usuario.id = :usuarioId AND d.esPrincipal = true")
    Optional<DireccionEnvio> findDireccionPrincipalByUsuarioId(@Param("usuarioId") Long usuarioId);
    
    List<DireccionEnvio> findByDistrito(String distrito);
    
    @Query("SELECT COUNT(d) FROM DireccionEnvio d WHERE d.usuario.id = :usuarioId")
    Long contarDireccionesByUsuarioId(@Param("usuarioId") Long usuarioId);
}
