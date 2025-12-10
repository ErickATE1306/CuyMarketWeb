package com.cuymarket.backend.controller;

import com.cuymarket.backend.dto.cupon.CuponRequest;
import com.cuymarket.backend.dto.cupon.CuponResponse;
import com.cuymarket.backend.dto.cupon.ValidarCuponRequest;
import com.cuymarket.backend.model.enums.TipoCupon;
import com.cuymarket.backend.model.promocion.Cupon;
import com.cuymarket.backend.service.promocion.CuponService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/cupones")
@RequiredArgsConstructor
public class CuponController {

    private final CuponService cuponService;

    @PostMapping("/validar")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<CuponResponse> validarCupon(@Valid @RequestBody ValidarCuponRequest request) {
        Cupon cupon = cuponService.obtenerPorCodigo(request.getCodigo());
        return ResponseEntity.ok(convertirAResponse(cupon));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CuponResponse> crearCupon(@Valid @RequestBody CuponRequest request) {
        Cupon cupon = convertirAEntidad(request);
        Cupon cuponCreado = cuponService.crear(cupon);
        return ResponseEntity.ok(convertirAResponse(cuponCreado));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CuponResponse>> listarCupones() {
        List<Cupon> cupones = cuponService.listarTodos();
        List<CuponResponse> response = cupones.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/vigentes")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<CuponResponse>> listarCuponesVigentes() {
        List<Cupon> cupones = cuponService.listarVigentes();
        List<CuponResponse> response = cupones.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    private CuponResponse convertirAResponse(Cupon cupon) {
        boolean vigente = cupon.getActivo() && cupon.getFechaVencimiento().isAfter(java.time.LocalDate.now());
        return new CuponResponse(
                cupon.getId(),
                cupon.getCodigo(),
                cupon.getTipoCupon().name(),
                cupon.getDescuento(),
                cupon.getMinimoCompra(),
                cupon.getUsosMaximos(),
                cupon.getUsosActuales(),
                cupon.getFechaVencimiento(),
                cupon.getActivo(),
                vigente);
    }

    private Cupon convertirAEntidad(CuponRequest request) {
        Cupon cupon = new Cupon();
        cupon.setCodigo(request.getCodigo());
        cupon.setTipoCupon(TipoCupon.valueOf(request.getTipoDescuento()));
        cupon.setDescuento(request.getValorDescuento());
        cupon.setMinimoCompra(request.getMinimoCompra());
        cupon.setUsosMaximos(request.getUsoMaximo());
        cupon.setFechaInicio(java.time.LocalDate.now());
        cupon.setFechaVencimiento(request.getFechaVencimiento());
        cupon.setActivo(request.getActivo());
        cupon.setUsosActuales(0);
        return cupon;
    }
}
