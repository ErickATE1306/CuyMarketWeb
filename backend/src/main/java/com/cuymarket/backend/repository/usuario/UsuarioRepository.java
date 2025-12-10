package com.cuymarket.backend.repository.usuario;

import com.cuymarket.backend.model.usuario.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    
    // Búsquedas básicas
    Optional<Usuario> findByEmail(String email);
    
    Optional<Usuario> findByDni(String dni);
    
    boolean existsByEmail(String email);
    
    boolean existsByDni(String dni);
    
    // Búsquedas con filtros
    List<Usuario> findByActivo(Boolean activo);
    
    List<Usuario> findByEmailVerificado(Boolean emailVerificado);
    
    @Query("SELECT u FROM Usuario u WHERE u.nombre LIKE %:nombre% OR u.apellido LIKE %:nombre%")
    List<Usuario> buscarPorNombre(@Param("nombre") String nombre);
    
    // Búsquedas por rol
    @Query("SELECT u FROM Usuario u JOIN u.roles r WHERE r.nombre = :nombreRol")
    List<Usuario> findByRolNombre(@Param("nombreRol") com.cuymarket.backend.model.enums.NombreRol nombreRol);
    
    // Estadísticas
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.activo = true")
    Long contarUsuariosActivos();
    
    @Query("SELECT COUNT(u) FROM Usuario u WHERE u.fechaRegistro >= :fecha")
    Long contarUsuariosRegistradosDespues(@Param("fecha") LocalDateTime fecha);
    
    // Búsqueda con pedidos
    @Query("SELECT DISTINCT u FROM Usuario u LEFT JOIN FETCH u.pedidos WHERE u.id = :id")
    Optional<Usuario> findByIdWithPedidos(@Param("id") Long id);
    
    // Búsqueda con roles
    @Query("SELECT DISTINCT u FROM Usuario u LEFT JOIN FETCH u.roles WHERE u.email = :email")
    Optional<Usuario> findByEmailWithRoles(@Param("email") String email);
}
