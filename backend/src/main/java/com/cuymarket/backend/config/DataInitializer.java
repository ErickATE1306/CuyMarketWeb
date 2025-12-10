package com.cuymarket.backend.config;

import com.cuymarket.backend.model.carrito.Carrito;
import com.cuymarket.backend.model.enums.NombreRol;
import com.cuymarket.backend.model.producto.Categoria;
import com.cuymarket.backend.model.producto.Producto;
import com.cuymarket.backend.model.usuario.Rol;
import com.cuymarket.backend.model.usuario.Usuario;
import com.cuymarket.backend.repository.carrito.CarritoRepository;
import com.cuymarket.backend.repository.producto.CategoriaRepository;
import com.cuymarket.backend.repository.producto.ProductoRepository;
import com.cuymarket.backend.repository.usuario.RolRepository;
import com.cuymarket.backend.repository.usuario.UsuarioRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RolRepository rolRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final ProductoRepository productoRepository;
    private final CarritoRepository carritoRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Inicializar Roles
        if (rolRepository.count() == 0) {
            inicializarRoles();
        }

        // Inicializar Usuarios
        if (!usuarioRepository.existsByEmail("admin@cuymarket.com")) {
            inicializarAdmin();
        }
        if (!usuarioRepository.existsByEmail("empleado@cuymarket.com")) {
            inicializarEmpleado();
        }
        if (!usuarioRepository.existsByEmail("cliente@cuymarket.com")) {
            inicializarCliente();
        }

        // Inicializar Categorías y Productos
        if (categoriaRepository.count() == 0) {
            inicializarCategoriasYProductos();
        }
    }

    private void inicializarRoles() {
        for (NombreRol nombre : NombreRol.values()) {
            if (!rolRepository.existsByNombre(nombre)) {
                Rol rol = new Rol();
                rol.setNombre(nombre);
                rolRepository.save(rol);
                System.out.println("Rol creado: " + nombre);
            }
        }
    }

    private void inicializarAdmin() {
        Rol rolAdmin = rolRepository.findByNombre(NombreRol.ADMIN)
                .orElseThrow(() -> new RuntimeException("Error: Rol ADMIN no encontrado."));

        Usuario admin = new Usuario();
        admin.setNombre("Administrador");
        admin.setApellido("Sistema");
        admin.setEmail("admin@cuymarket.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setTelefono("999999999");
        admin.setDni("00000000");
        admin.setRoles(Set.of(rolAdmin));
        admin.setActivo(true);
        admin.setEmailVerificado(true);

        Usuario adminGuardado = usuarioRepository.save(admin);
        
        // Crear carrito para admin
        Carrito carritoAdmin = new Carrito();
        carritoAdmin.setUsuario(adminGuardado);
        carritoRepository.save(carritoAdmin);
        
        System.out.println("Usuario Admin creado: admin@cuymarket.com / admin123");
    }

    private void inicializarEmpleado() {
        Rol rolEmpleado = rolRepository.findByNombre(NombreRol.EMPLEADO)
                .orElseThrow(() -> new RuntimeException("Error: Rol EMPLEADO no encontrado."));

        Usuario empleado = new Usuario();
        empleado.setNombre("Juan");
        empleado.setApellido("Pérez");
        empleado.setEmail("empleado@cuymarket.com");
        empleado.setPassword(passwordEncoder.encode("empleado123"));
        empleado.setTelefono("987654321");
        empleado.setDni("12345678");
        empleado.setRoles(Set.of(rolEmpleado));
        empleado.setActivo(true);
        empleado.setEmailVerificado(true);

        Usuario empleadoGuardado = usuarioRepository.save(empleado);
        
        // Crear carrito para empleado
        Carrito carritoEmpleado = new Carrito();
        carritoEmpleado.setUsuario(empleadoGuardado);
        carritoRepository.save(carritoEmpleado);
        
        System.out.println("Usuario Empleado creado: empleado@cuymarket.com / empleado123");
    }

    private void inicializarCliente() {
        Rol rolCliente = rolRepository.findByNombre(NombreRol.CLIENTE)
                .orElseThrow(() -> new RuntimeException("Error: Rol CLIENTE no encontrado."));

        Usuario cliente = new Usuario();
        cliente.setNombre("María");
        cliente.setApellido("García");
        cliente.setEmail("cliente@cuymarket.com");
        cliente.setPassword(passwordEncoder.encode("cliente123"));
        cliente.setTelefono("998877665");
        cliente.setDni("87654321");
        cliente.setRoles(Set.of(rolCliente));
        cliente.setActivo(true);
        cliente.setEmailVerificado(true);

        Usuario clienteGuardado = usuarioRepository.save(cliente);
        
        // Crear carrito para cliente
        Carrito carritoCliente = new Carrito();
        carritoCliente.setUsuario(clienteGuardado);
        carritoRepository.save(carritoCliente);
        
        System.out.println("Usuario Cliente creado: cliente@cuymarket.com / cliente123");
    }

    private void inicializarCategoriasYProductos() {
        // Categoría 1: Cuyes Reproductores
        Categoria categoriaReproductores = new Categoria();
        categoriaReproductores.setNombre("Cuyes Reproductores");
        categoriaReproductores.setDescripcion("Cuyes seleccionados para reproducción de alta calidad");
        categoriaReproductores.setActiva(true);
        categoriaReproductores = categoriaRepository.save(categoriaReproductores);
        System.out.println("Categoría creada: Cuyes Reproductores");

        // Productos de Cuyes Reproductores
        crearProducto("Cuy Reproductor Macho Premium", "Peru", "1.2kg", new BigDecimal("120.00"),
                "Reproductor", true, "Cuy macho de alta calidad genética para reproducción",
                "Edad: 4-6 meses, Peso: 1.2kg, Raza: Peru mejorada", 15, 5, categoriaReproductores);

        crearProducto("Cuy Reproductor Hembra Premium", "Peru", "1.0kg", new BigDecimal("100.00"),
                "Reproductor", true, "Cuy hembra de excelente línea genética",
                "Edad: 4-6 meses, Peso: 1.0kg, Alta fertilidad", 20, 5, categoriaReproductores);

        crearProducto("Pareja Reproductora Peru", "Peru", "2.2kg", new BigDecimal("200.00"),
                "Pareja", true, "Pareja seleccionada de cuyes reproductores",
                "1 macho + 1 hembra, Certificado de pureza genética", 10, 3, categoriaReproductores);

        // Categoría 2: Cuyes para Consumo
        Categoria categoriaConsumo = new Categoria();
        categoriaConsumo.setNombre("Cuyes para Consumo");
        categoriaConsumo.setDescripcion("Cuyes de excelente calidad para consumo alimenticio");
        categoriaConsumo.setActiva(true);
        categoriaConsumo = categoriaRepository.save(categoriaConsumo);
        System.out.println("Categoría creada: Cuyes para Consumo");

        // Productos de Cuyes para Consumo
        crearProducto("Cuy Entero Grande", "Criollo", "1.5kg", new BigDecimal("50.00"),
                "Consumo", false, "Cuy entero listo para preparación",
                "Peso: 1.5kg, Criado naturalmente, Alimentación orgánica", 30, 10, categoriaConsumo);

        crearProducto("Cuy Mediano", "Criollo", "1.0kg", new BigDecimal("35.00"),
                "Consumo", false, "Cuy de tamaño mediano ideal para 2-3 personas",
                "Peso: 1.0kg, Fresco, Listo para cocinar", 40, 10, categoriaConsumo);

        crearProducto("Cuy Extra Grande", "Andino", "2.0kg", new BigDecimal("70.00"),
                "Consumo", false, "Cuy de gran tamaño para eventos especiales",
                "Peso: 2.0kg, Excelente sabor, Calidad premium", 25, 8, categoriaConsumo);

        System.out.println("Productos inicializados correctamente");
    }

    private void crearProducto(String nombre, String raza, String peso, BigDecimal precio,
                               String tipo, Boolean certificado, String descripcion,
                               String caracteristicas, Integer stock, Integer stockMinimo,
                               Categoria categoria) {
        Producto producto = new Producto();
        producto.setNombre(nombre);
        producto.setRaza(raza);
        producto.setPeso(peso);
        producto.setPrecio(precio);
        producto.setTipo(tipo);
        producto.setCertificado(certificado);
        producto.setDescripcion(descripcion);
        producto.setCaracteristicas(caracteristicas);
        producto.setStockDisponible(stock);
        producto.setStockMinimo(stockMinimo);
        producto.setActivo(true);
        producto.setCategoria(categoria);
        productoRepository.save(producto);
    }
}
