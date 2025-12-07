# Entidades del Backend - CuyMarket

## 1. Usuario (User)
```java
@Entity
@Table(name = "usuarios")
public class Usuario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(nullable = false, length = 100)
    private String apellido;
    
    @Column(unique = true, nullable = false, length = 8)
    private String dni;
    
    @Column(nullable = false, length = 9)
    private String telefono;
    
    @Column(unique = true, nullable = false, length = 150)
    private String email;
    
    @Column(nullable = false)
    private String password; // Encriptado con BCrypt
    
    @Column(nullable = false)
    private Boolean emailVerified = false;
    
    @Column(nullable = false)
    private Boolean activo = true;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaRegistro;
    
    private LocalDateTime ultimoAcceso;
    
    // Relaciones
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "usuario_rol",
        joinColumns = @JoinColumn(name = "usuario_id"),
        inverseJoinColumns = @JoinColumn(name = "rol_id")
    )
    private Set<Rol> roles = new HashSet<>();
    
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Pedido> pedidos;
    
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Review> reviews;
    
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<Wishlist> wishlist;
    
    @OneToMany(mappedBy = "usuario", cascade = CascadeType.ALL)
    private List<DireccionEnvio> direcciones;
    
    @OneToOne(mappedBy = "usuario", cascade = CascadeType.ALL)
    private Carrito carrito;
}
```

## 2. Rol (Role)
```java
@Entity
@Table(name = "roles")
public class Rol {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(unique = true, nullable = false, length = 20)
    private RolNombre nombre; // ADMIN, EMPLEADO, CLIENTE
    
    @Column(length = 255)
    private String descripcion;
    
    @Column(nullable = false)
    private Boolean activo = true;
    
    // Relaciones
    @ManyToMany(mappedBy = "roles")
    private Set<Usuario> usuarios = new HashSet<>();
}

// Enum
public enum RolNombre {
    ADMIN,
    EMPLEADO,
    CLIENTE
}
```

## 3. UsuarioRol (Tabla intermedia - Creada automáticamente por JPA)
```java
@Table(name = "usuario_rol")
// Campos:
// usuario_id: Long (FK a usuarios)
// rol_id: Long (FK a roles)
// Relación Many-to-Many entre Usuario y Rol
```

---

## 4. Producto
```java
@Entity
@Table(name = "productos")
public class Producto {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String nombre;
    
    @Column(length = 100)
    private String raza; // Raza Perú, Raza Andina, Raza Inti, N/A
    
    @Column(length = 50)
    private String peso; // Ej: "900-1200g"
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precio;
    
    @Column(length = 100)
    private String tipo; // Reproductor, Gazapo, Gestante, Entero, etc.
    
    @Column(nullable = false)
    private Boolean certificado = false;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(columnDefinition = "JSON")
    private String caracteristicas; // Array de strings en JSON
    
    @Column(columnDefinition = "JSON")
    private String imagenes; // Array de URLs en JSON
    
    @Column(nullable = false)
    private Integer stock = 0;
    
    @Column(nullable = false)
    private Boolean activo = true;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    private LocalDateTime fechaActualizacion;
    
    // Relaciones
    @ManyToOne
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    private List<ItemCarrito> itemsCarrito;
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    private List<Review> reviews;
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    private List<ItemPedido> itemsPedido;
    
    @OneToMany(mappedBy = "producto", cascade = CascadeType.ALL)
    private List<Wishlist> wishlists;
    
    @OneToOne(mappedBy = "producto", cascade = CascadeType.ALL)
    private Inventario inventario;
}
```

## 5. Categoria
```java
@Entity
@Table(name = "categorias")
public class Categoria {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 100)
    private String nombre; // Cuyes Vivos, Carne de Cuy, Servicios
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Column(length = 255)
    private String icono; // URL o nombre del ícono
    
    @Column(nullable = false)
    private Boolean activa = true;
    
    @Column(nullable = false)
    private Integer orden = 0;
    
    // Relaciones
    @OneToMany(mappedBy = "categoria", cascade = CascadeType.ALL)
    private List<Producto> productos;
}
```

