package com.cuymarket.backend.controller;

import com.cuymarket.backend.dto.dashboard.DashboardResumenDTO;
import com.cuymarket.backend.service.sistema.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/resumen")
    @PreAuthorize("hasAnyRole('ADMIN')")
    public ResponseEntity<DashboardResumenDTO> obtenerResumen() {
        return ResponseEntity.ok(dashboardService.obtenerResumen());
    }
}
