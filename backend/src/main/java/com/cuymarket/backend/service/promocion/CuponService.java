package com.cuymarket.backend.service.promocion;

import com.cuymarket.backend.model.enums.TipoCupon;
import com.cuymarket.backend.model.promocion.Cupon;
import com.cuymarket.backend.repository.promocion.CuponRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class CuponService {

    private final CuponRepository cuponRepository;

    // Crear cupón
    public Cupon crear(Cupon cupon) {
        // Validar código único
        if (cuponRepository.existsByCodigo(cupon.getCodigo())) {
            throw new RuntimeException("Ya existe un cupón con el código: " + cupon.getCodigo());
        }

        // Validar fechas
        if (cupon.getFechaInicio().isAfter(cupon.getFechaVencimiento())) {
            throw new RuntimeException("La fecha de inicio no puede ser posterior a la fecha de vencimiento");
        }

        // Validar descuento según tipo
        if (cupon.getTipoCupon() == TipoCupon.PORCENTAJE) {
            if (cupon.getDescuento().compareTo(BigDecimal.ZERO) <= 0 ||
                    cupon.getDescuento().compareTo(BigDecimal.valueOf(100)) > 0) {
                throw new RuntimeException("El porcentaje de descuento debe estar entre 1 y 100");
            }
        } else if (cupon.getTipoCupon() == TipoCupon.MONTO_FIJO) {
            if (cupon.getDescuento().compareTo(BigDecimal.ZERO) <= 0) {
                throw new RuntimeException("El monto de descuento debe ser mayor a 0");
            }
        }

        // Validar compra mínima
        if (cupon.getMinimoCompra() != null && cupon.getMinimoCompra().compareTo(BigDecimal.ZERO) < 0) {
            throw new RuntimeException("La compra mínima no puede ser negativa");
        }

        cupon.setUsosActuales(0);
        cupon.setActivo(true);

        return cuponRepository.save(cupon);
    }

    // Actualizar cupón
    public Cupon actualizar(Long id, Cupon cuponActualizado) {
        Cupon cupon = obtenerPorId(id);

        // Validar código único (si cambió)
        if (!cupon.getCodigo().equals(cuponActualizado.getCodigo())) {
            if (cuponRepository.existsByCodigo(cuponActualizado.getCodigo())) {
                throw new RuntimeException("Ya existe un cupón con el código: " + cuponActualizado.getCodigo());
            }
        }

        // Validar fechas
        if (cuponActualizado.getFechaInicio().isAfter(cuponActualizado.getFechaVencimiento())) {
            throw new RuntimeException("La fecha de inicio no puede ser posterior a la fecha de vencimiento");
        }

        cupon.setCodigo(cuponActualizado.getCodigo());
        cupon.setTipoCupon(cuponActualizado.getTipoCupon());
        cupon.setDescuento(cuponActualizado.getDescuento());
        cupon.setMinimoCompra(cuponActualizado.getMinimoCompra());
        cupon.setUsosMaximos(cuponActualizado.getUsosMaximos());
        cupon.setFechaInicio(cuponActualizado.getFechaInicio());
        cupon.setFechaVencimiento(cuponActualizado.getFechaVencimiento());

        return cuponRepository.save(cupon);
    }

    // Cambiar estado
    public Cupon cambiarEstado(Long id, Boolean activo) {
        Cupon cupon = obtenerPorId(id);
        cupon.setActivo(activo);
        return cuponRepository.save(cupon);
    }

    // Incrementar usos
    public Cupon incrementarUsos(Long id) {
        Cupon cupon = obtenerPorId(id);

        if (cupon.getUsosMaximos() != null && cupon.getUsosActuales() >= cupon.getUsosMaximos()) {
            throw new RuntimeException("El cupón ha alcanzado el límite de usos");
        }

        cupon.setUsosActuales(cupon.getUsosActuales() + 1);
        return cuponRepository.save(cupon);
    }

    // Validar cupón
    @Transactional(readOnly = true)
    public boolean validarCupon(String codigo, BigDecimal montoCompra) {
        Cupon cupon = cuponRepository.findByCodigo(codigo).orElse(null);

        if (cupon == null) {
            return false;
        }

        // Verificar estado activo
        if (!cupon.getActivo()) {
            return false;
        }

        // Verificar fechas
        LocalDate hoy = LocalDate.now();
        if (hoy.isBefore(cupon.getFechaInicio()) || hoy.isAfter(cupon.getFechaVencimiento())) {
            return false;
        }

        // Verificar usos
        if (cupon.getUsosMaximos() != null && cupon.getUsosActuales() >= cupon.getUsosMaximos()) {
            return false;
        }

        // Verificar compra mínima
        if (cupon.getMinimoCompra() != null && montoCompra.compareTo(cupon.getMinimoCompra()) < 0) {
            return false;
        }

        return true;
    }

    // Calcular descuento
    @Transactional(readOnly = true)
    public BigDecimal calcularDescuento(String codigo, BigDecimal montoCompra) {
        Cupon cupon = obtenerPorCodigo(codigo);

        if (!validarCupon(codigo, montoCompra)) {
            throw new RuntimeException("El cupón no es válido o no cumple los requisitos");
        }

        if (cupon.getTipoCupon() == TipoCupon.PORCENTAJE) {
            return montoCompra.multiply(cupon.getDescuento().divide(BigDecimal.valueOf(100)));
        } else {
            return cupon.getDescuento().min(montoCompra); // No puede ser mayor al monto
        }
    }

    // Consultas
    @Transactional(readOnly = true)
    public Cupon obtenerPorId(Long id) {
        return cuponRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cupón no encontrado con ID: " + id));
    }

    @Transactional(readOnly = true)
    public Cupon obtenerPorCodigo(String codigo) {
        return cuponRepository.findByCodigo(codigo)
                .orElseThrow(() -> new RuntimeException("Cupón no encontrado con código: " + codigo));
    }

    @Transactional(readOnly = true)
    public List<Cupon> listarTodos() {
        return cuponRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Cupon> listarActivos() {
        return cuponRepository.findByActivo(true);
    }

    @Transactional(readOnly = true)
    public List<Cupon> listarVigentes() {
        LocalDate hoy = LocalDate.now();
        return cuponRepository.findCuponesVigentes(hoy);
    }

    @Transactional(readOnly = true)
    public List<Cupon> listarDisponibles() {
        LocalDate hoy = LocalDate.now();
        return cuponRepository.findCuponesDisponibles(hoy);
    }

    @Transactional(readOnly = true)
    public List<Cupon> listarVencidos() {
        LocalDate hoy = LocalDate.now();
        return cuponRepository.findCuponesVencidos(hoy);
    }

    @Transactional(readOnly = true)
    public List<Cupon> listarAgotados() {
        return cuponRepository.findCuponesAgotados();
    }

    @Transactional(readOnly = true)
    public List<Cupon> listarPorTipo(TipoCupon tipo) {
        return cuponRepository.findByTipoCupon(tipo);
    }

    @Transactional(readOnly = true)
    public Long contarVigentes() {
        LocalDate hoy = LocalDate.now();
        return cuponRepository.contarCuponesVigentes(hoy);
    }

    @Transactional(readOnly = true)
    public boolean existeCodigo(String codigo) {
        return cuponRepository.existsByCodigo(codigo);
    }

    // Eliminar
    public void eliminar(Long id) {
        Cupon cupon = obtenerPorId(id);
        cuponRepository.delete(cupon);
    }

    // Desactivar cupones vencidos (tarea programada)
    @Transactional
    public void desactivarCuponesVencidos() {
        List<Cupon> cuponesVencidos = listarVencidos();
        for (Cupon cupon : cuponesVencidos) {
            if (cupon.getActivo()) {
                cupon.setActivo(false);
                cuponRepository.save(cupon);
            }
        }
    }
}
