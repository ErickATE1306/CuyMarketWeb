package com.cuymarket.backend.repository;

import com.cuymarket.backend.model.ItemCarrito;
import com.cuymarket.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ItemCarritoRepository extends JpaRepository<ItemCarrito, Long> {
    List<ItemCarrito> findByUsuarioAndPedidoIsNull(Usuario usuario);
}