## 6. Pedido (Order)
```java
@Entity
@Table(name = "pedidos")
public class Pedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String numeroPedido; // Ej: PED-20231207-0001
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaPedido;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPedido estado = EstadoPedido.PENDIENTE;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal descuento = BigDecimal.ZERO;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal costoEnvio;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MetodoPago metodoPago;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EstadoPago estadoPago = EstadoPago.PENDIENTE;
    
    @Column(length = 50)
    private String codigoCupon;
    
    @Column(columnDefinition = "TEXT")
    private String notas;
    
    // Relaciones
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
}

// Enums
public enum EstadoPedido {
    PENDIENTE,
    EN_PROCESO,
    EN_CAMINO,
    ENTREGADO,
    CANCELADO
}

public enum MetodoPago {
    TARJETA,
    YAPE,
    PLIN,
    TRANSFERENCIA
}

public enum EstadoPago {
    PENDIENTE,
    PAGADO,
    RECHAZADO
}
```

## 7. ItemPedido (OrderItem)
```java
@Entity
@Table(name = "items_pedido")
public class ItemPedido {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 200)
    private String nombreProducto; // Snapshot
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal precioUnitario; // Snapshot
    
    @Column(nullable = false)
    private Integer cantidad;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    // Relaciones
    @ManyToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;
    
    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
}
```

## 8. DireccionEnvio (ShippingAddress)
```java
@Entity
@Table(name = "direcciones_envio")
public class DireccionEnvio {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String nombre;
    
    @Column(nullable = false, length = 100)
    private String apellido;
    
    @Column(nullable = false, length = 9)
    private String telefono;
    
    @Column(nullable = false, length = 255)
    private String direccion;
    
    @Column(columnDefinition = "TEXT")
    private String referencia;
    
    @Column(nullable = false, length = 100)
    private String ciudad = "Lima";
    
    @Column(nullable = false, length = 100)
    private String distrito;
    
    @Column(length = 10)
    private String codigoPostal;
    
    @Column(nullable = false)
    private Boolean esPrincipal = false;
    
    // Relaciones
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
```

## 9. InformacionPago (PaymentInfo)
```java
@Entity
@Table(name = "informacion_pago")
public class InformacionPago {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private MetodoPago metodoPago;
    
    // Para tarjetas
    @Column(length = 4)
    private String ultimosDigitosTarjeta;
    
    @Column(length = 150)
    private String titularTarjeta;
    
    // Para Yape/Plin
    @Column(length = 9)
    private String telefono;
    
    // Para transferencias
    @Column(length = 100)
    private String banco;
    
    @Column(length = 500)
    private String comprobanteUrl;
    
    private LocalDateTime fechaPago;
    
    @Column(length = 100)
    private String estadoTransaccion;
    
    // Relaciones
    @OneToOne
    @JoinColumn(name = "pedido_id", nullable = false)
    private Pedido pedido;
}
```

## 10. Review (Reseña)
```java
@Entity
@Table(name = "reviews")
public class Review {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, length = 100)
    private String userName; // Snapshot
    
    @Column(nullable = false)
    private Integer rating; // 1-5
    
    @Column(length = 200)
    private String titulo;
    
    @Column(columnDefinition = "TEXT")
    private String comentario;
    
    @Column(nullable = false)
    private Boolean verificado = false;
    
    @Column(nullable = false)
    private Integer helpful = 0;
    
    @Column(columnDefinition = "JSON")
    private String imagenes; // Array de URLs
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    // Relaciones
    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
    
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}
```

## 11. Wishlist (Lista de Deseos)
```java
@Entity
@Table(name = "wishlist")
public class Wishlist {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaAgregado;
    
    // Relaciones
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
    
    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
}
```

## 12. Cupon (Coupon)
```java
@Entity
@Table(name = "cupones")
public class Cupon {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String codigo;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal descuento;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoCupon tipoCupon;
    
    @Column(precision = 10, scale = 2)
    private BigDecimal minimoCompra;
    
    @Column(nullable = false)
    private LocalDate fechaInicio;
    
    @Column(nullable = false)
    private LocalDate fechaVencimiento;
    
    private Integer usosMaximos; // -1 para ilimitado
    
    @Column(nullable = false)
    private Integer usosActuales = 0;
    
    @Column(nullable = false)
    private Boolean activo = true;
}

// Enum
public enum TipoCupon {
    PORCENTAJE,
    MONTO_FIJO
}
```

## 13. Carrito (Cart)
```java
@Entity
@Table(name = "carritos")
public class Carrito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(length = 100)
    private String sessionId; // Para usuarios no registrados
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    private LocalDateTime fechaActualizacion;
    
    // Relaciones
    @OneToOne
    @JoinColumn(name = "usuario_id")
    private Usuario usuario;
    
    @OneToMany(mappedBy = "carrito", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemCarrito> items = new ArrayList<>();
}
```

