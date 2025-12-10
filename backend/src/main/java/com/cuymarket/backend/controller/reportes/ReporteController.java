package com.cuymarket.backend.controller.reportes;

import com.cuymarket.backend.dto.sistema.ReporteResponse;
import com.cuymarket.backend.model.usuario.Usuario;
import com.cuymarket.backend.repository.usuario.UsuarioRepository;
import com.cuymarket.backend.service.reportes.ReporteService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/reportes")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:4200")
public class ReporteController {

    private final ReporteService reporteService;
    private final UsuarioRepository usuarioRepository;

    @GetMapping("/ventas")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    public ResponseEntity<byte[]> generarReporteVentas(
            @RequestParam String formato,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            Authentication authentication
    ) {
        try {
            // Si no se especifican fechas, usar el mes actual
            LocalDateTime inicio = (fechaInicio != null) ? fechaInicio.atStartOfDay() : LocalDate.now().withDayOfMonth(1).atStartOfDay();
            LocalDateTime fin = (fechaFin != null) ? fechaFin.atTime(23, 59, 59) : LocalDate.now().atTime(23, 59, 59);

            // Obtener ID del usuario autenticado
            Long usuarioId = obtenerUsuarioId(authentication);

            byte[] reporte;
            String contentType;
            String extension;

            if ("PDF".equalsIgnoreCase(formato)) {
                reporte = reporteService.generarReporteVentasPDF(inicio, fin, usuarioId);
                contentType = "application/pdf";
                extension = ".pdf";
            } else if ("EXCEL".equalsIgnoreCase(formato)) {
                reporte = reporteService.generarReporteVentasExcel(inicio, fin, usuarioId);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                extension = ".xlsx";
            } else {
                return ResponseEntity.badRequest().build();
            }

            String filename = "Reporte_Ventas_" + LocalDate.now() + extension;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(reporte.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(reporte);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/inventario")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    public ResponseEntity<byte[]> generarReporteInventario(
            @RequestParam String formato,
            Authentication authentication
    ) {
        try {
            // Obtener ID del usuario autenticado
            Long usuarioId = obtenerUsuarioId(authentication);

            byte[] reporte;
            String contentType;
            String extension;

            if ("PDF".equalsIgnoreCase(formato)) {
                reporte = reporteService.generarReporteInventarioPDF(usuarioId);
                contentType = "application/pdf";
                extension = ".pdf";
            } else if ("EXCEL".equalsIgnoreCase(formato)) {
                reporte = reporteService.generarReporteInventarioExcel(usuarioId);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                extension = ".xlsx";
            } else {
                return ResponseEntity.badRequest().build();
            }

            String filename = "Reporte_Inventario_" + LocalDate.now() + extension;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(reporte.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(reporte);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/pedidos")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    public ResponseEntity<byte[]> generarReportePedidos(
            @RequestParam String formato,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            Authentication authentication
    ) {
        try {
            // Si no se especifican fechas, usar la última semana
            LocalDateTime inicio = (fechaInicio != null) ? fechaInicio.atStartOfDay() : LocalDate.now().minusDays(7).atStartOfDay();
            LocalDateTime fin = (fechaFin != null) ? fechaFin.atTime(23, 59, 59) : LocalDate.now().atTime(23, 59, 59);

            Long usuarioId = obtenerUsuarioId(authentication);

            byte[] reporte;
            String contentType;
            String extension;

            if ("PDF".equalsIgnoreCase(formato)) {
                reporte = reporteService.generarReportePedidosPDF(inicio, fin, usuarioId);
                contentType = "application/pdf";
                extension = ".pdf";
            } else if ("EXCEL".equalsIgnoreCase(formato)) {
                reporte = reporteService.generarReportePedidosExcel(inicio, fin, usuarioId);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                extension = ".xlsx";
            } else {
                return ResponseEntity.badRequest().build();
            }

            String filename = "Reporte_Pedidos_" + LocalDate.now() + extension;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(reporte.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(reporte);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/clientes")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    public ResponseEntity<byte[]> generarReporteClientes(
            @RequestParam String formato,
            Authentication authentication
    ) {
        try {
            Long usuarioId = obtenerUsuarioId(authentication);

            byte[] reporte;
            String contentType;
            String extension;

            if ("PDF".equalsIgnoreCase(formato)) {
                reporte = reporteService.generarReporteClientesPDF(usuarioId);
                contentType = "application/pdf";
                extension = ".pdf";
            } else if ("EXCEL".equalsIgnoreCase(formato)) {
                reporte = reporteService.generarReporteClientesExcel(usuarioId);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                extension = ".xlsx";
            } else {
                return ResponseEntity.badRequest().build();
            }

            String filename = "Reporte_Clientes_" + LocalDate.now() + extension;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(reporte.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(reporte);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    @GetMapping("/historial")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    public ResponseEntity<List<ReporteResponse>> listarHistorial() {
        List<ReporteResponse> reportes = reporteService.listarTodos();
        System.out.println("Historial solicitado - Total reportes: " + reportes.size());
        return ResponseEntity.ok(reportes);
    }

    @GetMapping("/recientes")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    public ResponseEntity<List<ReporteResponse>> listarRecientes() {
        List<ReporteResponse> reportes = reporteService.listarRecientes();
        System.out.println("Recientes solicitados - Total reportes: " + reportes.size());
        return ResponseEntity.ok(reportes);
    }

    @GetMapping("/pedidos-completados")
    @PreAuthorize("hasAnyRole('ADMIN', 'EMPLEADO')")
    public ResponseEntity<byte[]> generarReportePedidosCompletados(
            @RequestParam String formato,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaInicio,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fechaFin,
            Authentication authentication
    ) {
        try {
            // Si no se especifican fechas, usar el día actual
            LocalDateTime inicio = (fechaInicio != null) ? fechaInicio.atStartOfDay() : LocalDate.now().atStartOfDay();
            LocalDateTime fin = (fechaFin != null) ? fechaFin.atTime(23, 59, 59) : LocalDate.now().atTime(23, 59, 59);

            Long usuarioId = obtenerUsuarioId(authentication);

            byte[] reporte;
            String contentType;
            String extension;

            if ("PDF".equalsIgnoreCase(formato)) {
                reporte = reporteService.generarReportePedidosCompletadosPDF(inicio, fin, usuarioId);
                contentType = "application/pdf";
                extension = ".pdf";
            } else if ("EXCEL".equalsIgnoreCase(formato)) {
                reporte = reporteService.generarReportePedidosCompletadosExcel(inicio, fin, usuarioId);
                contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                extension = ".xlsx";
            } else {
                return ResponseEntity.badRequest().build();
            }

            String filename = "Reporte_Pedidos_Completados_" + LocalDate.now() + extension;
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", filename);
            headers.setContentLength(reporte.length);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(reporte);

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    private Long obtenerUsuarioId(Authentication authentication) {
        String email = authentication.getName();
        return usuarioRepository.findByEmail(email)
                .map(Usuario::getId)
                .orElseThrow(() -> new RuntimeException("Usuario autenticado no encontrado"));
    }
}
