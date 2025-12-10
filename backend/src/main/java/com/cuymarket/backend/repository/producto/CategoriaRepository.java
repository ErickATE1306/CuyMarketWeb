package com.cuymarket.backend.repository.producto;

import com.cuymarket.backend.model.producto.Categoria;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
    
    Optional<Categoria> findByNombre(String nombre);
    
    List<Categoria> findByActiva(Boolean activa);
    
    boolean existsByNombre(String nombre);
    
    @Query("SELECT COUNT(p) FROM Producto p WHERE p.categoria.id = :categoriaId AND p.activo = true")
    Long contarProductosActivosByCategoria(Long categoriaId);
}
