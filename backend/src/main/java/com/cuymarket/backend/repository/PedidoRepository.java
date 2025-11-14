package com.cuymarket.backend.repository;

import com.cuymarket.backend.model.Pedido;
import com.cuymarket.backend.model.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PedidoRepository extends JpaRepository<Pedido, Long> {
    List<Pedido> findByUsuario(Usuario usuario);
}
