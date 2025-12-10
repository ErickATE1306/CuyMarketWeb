package com.cuymarket.backend.service.carrito;

import com.cuymarket.backend.model.carrito.Carrito;
import com.cuymarket.backend.model.carrito.ItemCarrito;
import com.cuymarket.backend.model.producto.Producto;
import com.cuymarket.backend.model.usuario.Usuario;
import com.cuymarket.backend.repository.carrito.CarritoRepository;
import com.cuymarket.backend.repository.carrito.ItemCarritoRepository;
import com.cuymarket.backend.repository.producto.ProductoRepository;
import com.cuymarket.backend.repository.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CarritoService {

    private final CarritoRepository carritoRepository;
    private final ItemCarritoRepository itemCarritoRepository;
    private final UsuarioRepository usuarioRepository;
    private final ProductoRepository productoRepository;

    // Obtener o crear carrito del usuario
    public Carrito obtenerOCrearCarrito(Long usuarioId) {
        return carritoRepository.findByUsuarioIdWithItems(usuarioId)
                .orElseGet(() -> {
                    Usuario usuario = usuarioRepository.findById(usuarioId)
                            .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

                    Carrito carrito = new Carrito();
                    carrito.setUsuario(usuario);
                    return carritoRepository.save(carrito);
                });
    }

    // Agregar producto al carrito
    public Carrito agregarProducto(Long usuarioId, Long productoId, Integer cantidad) {
        if (cantidad <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a 0");
        }

        Carrito carrito = obtenerOCrearCarrito(usuarioId);

        Producto producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new RuntimeException("Producto no encontrado"));

        if (!producto.getActivo()) {
            throw new RuntimeException("El producto no está disponible");
        }

        // Verificar stock disponible
        if (producto.getStockDisponible() < cantidad) {
            throw new RuntimeException("Stock insuficiente para el producto: " + producto.getNombre());
        }

        // Verificar si el producto ya está en el carrito
        ItemCarrito itemExistente = carrito.getItems().stream()
                .filter(item -> item.getProducto().getId().equals(productoId))
                .findFirst()
                .orElse(null);

        if (itemExistente != null) {
            // Actualizar cantidad
            int nuevaCantidad = itemExistente.getCantidad() + cantidad;

            if (producto.getStockDisponible() < nuevaCantidad) {
                throw new RuntimeException("Stock insuficiente. Stock disponible: " +
                        producto.getStockDisponible());
            }

            itemExistente.setCantidad(nuevaCantidad);
            itemCarritoRepository.save(itemExistente);
        } else {
            // Crear nuevo item
            ItemCarrito nuevoItem = new ItemCarrito();
            nuevoItem.setCarrito(carrito);
            nuevoItem.setProducto(producto);
            nuevoItem.setCantidad(cantidad);

            carrito.getItems().add(nuevoItem);
            itemCarritoRepository.save(nuevoItem);
        }

        return carritoRepository.save(carrito);
    }

    // Actualizar cantidad de producto
    public Carrito actualizarCantidad(Long usuarioId, Long itemId, Integer nuevaCantidad) {
        if (nuevaCantidad <= 0) {
            throw new RuntimeException("La cantidad debe ser mayor a 0");
        }

        Carrito carrito = obtenerCarrito(usuarioId);

        ItemCarrito item = carrito.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("El producto no está en el carrito"));

        Producto producto = item.getProducto();
        
        // Verificar stock
        if (producto.getStockDisponible() < nuevaCantidad) {
            throw new RuntimeException("Stock insuficiente. Stock disponible: " +
                    producto.getStockDisponible());
        }

        item.setCantidad(nuevaCantidad);
        itemCarritoRepository.save(item);

        return carritoRepository.save(carrito);
    }

    // Remover producto del carrito
    public Carrito removerProducto(Long usuarioId, Long itemId) {
        Carrito carrito = obtenerCarrito(usuarioId);

        ItemCarrito item = carrito.getItems().stream()
                .filter(i -> i.getId().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("El producto no está en el carrito"));

        carrito.getItems().remove(item);
        itemCarritoRepository.delete(item);

        return carritoRepository.save(carrito);
    }

    // Limpiar carrito
    public void limpiarCarrito(Long usuarioId) {
        Carrito carrito = obtenerCarrito(usuarioId);

        itemCarritoRepository.deleteAll(carrito.getItems());
        carrito.getItems().clear();

        carritoRepository.save(carrito);
    }

    // Calcular total del carrito
    @Transactional(readOnly = true)
    public BigDecimal calcularTotal(Long usuarioId) {
        Carrito carrito = obtenerCarritoConItems(usuarioId);

        return carrito.getItems().stream()
                .map(item -> item.getProducto().getPrecio().multiply(BigDecimal.valueOf(item.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    // Contar items del carrito
    @Transactional(readOnly = true)
    public Integer contarItems(Long usuarioId) {
        Carrito carrito = obtenerCarrito(usuarioId);
        return carrito.getItems().stream()
                .mapToInt(ItemCarrito::getCantidad)
                .sum();
    }

    // Consultas
    @Transactional(readOnly = true)
    public Carrito obtenerCarrito(Long usuarioId) {
        return carritoRepository.findByUsuarioId(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));
    }

    @Transactional(readOnly = true)
    public Carrito obtenerCarritoConItems(Long usuarioId) {
        return carritoRepository.findByUsuarioIdWithItems(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));
    }

    @Transactional(readOnly = true)
    public boolean estaVacio(Long usuarioId) {
        Carrito carrito = obtenerCarrito(usuarioId);
        return carrito.getItems().isEmpty();
    }

    @Transactional(readOnly = true)
    public boolean contieneProducto(Long usuarioId, Long productoId) {
        Carrito carrito = obtenerCarrito(usuarioId);
        return carrito.getItems().stream()
                .anyMatch(item -> item.getProducto().getId().equals(productoId));
    }

    @Transactional(readOnly = true)
    public List<ItemCarrito> obtenerItems(Long usuarioId) {
        Carrito carrito = obtenerCarritoConItems(usuarioId);
        return carrito.getItems();
    }
}
