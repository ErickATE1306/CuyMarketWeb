package com.cuymarket.backend.service.usuario;

import com.cuymarket.backend.model.enums.NombreRol;
import com.cuymarket.backend.model.usuario.Rol;
import com.cuymarket.backend.repository.usuario.RolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class RolService {
    
    private final RolRepository rolRepository;
    
    // Crear rol
    public Rol crear(Rol rol) {
        if (rolRepository.existsByNombre(rol.getNombre())) {
            throw new RuntimeException("El rol " + rol.getNombre() + " ya existe");
        }
        return rolRepository.save(rol);
    }
    
    // Actualizar rol
    public Rol actualizar(Long id, Rol rolActualizado) {
        Rol rol = obtenerPorId(id);
        
        // Verificar que el nuevo nombre no exista (si cambió)
        if (!rol.getNombre().equals(rolActualizado.getNombre())) {
            if (rolRepository.existsByNombre(rolActualizado.getNombre())) {
                throw new RuntimeException("El rol " + rolActualizado.getNombre() + " ya existe");
            }
        }
        
        rol.setNombre(rolActualizado.getNombre());
        rol.setDescripcion(rolActualizado.getDescripcion());
        
        return rolRepository.save(rol);
    }
    
    // Consultas
    @Transactional(readOnly = true)
    public Rol obtenerPorId(Long id) {
        return rolRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado con ID: " + id));
    }
    
    @Transactional(readOnly = true)
    public Rol obtenerPorNombre(NombreRol nombre) {
        return rolRepository.findByNombre(nombre)
            .orElseThrow(() -> new RuntimeException("Rol no encontrado: " + nombre));
    }
    
    @Transactional(readOnly = true)
    public List<Rol> listarTodos() {
        return rolRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public boolean existe(NombreRol nombre) {
        return rolRepository.existsByNombre(nombre);
    }
    
    // Eliminar
    public void eliminar(Long id) {
        Rol rol = obtenerPorId(id);
        
        // Verificar que no sea un rol del sistema
        if (rol.getNombre() == NombreRol.CLIENTE || 
            rol.getNombre() == NombreRol.EMPLEADO || 
            rol.getNombre() == NombreRol.ADMIN) {
            throw new RuntimeException("No se puede eliminar un rol del sistema");
        }
        
        rolRepository.delete(rol);
    }
    
    // Inicializar roles por defecto (útil para primera ejecución)
    public void inicializarRoles() {
        if (!rolRepository.existsByNombre(NombreRol.CLIENTE)) {
            Rol rolCliente = new Rol();
            rolCliente.setNombre(NombreRol.CLIENTE);
            rolCliente.setDescripcion("Usuario cliente del sistema");
            rolRepository.save(rolCliente);
        }
        
        if (!rolRepository.existsByNombre(NombreRol.EMPLEADO)) {
            Rol rolEmpleado = new Rol();
            rolEmpleado.setNombre(NombreRol.EMPLEADO);
            rolEmpleado.setDescripcion("Empleado con acceso a gestión de inventario y pedidos");
            rolRepository.save(rolEmpleado);
        }
        
        if (!rolRepository.existsByNombre(NombreRol.ADMIN)) {
            Rol rolAdmin = new Rol();
            rolAdmin.setNombre(NombreRol.ADMIN);
            rolAdmin.setDescripcion("Administrador con acceso completo al sistema");
            rolRepository.save(rolAdmin);
        }
    }
}