## 14. ItemCarrito (CartItem)
```java
@Entity
@Table(name = "items_carrito")
public class ItemCarrito {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Integer cantidad;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaAgregado;
    
    // Relaciones
    @ManyToOne
    @JoinColumn(name = "carrito_id", nullable = false)
    private Carrito carrito;
    
    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
}
```

## 15. Configuracion (SystemConfig)
```java
@Entity
@Table(name = "configuraciones")
public class Configuracion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 100)
    private String clave;
    
    @Column(columnDefinition = "TEXT")
    private String valor;
    
    @Column(columnDefinition = "TEXT")
    private String descripcion;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoConfiguracion tipo;
    
    private LocalDateTime fechaActualizacion;
}

// Enum
public enum TipoConfiguracion {
    STRING,
    NUMBER,
    BOOLEAN,
    JSON
}
```

## 16. Inventario (Inventory)
```java
@Entity
@Table(name = "inventarios")
public class Inventario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    private Integer stockActual = 0;
    
    @Column(nullable = false)
    private Integer stockMinimo = 0;
    
    @Column(nullable = false)
    private Integer stockMaximo = 0;
    
    @Column(length = 100)
    private String ubicacion;
    
    private LocalDateTime ultimaActualizacion;
    
    // Relaciones
    @OneToOne
    @JoinColumn(name = "producto_id", unique = true, nullable = false)
    private Producto producto;
}
```

## 17. MovimientoInventario (InventoryMovement)
```java
@Entity
@Table(name = "movimientos_inventario")
public class MovimientoInventario {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoMovimiento tipo;
    
    @Column(nullable = false)
    private Integer cantidad;
    
    @Column(nullable = false)
    private Integer stockAnterior;
    
    @Column(nullable = false)
    private Integer stockNuevo;
    
    @Column(length = 255)
    private String motivo;
    
    @Column(nullable = false, length = 100)
    private String usuario; // Email del usuario que realizó el movimiento
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fecha;
    
    // Relaciones
    @ManyToOne
    @JoinColumn(name = "producto_id", nullable = false)
    private Producto producto;
}

// Enum
public enum TipoMovimiento {
    ENTRADA,
    SALIDA,
    AJUSTE,
    DEVOLUCION
}
```

## 18. Factura (Invoice)
```java
@Entity
@Table(name = "facturas")
public class Factura {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, length = 50)
    private String numeroFactura; // Ej: F001-00000001
    
    @Column(nullable = false, length = 11)
    private String rucEmpresa;
    
    @Column(nullable = false, length = 255)
    private String razonSocialEmpresa;
    
    @Column(nullable = false, length = 255)
    private String direccionEmpresa;
    
    @Column(length = 11)
    private String rucCliente;
    
    @Column(length = 255)
    private String razonSocialCliente;
    
    @Column(nullable = false)
    private LocalDate fechaEmision;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal igv;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;
    
    @Column(length = 500)
    private String archivoUrl; // URL del PDF
    
    // Relaciones
    @OneToOne
    @JoinColumn(name = "pedido_id", unique = true, nullable = false)
    private Pedido pedido;
}
```

## 19. Notificacion (Notification)
```java
@Entity
@Table(name = "notificaciones")
public class Notificacion {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoNotificacion tipo;
    
    @Column(nullable = false, length = 200)
    private String titulo;
    
    @Column(columnDefinition = "TEXT")
    private String mensaje;
    
    @Column(nullable = false)
    private Boolean leida = false;
    
    @Column(length = 500)
    private String urlAccion;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    // Relaciones
    @ManyToOne
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;
}

// Enum
public enum TipoNotificacion {
    INFO,
    PEDIDO,
    PROMOCION,
    SISTEMA
}
```

## 20. Reporte (Report)
```java
@Entity
@Table(name = "reportes")
public class Reporte {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TipoReporte tipo;
    
    @Column(nullable = false)
    private LocalDate fechaInicio;
    
    @Column(nullable = false)
    private LocalDate fechaFin;
    
    @Column(columnDefinition = "JSON")
    private String parametros;
    
    @Column(length = 500)
    private String archivoUrl;
    
    @Column(nullable = false, updatable = false)
    private LocalDateTime fechaGeneracion;
    
    // Relaciones
    @ManyToOne
    @JoinColumn(name = "generado_por", nullable = false)
    private Usuario generadoPor;
}

// Enum
public enum TipoReporte {
    VENTAS,
    INVENTARIO,
    USUARIOS,
    FINANCIERO
}
```

