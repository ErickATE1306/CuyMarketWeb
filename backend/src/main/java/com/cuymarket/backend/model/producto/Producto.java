package com.cuymarket.backend.model.producto;

import com.cuymarket.backend.model.carrito.ItemCarrito;
import com.cuymarket.backend.model.pedido.ItemPedido;
import com.cuymarket.backend.model.inventario.Inventario;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Producto {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank(message = "El nombre es obligatorio")
    @Column(nullable = false, length = 200)
    private String nombre;
    
    @Column(length = 100)
    private String raza;
    
    @Column(length = 50)
    private String peso;
    
    @NotNull(message = "El precio es obligatorio")
    @DecimalMin(value = "0.0", inclusive = false, message = "El precio debe ser mayor a 0")
    @Digits(integer = 8, fraction = 2, message = "El precio debe tener máximo 8 dígitos enteros y 2 decimales")
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;
    
    @Column(length = 100)
    private String tipo;
    
    @Column(nullable = false)
    private Boolean certificado = false;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(columnDefinition = "TEXT")
    private String caracteristicas;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] imagen1;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] imagen2;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] imagen3;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] imagen4;
    
    @Lob
    @Column(columnDefinition = "LONGBLOB")
    private byte[] imagen5;
    
    @Min(value = 0, message = "El stock no puede ser negativo")
    @Column(nullable = false)
    private Integer stock = 0;
    
    @Column(nullable = false)
    private Boolean activo = true;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    private LocalDateTime fechaActualizacion;
    
    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    private List<ItemCarrito> itemsCarrito = new ArrayList<>();
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    private List<Resena> resenas = new ArrayList<>();
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    private List<ItemPedido> itemsPedido = new ArrayList<>();
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    private List<ListaDeseos> listaDeseos = new ArrayList<>();
    
    @OneToOne(mappedBy = "producto", cascade = CascadeType.ALL)
    private Inventario inventario;
    
    @PrePersist
    protected void onCreate() {
        fechaCreacion = LocalDateTime.now();
    }
    
    @PreUpdate
    protected void onUpdate() {
        fechaActualizacion = LocalDateTime.now();
    }
}
