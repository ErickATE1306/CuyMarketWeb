package com.cuymarket.backend.controller;

import com.cuymarket.backend.dto.finanzas.FinanzasResumenDTO;
import com.cuymarket.backend.service.finanzas.FinanzasService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/finanzas")
@RequiredArgsConstructor
public class FinanzasController {

    private final FinanzasService finanzasService;

    @GetMapping("/resumen")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    public ResponseEntity<FinanzasResumenDTO> obtenerResumen() {
        FinanzasResumenDTO resumen = finanzasService.obtenerResumenFinanzas();
        return ResponseEntity.ok(resumen);
    }
}
