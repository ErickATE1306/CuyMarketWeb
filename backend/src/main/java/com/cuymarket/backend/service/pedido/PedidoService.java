package com.cuymarket.backend.service.pedido;

import com.cuymarket.backend.dto.pedido.CrearPedidoRequest;
import com.cuymarket.backend.model.carrito.Carrito;
import com.cuymarket.backend.model.carrito.ItemCarrito;
import com.cuymarket.backend.model.enums.EstadoPedido;
import com.cuymarket.backend.model.enums.MetodoPago;
import com.cuymarket.backend.model.pedido.InformacionPago;
import com.cuymarket.backend.model.pedido.ItemPedido;
import com.cuymarket.backend.model.pedido.Pedido;
import com.cuymarket.backend.model.promocion.Cupon;
import com.cuymarket.backend.model.usuario.DireccionEnvio;
import com.cuymarket.backend.model.usuario.Usuario;
import com.cuymarket.backend.repository.carrito.CarritoRepository;
import com.cuymarket.backend.repository.pedido.InformacionPagoRepository;
import com.cuymarket.backend.repository.pedido.PedidoRepository;
import com.cuymarket.backend.repository.promocion.CuponRepository;
import com.cuymarket.backend.repository.usuario.DireccionEnvioRepository;
import com.cuymarket.backend.repository.usuario.UsuarioRepository;
import com.cuymarket.backend.service.producto.ProductoService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final UsuarioRepository usuarioRepository;
    private final CarritoRepository carritoRepository;
    private final DireccionEnvioRepository direccionRepository;
    private final CuponRepository cuponRepository;
    private final ProductoService productoService;
    private final InformacionPagoRepository informacionPagoRepository;

    // Crear pedido desde carrito
    public Pedido crearDesdeCarrito(Long usuarioId, Long direccionEnvioId, String metodoPago, String codigoCupon, CrearPedidoRequest request) throws Exception {
        Usuario usuario = usuarioRepository.findById(usuarioId)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado"));

        Carrito carrito = carritoRepository.findByUsuarioIdWithItems(usuarioId)
                .orElseThrow(() -> new RuntimeException("Carrito no encontrado"));

        if (carrito.getItems().isEmpty()) {
            throw new RuntimeException("El carrito está vacío");
        }

        DireccionEnvio direccion = direccionRepository.findById(direccionEnvioId)
                .orElseThrow(() -> new RuntimeException("Dirección no encontrada"));

        // Verificar stock disponible
        for (ItemCarrito itemCarrito : carrito.getItems()) {
            if (!productoService.tieneStockDisponible(itemCarrito.getProducto().getId(), itemCarrito.getCantidad())) {
                throw new RuntimeException("Stock insuficiente para: " + itemCarrito.getProducto().getNombre());
            }
        }

        // Crear pedido
        Pedido pedido = new Pedido();
        pedido.setUsuario(usuario);
        pedido.setDireccionEnvio(direccion);
        pedido.setEstado(EstadoPedido.PENDIENTE);
        pedido.setEstadoPago(com.cuymarket.backend.model.enums.EstadoPago.PENDIENTE);
        pedido.setMetodoPago(com.cuymarket.backend.model.enums.MetodoPago.valueOf(metodoPago));
        
        // Generar número de pedido manualmente
        pedido.setNumeroPedido("PED-" + LocalDateTime.now().toString().replaceAll("[^0-9]", "").substring(0, 14));
        pedido.setFechaPedido(LocalDateTime.now());

        // Calcular subtotal - usar solo precio ya que precioOferta no existe
        BigDecimal subtotal = carrito.getItems().stream()
                .map(item -> item.getProducto().getPrecio().multiply(BigDecimal.valueOf(item.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        pedido.setSubtotal(subtotal);

        // Aplicar cupón si existe
        BigDecimal descuento = BigDecimal.ZERO;
        if (codigoCupon != null && !codigoCupon.isEmpty()) {
            Cupon cupon = cuponRepository.findByCodigo(codigoCupon)
                    .orElseThrow(() -> new RuntimeException("Cupón no válido"));

            // Validar cupón
            if (!cupon.getActivo()) {
                throw new RuntimeException("El cupón no está activo");
            }

            LocalDateTime ahora = LocalDateTime.now();
            if (cupon.getFechaInicio().isAfter(ahora.toLocalDate()) ||
                    cupon.getFechaVencimiento().isBefore(ahora.toLocalDate())) {
                throw new RuntimeException("El cupón no está vigente");
            }

            if (cupon.getUsosMaximos() != null && cupon.getUsosActuales() >= cupon.getUsosMaximos()) {
                throw new RuntimeException("El cupón ha alcanzado el límite de usos");
            }

            // Validar compra mínima
            if (cupon.getMinimoCompra() != null && subtotal.compareTo(cupon.getMinimoCompra()) < 0) {
                throw new RuntimeException("El monto mínimo de compra para este cupón es: " + cupon.getMinimoCompra());
            }

            descuento = calcularDescuentoCupon(subtotal, cupon);
            pedido.setCupon(cupon);

            // Incrementar usos del cupón
            cupon.setUsosActuales(cupon.getUsosActuales() + 1);
            cuponRepository.save(cupon);
        }

        pedido.setDescuento(descuento);

        // Calcular costo de envío - Gratis para compras >= 100
        BigDecimal costoEnvio = subtotal.compareTo(BigDecimal.valueOf(100)) >= 0 
            ? BigDecimal.ZERO 
            : BigDecimal.valueOf(15.00);
        pedido.setCostoEnvio(costoEnvio);

        // Calcular total
        BigDecimal total = subtotal.subtract(descuento).add(costoEnvio);
        pedido.setTotal(total);

        // Crear items del pedido
        List<ItemPedido> items = new ArrayList<>();
        for (ItemCarrito itemCarrito : carrito.getItems()) {
            ItemPedido itemPedido = new ItemPedido();
            itemPedido.setPedido(pedido);
            itemPedido.setProducto(itemCarrito.getProducto());
            itemPedido.setNombreProducto(itemCarrito.getProducto().getNombre());
            itemPedido.setCantidad(itemCarrito.getCantidad());
            itemPedido.setPrecioUnitario(itemCarrito.getProducto().getPrecio());
            itemPedido.setSubtotal(itemCarrito.getProducto().getPrecio().multiply(BigDecimal.valueOf(itemCarrito.getCantidad())));

            items.add(itemPedido);
        }

        pedido.setItems(items);

        // Guardar pedido primero para generar el número de pedido
        Pedido pedidoGuardado = pedidoRepository.save(pedido);

        // Guardar información de pago si el método requiere comprobante
        MetodoPago metodo = MetodoPago.valueOf(metodoPago);
        if (metodo == MetodoPago.YAPE || metodo == MetodoPago.PLIN || metodo == MetodoPago.TRANSFERENCIA) {
            InformacionPago infoPago = new InformacionPago();
            infoPago.setPedido(pedidoGuardado);
            infoPago.setMetodoPago(metodo);
            infoPago.setFechaPago(LocalDateTime.now());
            infoPago.setEstadoTransaccion("PENDIENTE");
            
            // Guardar datos adicionales según el método
            if (request.getTelefono() != null) {
                infoPago.setTelefono(request.getTelefono());
            }
            if (request.getBanco() != null) {
                infoPago.setBanco(request.getBanco());
            }
            
            // Guardar comprobante si existe
            if (request.getComprobante() != null && !request.getComprobante().isEmpty()) {
                infoPago.setComprobante(request.getComprobante().getBytes());
            }
            
            informacionPagoRepository.save(infoPago);
        }

        // Descontar stock después de guardar
        for (ItemCarrito itemCarrito : carrito.getItems()) {
            productoService.descontarStock(itemCarrito.getProducto().getId(), itemCarrito.getCantidad(),
                    "Pedido #" + pedidoGuardado.getNumeroPedido());
        }

        // Limpiar carrito
        carrito.getItems().clear();
        carritoRepository.save(carrito);

        return pedidoGuardado;
    }

    // Actualizar estado del pedido
    public Pedido actualizarEstado(Long id, EstadoPedido nuevoEstado) {
        Pedido pedido = obtenerPorId(id);
        EstadoPedido estadoAnterior = pedido.getEstado();

        // Validar transición de estados
        validarTransicionEstado(estadoAnterior, nuevoEstado);

        pedido.setEstado(nuevoEstado);

        // Si se cancela, devolver stock
        if (nuevoEstado == EstadoPedido.CANCELADO && estadoAnterior != EstadoPedido.CANCELADO) {
            for (ItemPedido item : pedido.getItems()) {
                productoService.incrementarStock(item.getProducto().getId(), item.getCantidad(),
                        "Cancelación pedido #" + pedido.getNumeroPedido());
            }
        }

        pedidoRepository.save(pedido);
        // Recargar el pedido con todas sus relaciones para evitar LazyInitializationException
        return pedidoRepository.findByIdWithItems(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
    }

    // Actualizar estado de pago
    public Pedido actualizarEstadoPago(Long id, com.cuymarket.backend.model.enums.EstadoPago nuevoEstadoPago) {
        Pedido pedido = obtenerPorId(id);
        pedido.setEstadoPago(nuevoEstadoPago);
        pedidoRepository.save(pedido);
        // Recargar el pedido con todas sus relaciones para evitar LazyInitializationException
        return pedidoRepository.findByIdWithItems(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
    }

    // Consultas
    @Transactional(readOnly = true)
    public Pedido obtenerPorId(Long id) {
        return pedidoRepository.findByIdCompleto(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado con ID: " + id));
    }

    @Transactional(readOnly = true)
    public Pedido obtenerPorIdConItems(Long id) {
        return pedidoRepository.findByIdWithItems(id)
                .orElseThrow(() -> new RuntimeException("Pedido no encontrado"));
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarPorUsuario(Long usuarioId) {
        return pedidoRepository.findByUsuarioIdWithDetails(usuarioId);
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarPorEstado(EstadoPedido estado) {
        return pedidoRepository.findByEstadoWithDetails(estado);
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarTodos() {
        return pedidoRepository.findAllWithDetails();
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarPorFechas(LocalDateTime desde, LocalDateTime hasta) {
        return pedidoRepository.findByFechaPedidoBetween(desde, hasta);
    }

    @Transactional(readOnly = true)
    public List<Pedido> listarPendientes() {
        return pedidoRepository.findPedidosPendientes();
    }

    @Transactional(readOnly = true)
    public BigDecimal calcularVentasTotales(LocalDateTime desde, LocalDateTime hasta) {
        return pedidoRepository.calcularVentasTotales(desde, hasta);
    }

    @Transactional(readOnly = true)
    public Long contarPorEstado(EstadoPedido estado) {
        return pedidoRepository.contarPorEstado(estado);
    }

    @Transactional(readOnly = true)
    public Long contarPorUsuario(Long usuarioId) {
        return (long) pedidoRepository.findByUsuarioIdOrderByFechaPedidoDesc(usuarioId).size();
    }

    // Métodos privados
    private BigDecimal calcularDescuentoCupon(BigDecimal subtotal, Cupon cupon) {
        switch (cupon.getTipoCupon()) {
            case PORCENTAJE:
                return subtotal.multiply(cupon.getDescuento().divide(BigDecimal.valueOf(100)));
            case MONTO_FIJO:
                return cupon.getDescuento().min(subtotal); // No puede ser mayor al subtotal
            default:
                return BigDecimal.ZERO;
        }
    }

    private void validarTransicionEstado(EstadoPedido estadoActual, EstadoPedido nuevoEstado) {
        if (estadoActual == EstadoPedido.CANCELADO) {
            throw new RuntimeException("No se puede cambiar el estado de un pedido cancelado");
        }

        if (estadoActual == EstadoPedido.ENTREGADO && nuevoEstado != EstadoPedido.CANCELADO) {
            throw new RuntimeException("No se puede cambiar el estado de un pedido entregado");
        }
    }
}