---

## Resumen de Entidades (20 total)

1. **Usuario** - Gestión de usuarios del sistema
2. **Rol** - Roles (ADMIN, EMPLEADO, CLIENTE)
3. **UsuarioRol** - Tabla intermedia Many-to-Many
4. **Producto** - Productos (cuyes, carne, servicios)
5. **Categoria** - Categorización de productos
6. **Pedido** - Órdenes de compra
7. **ItemPedido** - Líneas de detalle del pedido
8. **DireccionEnvio** - Direcciones de entrega
9. **InformacionPago** - Datos de pago
10. **Review** - Reseñas y calificaciones
11. **Wishlist** - Lista de deseos
12. **Cupon** - Cupones de descuento
13. **Carrito** - Carrito de compras
14. **ItemCarrito** - Items del carrito
15. **Configuracion** - Configuración del sistema
16. **Inventario** - Control de stock
17. **MovimientoInventario** - Trazabilidad de stock
18. **Factura** - Facturas electrónicas
19. **Notificacion** - Notificaciones
20. **Reporte** - Generación de reportes

---

## Índices Recomendados

```sql
-- Usuario
CREATE INDEX idx_usuario_email ON usuarios(email);
CREATE INDEX idx_usuario_dni ON usuarios(dni);

-- Producto
CREATE INDEX idx_producto_categoria ON productos(categoria_id);
CREATE INDEX idx_producto_activo ON productos(activo);

-- Pedido
CREATE INDEX idx_pedido_usuario ON pedidos(usuario_id);
CREATE INDEX idx_pedido_numero ON pedidos(numero_pedido);
CREATE INDEX idx_pedido_fecha ON pedidos(fecha_pedido);
CREATE INDEX idx_pedido_estado ON pedidos(estado);

-- Review
CREATE INDEX idx_review_producto ON reviews(producto_id);
CREATE INDEX idx_review_usuario ON reviews(usuario_id);

-- Wishlist
CREATE UNIQUE INDEX idx_wishlist_usuario_producto ON wishlist(usuario_id, producto_id);
```

---

## Validaciones a Nivel de Aplicación

```java
// Usuario
@NotBlank(message = "El nombre es obligatorio")
@Size(min = 2, max = 100)
private String nombre;

@Email(message = "Email inválido")
private String email;

@Pattern(regexp = "\\d{8}", message = "DNI debe tener 8 dígitos")
private String dni;

@Pattern(regexp = "\\d{9}", message = "Teléfono debe tener 9 dígitos")
private String telefono;

// Producto
@NotNull
@DecimalMin(value = "0.0", inclusive = false)
@Digits(integer = 8, fraction = 2)
private BigDecimal precio;

@Min(value = 0)
private Integer stock;

// Review
@Min(1)
@Max(5)
private Integer rating;
```
- `id`: Long (PK, Auto-increment)
- `nombre`: String (NOT NULL)
- `raza`: String (Raza Perú, Raza Andina, Raza Inti, N/A)
- `peso`: String (ej: "900-1200g")
- `precio`: BigDecimal (NOT NULL, >= 0)
- `categoria`: String (Cuyes Vivos, Carne de Cuy, Servicios)
- `tipo`: String (Reproductor, Gazapo, Gestante, Entero, Porcionado, etc.)
- `certificado`: Boolean (default: false)
- `descripcion`: Text
- `caracteristicas`: JSON/Text (array de strings)
- `imagenes`: JSON/Text (array de URLs)
- `stock`: Integer (>= 0)
- `activo`: Boolean (default: true)
- `fechaCreacion`: LocalDateTime
- `fechaActualizacion`: LocalDateTime

**Relaciones:**
- ManyToOne con Categoria
- OneToMany con ItemCarrito
- OneToMany con Review
- OneToMany con ItemPedido
- ManyToMany con Wishlist

---

## 3. Categoria
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `nombre`: String (UNIQUE, NOT NULL)
- `descripcion`: Text
- `icono`: String (URL o nombre)
- `activa`: Boolean (default: true)
- `orden`: Integer (para ordenamiento)

**Relaciones:**
- OneToMany con Producto

---

