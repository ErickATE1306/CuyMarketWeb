package com.cuymarket.backend.repository.sistema;

import com.cuymarket.backend.model.enums.TipoNotificacion;
import com.cuymarket.backend.model.sistema.Notificacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<Notificacion, Long> {
    
    List<Notificacion> findByUsuarioId(Long usuarioId);
    
    List<Notificacion> findByUsuarioIdOrderByFechaCreacionDesc(Long usuarioId);
    
    List<Notificacion> findByUsuarioIdAndLeida(Long usuarioId, Boolean leida);
    
    List<Notificacion> findByTipo(TipoNotificacion tipo);
    
    @Query("SELECT n FROM Notificacion n WHERE n.usuario.id = :usuarioId AND n.leida = false ORDER BY n.fechaCreacion DESC")
    List<Notificacion> findNotificacionesNoLeidasByUsuario(@Param("usuarioId") Long usuarioId);
    
    @Query("SELECT COUNT(n) FROM Notificacion n WHERE n.usuario.id = :usuarioId AND n.leida = false")
    Long contarNoLeidasByUsuario(@Param("usuarioId") Long usuarioId);
    
    @Modifying
    @Query("UPDATE Notificacion n SET n.leida = true WHERE n.usuario.id = :usuarioId AND n.leida = false")
    void marcarTodasComoLeidasByUsuario(@Param("usuarioId") Long usuarioId);
    
    @Query("SELECT n FROM Notificacion n WHERE n.fechaCreacion < :fecha")
    List<Notificacion> findNotificacionesAntiguas(@Param("fecha") LocalDateTime fecha);
    
    void deleteByUsuarioIdAndLeida(Long usuarioId, Boolean leida);
}
