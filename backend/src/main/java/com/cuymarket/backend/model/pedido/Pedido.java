package com.cuymarket.backend.model.pedido;

import com.cuymarket.backend.model.enums.EstadoPedido;
import com.cuymarket.backend.model.enums.MetodoPago;
import com.cuymarket.backend.model.enums.EstadoPago;
import com.cuymarket.backend.model.usuario.Usuario;
import com.cuymarket.backend.model.usuario.DireccionEnvio;
import com.cuymarket.backend.model.promocion.Cupon;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String numeroPedido;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaPedido;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPedido estado = EstadoPedido.PENDIENTE;
    
    @NotNull
    @DecimalMin(value = "0.0", inclusive = true)
    @Digits(integer = 8, fraction = 2)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;
    
    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal costoEnvio;
    
    @NotNull
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MetodoPago metodoPago;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPago estadoPago = EstadoPago.PENDIENTE;
    
    @ManyToOne
    @JoinColumn(name = "cupon_id")
    private Cupon cupon;
    
    @Column(columnDefinition = "TEXT")
    private String notas;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> items = new ArrayList<>();
    
    @OneToOne(cascade = CascadeType.ALL)
    @JoinColumn(name = "direccion_envio_id", nullable = false)
    private DireccionEnvio direccionEnvio;
    
    @OneToOne(mappedBy = "pedido", cascade = CascadeType.ALL)
    private InformacionPago informacionPago;
    
    @OneToOne(mappedBy = "pedido", cascade = CascadeType.ALL)
    private Factura factura;
    
    @PrePersist
    protected void onCreate() {
        fechaPedido = LocalDateTime.now();
        if (numeroPedido == null) {
            numeroPedido = generarNumeroPedido();
        }
    }
    
    private String generarNumeroPedido() {
        return "PED-" + LocalDateTime.now().toString().replaceAll("[^0-9]", "").substring(0, 14);
    }
}