## 4. Pedido (Order)
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `numeroPedido`: String (UNIQUE, generado automáticamente)
- `userId`: Long (FK)
- `fechaPedido`: LocalDateTime
- `estado`: Enum (PENDIENTE, EN_PROCESO, EN_CAMINO, ENTREGADO, CANCELADO)
- `subtotal`: BigDecimal
- `descuento`: BigDecimal (default: 0)
- `costoEnvio`: BigDecimal
- `total`: BigDecimal
- `metodoPago`: Enum (TARJETA, YAPE, PLIN, TRANSFERENCIA)
- `estadoPago`: Enum (PENDIENTE, PAGADO, RECHAZADO)
- `codigoCupon`: String (nullable)
- `notas`: Text

**Relaciones:**
- ManyToOne con Usuario
- OneToMany con ItemPedido
- OneToOne con DireccionEnvio
- OneToOne con InformacionPago

---

## 5. ItemPedido (OrderItem)
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `pedidoId`: Long (FK)
- `productoId`: Long (FK)
- `nombreProducto`: String (snapshot del nombre)
- `precioUnitario`: BigDecimal (snapshot del precio)
- `cantidad`: Integer (> 0)
- `subtotal`: BigDecimal (precioUnitario * cantidad)

**Relaciones:**
- ManyToOne con Pedido
- ManyToOne con Producto

---

## 6. DireccionEnvio (ShippingAddress)
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `userId`: Long (FK)
- `nombre`: String (NOT NULL)
- `apellido`: String (NOT NULL)
- `telefono`: String (NOT NULL)
- `direccion`: String (NOT NULL)
- `referencia`: Text
- `ciudad`: String (default: "Lima")
- `distrito`: String (NOT NULL)
- `codigoPostal`: String
- `esPrincipal`: Boolean (default: false)

**Relaciones:**
- ManyToOne con Usuario
- OneToOne con Pedido (para pedidos específicos)

---

## 7. InformacionPago (PaymentInfo)
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `pedidoId`: Long (FK)
- `metodoPago`: Enum (TARJETA, YAPE, PLIN, TRANSFERENCIA)
- `numeroTarjeta`: String (encriptado, últimos 4 dígitos)
- `titularTarjeta`: String
- `telefono`: String (para Yape/Plin)
- `banco`: String (para transferencias)
- `comprobanteUrl`: String (URL del archivo subido)
- `fechaPago`: LocalDateTime
- `estadoTransaccion`: String

**Relaciones:**
- OneToOne con Pedido

---

## 8. Review (Reseña)
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `productoId`: Long (FK)
- `userId`: Long (FK)
- `userName`: String (snapshot)
- `rating`: Integer (1-5)
- `titulo`: String
- `comentario`: Text
- `verificado`: Boolean (compra verificada)
- `helpful`: Integer (votos útiles, default: 0)
- `imagenes`: JSON/Text (array de URLs)
- `fechaCreacion`: LocalDateTime

**Relaciones:**
- ManyToOne con Producto
- ManyToOne con Usuario

---

## 9. Wishlist (Lista de Deseos)
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `userId`: Long (FK)
- `productoId`: Long (FK)
- `fechaAgregado`: LocalDateTime

**Relaciones:**
- ManyToOne con Usuario
- ManyToOne con Producto

---

## 10. Cupon (Coupon)
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `codigo`: String (UNIQUE, NOT NULL)
- `descuento`: BigDecimal (porcentaje o monto fijo)
- `tipoCupon`: Enum (PORCENTAJE, MONTO_FIJO)
- `minimoCompra`: BigDecimal (nullable)
- `fechaInicio`: LocalDate
- `fechaVencimiento`: LocalDate
- `usosMaximos`: Integer (nullable, -1 para ilimitado)
- `usosActuales`: Integer (default: 0)
- `activo`: Boolean (default: true)

**Relaciones:**
- OneToMany con Pedido (indirectamente por código)

---

## 11. Carrito (Cart) - Temporal/Sesión
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `userId`: Long (FK, nullable para invitados)
- `sessionId`: String (para usuarios no registrados)
- `fechaCreacion`: LocalDateTime
- `fechaActualizacion`: LocalDateTime

**Relaciones:**
- ManyToOne con Usuario
- OneToMany con ItemCarrito

---

## 12. ItemCarrito (CartItem)
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `carritoId`: Long (FK)
- `productoId`: Long (FK)
- `cantidad`: Integer (> 0)
- `fechaAgregado`: LocalDateTime

**Relaciones:**
- ManyToOne con Carrito
- ManyToOne con Producto

