package com.cuymarket.backend.repository.usuario;

import com.cuymarket.backend.model.enums.NombreRol;
import com.cuymarket.backend.model.usuario.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {
    
    Optional<Rol> findByNombre(NombreRol nombre);
    
    boolean existsByNombre(NombreRol nombre);
}