---

## 13. Configuracion (SystemConfig)
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `clave`: String (UNIQUE, NOT NULL)
- `valor`: Text
- `descripcion`: Text
- `tipo`: Enum (STRING, NUMBER, BOOLEAN, JSON)
- `fechaActualizacion`: LocalDateTime

**Configuraciones comunes:**
- `costo_envio_default`
- `iva_porcentaje`
- `email_soporte`
- `telefono_contacto`
- `direccion_principal`

---

## 14. Inventario (Inventory)
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `productoId`: Long (FK, UNIQUE)
- `stockActual`: Integer
- `stockMinimo`: Integer
- `stockMaximo`: Integer
- `ubicacion`: String
- `ultimaActualizacion`: LocalDateTime

**Relaciones:**
- OneToOne con Producto

---

## 15. MovimientoInventario (InventoryMovement)
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `productoId`: Long (FK)
- `tipo`: Enum (ENTRADA, SALIDA, AJUSTE, DEVOLUCION)
- `cantidad`: Integer
- `stockAnterior`: Integer
- `stockNuevo`: Integer
- `motivo`: String
- `usuario`: String (quien realizó el movimiento)
- `fecha`: LocalDateTime

**Relaciones:**
- ManyToOne con Producto

---

## 16. Factura (Invoice)
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `pedidoId`: Long (FK, UNIQUE)
- `numeroFactura`: String (UNIQUE)
- `rucEmpresa`: String
- `razonSocialEmpresa`: String
- `direccionEmpresa`: String
- `rucCliente`: String (nullable)
- `razonSocialCliente`: String (nullable)
- `fechaEmision`: LocalDate
- `subtotal`: BigDecimal
- `igv`: BigDecimal
- `total`: BigDecimal
- `archivoUrl`: String (PDF generado)

**Relaciones:**
- OneToOne con Pedido

---

## 17. Notificacion (Notification)
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `userId`: Long (FK)
- `tipo`: Enum (INFO, PEDIDO, PROMOCION, SISTEMA)
- `titulo`: String
- `mensaje`: Text
- `leida`: Boolean (default: false)
- `urlAccion`: String (nullable)
- `fechaCreacion`: LocalDateTime

**Relaciones:**
- ManyToOne con Usuario

---

## 18. Reporte (Report) - Opcional
**Atributos:**
- `id`: Long (PK, Auto-increment)
- `tipo`: Enum (VENTAS, INVENTARIO, USUARIOS, FINANCIERO)
- `fechaInicio`: LocalDate
- `fechaFin`: LocalDate
- `parametros`: JSON
- `archivoUrl`: String (reporte generado)
- `generadoPor`: Long (FK Usuario)
- `fechaGeneracion`: LocalDateTime

---

## Resumen de Relaciones Principales

### Usuario (1) → (N) Pedido
### Usuario (1) → (N) Review
### Usuario (1) → (N) Wishlist
### Usuario (1) → (N) DireccionEnvio
### Usuario (1) → (1) Carrito

### Producto (N) → (1) Categoria
### Producto (1) → (N) ItemPedido
### Producto (1) → (N) Review
### Producto (1) → (N) ItemCarrito
### Producto (1) → (1) Inventario

### Pedido (1) → (N) ItemPedido
### Pedido (1) → (1) DireccionEnvio
### Pedido (1) → (1) InformacionPago
### Pedido (1) → (1) Factura

### Carrito (1) → (N) ItemCarrito

---

## Notas de Implementación

1. **Seguridad:**
   - Contraseñas encriptadas con BCrypt
   - Tokens JWT para autenticación
   - Validación de roles y permisos

2. **Validaciones:**
   - DNI: 8 dígitos numéricos
   - Teléfono: 9 dígitos (formato peruano)
   - Email: formato válido
   - Precios: no negativos, 2 decimales

3. **Soft Delete:**
   - Implementar campo `activo` en lugar de eliminar físicamente
   - Aplica para: Usuario, Producto, Categoria

4. **Auditoría:**
   - Campos de timestamp en todas las entidades
   - Tracking de cambios importantes (MovimientoInventario)

5. **Optimizaciones:**
   - Índices en campos de búsqueda frecuente (email, dni, numeroPedido)
   - Caché para productos y categorías
   - Paginación en listados

6. **Archivos:**
   - Almacenar URLs, no archivos binarios en BD
   - Usar servicio de almacenamiento (AWS S3, Cloudinary, etc.)
