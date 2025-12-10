package com.cuymarket.backend.service.reportes;

import com.cuymarket.backend.dto.sistema.ReporteResponse;
import com.cuymarket.backend.model.enums.EstadoPago;
import com.cuymarket.backend.model.enums.TipoReporte;
import com.cuymarket.backend.model.pedido.Pedido;
import com.cuymarket.backend.model.producto.Producto;
import com.cuymarket.backend.model.sistema.Reporte;
import com.cuymarket.backend.model.usuario.Usuario;
import com.cuymarket.backend.repository.pedido.PedidoRepository;
import com.cuymarket.backend.repository.producto.ProductoRepository;
import com.cuymarket.backend.repository.sistema.ReporteRepository;
import com.cuymarket.backend.repository.usuario.UsuarioRepository;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReporteService {

    private final PedidoRepository pedidoRepository;
    private final ProductoRepository productoRepository;
    private final ReporteRepository reporteRepository;
    private final UsuarioRepository usuarioRepository;

    // ==================== REPORTES DE VENTAS ====================
    
    public byte[] generarReporteVentasPDF(LocalDateTime fechaInicio, LocalDateTime fechaFin, Long usuarioId) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Título
        Paragraph title = new Paragraph("REPORTE DE VENTAS")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Período
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        Paragraph periodo = new Paragraph(
                "Período: " + fechaInicio.format(formatter) + " - " + fechaFin.format(formatter))
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(periodo);
        document.add(new Paragraph("\n"));

        // Obtener pedidos pagados del período
        List<Pedido> pedidos = pedidoRepository.findByEstadoPagoAndFechaPedidoAfter(EstadoPago.PAGADO, fechaInicio)
                .stream()
                .filter(p -> p.getFechaPedido().isBefore(fechaFin))
                .toList();

        // Tabla de ventas
        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 3, 2, 2, 2}))
                .useAllAvailableWidth();

        // Encabezados
        table.addHeaderCell("Número Pedido");
        table.addHeaderCell("Cliente");
        table.addHeaderCell("Fecha");
        table.addHeaderCell("Método Pago");
        table.addHeaderCell("Total");

        BigDecimal totalVentas = BigDecimal.ZERO;
        
        for (Pedido pedido : pedidos) {
            table.addCell(pedido.getNumeroPedido());
            table.addCell(obtenerNombreCliente(pedido));
            table.addCell(pedido.getFechaPedido().format(formatter));
            table.addCell(pedido.getMetodoPago() != null ? pedido.getMetodoPago().name() : "N/A");
            table.addCell("S/ " + pedido.getTotal().toString());
            totalVentas = totalVentas.add(pedido.getTotal());
        }

        document.add(table);

        // Total
        document.add(new Paragraph("\n"));
        Paragraph total = new Paragraph("TOTAL VENTAS: S/ " + totalVentas.toString())
                .setFontSize(14)
                .setBold()
                .setTextAlignment(TextAlignment.RIGHT);
        document.add(total);

        Paragraph cantidadPedidos = new Paragraph("Cantidad de pedidos: " + pedidos.size())
                .setFontSize(12)
                .setTextAlignment(TextAlignment.RIGHT);
        document.add(cantidadPedidos);

        document.close();
        
        // Guardar registro en BD
        guardarRegistroReporte(TipoReporte.VENTAS, "PDF", usuarioId);
        
        return baos.toByteArray();
    }

    public byte[] generarReporteVentasExcel(LocalDateTime fechaInicio, LocalDateTime fechaFin, Long usuarioId) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Reporte de Ventas");

        // Estilos
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // Título
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("REPORTE DE VENTAS");
        
        // Período
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        Row periodoRow = sheet.createRow(1);
        periodoRow.createCell(0).setCellValue(
                "Período: " + fechaInicio.format(formatter) + " - " + fechaFin.format(formatter));

        // Encabezados (fila 3)
        Row headerRow = sheet.createRow(3);
        String[] headers = {"Número Pedido", "Cliente", "Fecha", "Método Pago", "Total"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Obtener pedidos
        List<Pedido> pedidos = pedidoRepository.findByEstadoPagoAndFechaPedidoAfter(EstadoPago.PAGADO, fechaInicio)
                .stream()
                .filter(p -> p.getFechaPedido().isBefore(fechaFin))
                .toList();

        // Datos
        int rowNum = 4;
        BigDecimal totalVentas = BigDecimal.ZERO;
        
        for (Pedido pedido : pedidos) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(pedido.getNumeroPedido());
            row.createCell(1).setCellValue(obtenerNombreCliente(pedido));
            row.createCell(2).setCellValue(pedido.getFechaPedido().format(formatter));
            row.createCell(3).setCellValue(pedido.getMetodoPago() != null ? pedido.getMetodoPago().name() : "N/A");
            row.createCell(4).setCellValue("S/ " + pedido.getTotal().toString());
            totalVentas = totalVentas.add(pedido.getTotal());
        }

        // Totales
        rowNum++;
        Row totalRow = sheet.createRow(rowNum);
        totalRow.createCell(3).setCellValue("TOTAL:");
        Cell totalCell = totalRow.createCell(4);
        totalCell.setCellValue("S/ " + totalVentas.toString());
        totalCell.setCellStyle(headerStyle);

        Row cantidadRow = sheet.createRow(rowNum + 1);
        cantidadRow.createCell(3).setCellValue("Cantidad:");
        cantidadRow.createCell(4).setCellValue(pedidos.size());

        // Ajustar anchos de columna
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        
        // Guardar registro en BD
        guardarRegistroReporte(TipoReporte.VENTAS, "EXCEL", usuarioId);
        
        return baos.toByteArray();
    }

    // ==================== REPORTES DE INVENTARIO ====================
    
    public byte[] generarReporteInventarioPDF(Long usuarioId) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Título
        Paragraph title = new Paragraph("REPORTE DE INVENTARIO")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        Paragraph fecha = new Paragraph("Fecha: " + LocalDate.now().format(formatter))
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(fecha);
        document.add(new Paragraph("\n"));

        // Obtener productos activos
        List<Producto> productos = productoRepository.findByActivo(true);

        // Tabla
        Table table = new Table(UnitValue.createPercentArray(new float[]{4, 2, 2, 2, 2}))
                .useAllAvailableWidth();

        table.addHeaderCell("Producto");
        table.addHeaderCell("Stock Actual");
        table.addHeaderCell("Stock Mínimo");
        table.addHeaderCell("Precio");
        table.addHeaderCell("Estado");

        int totalStock = 0;
        int productosStockBajo = 0;
        
        for (Producto producto : productos) {
            table.addCell(producto.getNombre());
            table.addCell(producto.getStockDisponible().toString());
            table.addCell(producto.getStockMinimo().toString());
            table.addCell("S/ " + producto.getPrecio().toString());
            
            String estado = producto.getStockDisponible() <= producto.getStockMinimo() ? "BAJO" : "OK";
            if ("BAJO".equals(estado)) productosStockBajo++;
            table.addCell(estado);
            
            totalStock += producto.getStockDisponible();
        }

        document.add(table);

        // Resumen
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("Total productos: " + productos.size()).setFontSize(12));
        document.add(new Paragraph("Stock total: " + totalStock).setFontSize(12));
        document.add(new Paragraph("Productos con stock bajo: " + productosStockBajo).setFontSize(12).setBold());

        document.close();
        
        // Guardar registro en BD
        guardarRegistroReporte(TipoReporte.INVENTARIO, "PDF", usuarioId);
        
        return baos.toByteArray();
    }

    public byte[] generarReporteInventarioExcel(Long usuarioId) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Reporte de Inventario");

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // Título
        Row titleRow = sheet.createRow(0);
        titleRow.createCell(0).setCellValue("REPORTE DE INVENTARIO");
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        Row fechaRow = sheet.createRow(1);
        fechaRow.createCell(0).setCellValue("Fecha: " + LocalDate.now().format(formatter));

        // Encabezados
        Row headerRow = sheet.createRow(3);
        String[] headers = {"Producto", "Stock Actual", "Stock Mínimo", "Precio", "Estado"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Productos
        List<Producto> productos = productoRepository.findByActivo(true);
        int rowNum = 4;
        int totalStock = 0;
        int productosStockBajo = 0;

        for (Producto producto : productos) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(producto.getNombre());
            row.createCell(1).setCellValue(producto.getStockDisponible());
            row.createCell(2).setCellValue(producto.getStockMinimo());
            row.createCell(3).setCellValue("S/ " + producto.getPrecio().toString());
            
            String estado = producto.getStockDisponible() <= producto.getStockMinimo() ? "BAJO" : "OK";
            if ("BAJO".equals(estado)) productosStockBajo++;
            row.createCell(4).setCellValue(estado);
            
            totalStock += producto.getStockDisponible();
        }

        // Resumen
        rowNum++;
        sheet.createRow(rowNum++).createCell(0).setCellValue("Total productos: " + productos.size());
        sheet.createRow(rowNum++).createCell(0).setCellValue("Stock total: " + totalStock);
        Row stockBajoRow = sheet.createRow(rowNum);
        Cell stockBajoCell = stockBajoRow.createCell(0);
        stockBajoCell.setCellValue("Productos con stock bajo: " + productosStockBajo);
        stockBajoCell.setCellStyle(headerStyle);

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        
        // Guardar registro en BD
        guardarRegistroReporte(TipoReporte.INVENTARIO, "EXCEL", usuarioId);
        
        return baos.toByteArray();
    }

    // ==================== REPORTES DE PEDIDOS ====================
    
    public byte[] generarReportePedidosPDF(LocalDateTime fechaInicio, LocalDateTime fechaFin, Long usuarioId) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Título
        Paragraph title = new Paragraph("REPORTE DE PEDIDOS")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Período
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        Paragraph periodo = new Paragraph(
                "Período: " + fechaInicio.format(formatter) + " - " + fechaFin.format(formatter))
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(periodo);
        document.add(new Paragraph("\n"));

        // Obtener todos los pedidos del período
        List<Pedido> pedidos = pedidoRepository.findAll().stream()
                .filter(p -> p.getFechaPedido().isAfter(fechaInicio) && p.getFechaPedido().isBefore(fechaFin))
                .toList();

        // Tabla de pedidos
        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 2, 2, 2, 2, 2}))
                .useAllAvailableWidth();

        // Encabezados
        table.addHeaderCell("N° Pedido");
        table.addHeaderCell("Cliente");
        table.addHeaderCell("Fecha");
        table.addHeaderCell("Estado");
        table.addHeaderCell("Pago");
        table.addHeaderCell("Total");

        int totalPedidos = pedidos.size();
        BigDecimal totalMonto = BigDecimal.ZERO;
        
        for (Pedido pedido : pedidos) {
            table.addCell(pedido.getNumeroPedido());
            table.addCell(obtenerNombreCliente(pedido));
            table.addCell(pedido.getFechaPedido().format(formatter));
            table.addCell(pedido.getEstado() != null ? pedido.getEstado().name() : "N/A");
            table.addCell(pedido.getEstadoPago() != null ? pedido.getEstadoPago().name() : "N/A");
            table.addCell("S/ " + pedido.getTotal().toString());
            totalMonto = totalMonto.add(pedido.getTotal());
        }

        document.add(table);

        // Resumen
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("Total pedidos: " + totalPedidos).setFontSize(12).setBold());
        document.add(new Paragraph("Monto total: S/ " + totalMonto.toString()).setFontSize(12).setBold());

        document.close();
        
        // Guardar registro en BD
        guardarRegistroReporte(TipoReporte.PEDIDOS, "PDF", usuarioId);
        
        return baos.toByteArray();
    }

    public byte[] generarReportePedidosExcel(LocalDateTime fechaInicio, LocalDateTime fechaFin, Long usuarioId) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Reporte de Pedidos");

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // Título
        Row titleRow = sheet.createRow(0);
        titleRow.createCell(0).setCellValue("REPORTE DE PEDIDOS");
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        Row periodoRow = sheet.createRow(1);
        periodoRow.createCell(0).setCellValue(
                "Período: " + fechaInicio.format(formatter) + " - " + fechaFin.format(formatter));

        // Encabezados
        Row headerRow = sheet.createRow(3);
        String[] headers = {"N° Pedido", "Cliente", "Fecha", "Estado", "Estado Pago", "Total"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Obtener pedidos
        List<Pedido> pedidos = pedidoRepository.findAll().stream()
                .filter(p -> p.getFechaPedido().isAfter(fechaInicio) && p.getFechaPedido().isBefore(fechaFin))
                .toList();

        int rowNum = 4;
        BigDecimal totalMonto = BigDecimal.ZERO;

        for (Pedido pedido : pedidos) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(pedido.getNumeroPedido());
            row.createCell(1).setCellValue(obtenerNombreCliente(pedido));
            row.createCell(2).setCellValue(pedido.getFechaPedido().format(formatter));
            row.createCell(3).setCellValue(pedido.getEstado() != null ? pedido.getEstado().name() : "N/A");
            row.createCell(4).setCellValue(pedido.getEstadoPago() != null ? pedido.getEstadoPago().name() : "N/A");
            row.createCell(5).setCellValue("S/ " + pedido.getTotal().toString());
            totalMonto = totalMonto.add(pedido.getTotal());
        }

        // Resumen
        rowNum++;
        Row totalRow = sheet.createRow(rowNum++);
        totalRow.createCell(4).setCellValue("Total pedidos:");
        totalRow.createCell(5).setCellValue(pedidos.size());

        Row montoRow = sheet.createRow(rowNum);
        Cell montoLabel = montoRow.createCell(4);
        montoLabel.setCellValue("Monto total:");
        Cell montoValue = montoRow.createCell(5);
        montoValue.setCellValue("S/ " + totalMonto.toString());
        montoValue.setCellStyle(headerStyle);

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        
        // Guardar registro en BD
        guardarRegistroReporte(TipoReporte.PEDIDOS, "EXCEL", usuarioId);
        
        return baos.toByteArray();
    }

    // ==================== REPORTES DE CLIENTES ====================
    
    public byte[] generarReporteClientesPDF(Long usuarioId) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Título
        Paragraph title = new Paragraph("REPORTE DE CLIENTES")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        Paragraph fecha = new Paragraph("Fecha: " + LocalDate.now().format(formatter))
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(fecha);
        document.add(new Paragraph("\n"));

        // Obtener clientes (usuarios que han hecho pedidos)
        List<Usuario> clientes = usuarioRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getNombre().name().equals("CLIENTE")))
                .toList();

        // Tabla
        Table table = new Table(UnitValue.createPercentArray(new float[]{3, 3, 2, 2}))
                .useAllAvailableWidth();

        table.addHeaderCell("Nombre");
        table.addHeaderCell("Email");
        table.addHeaderCell("Teléfono");
        table.addHeaderCell("Pedidos");

        for (Usuario cliente : clientes) {
            table.addCell(cliente.getNombre() + " " + (cliente.getApellido() != null ? cliente.getApellido() : ""));
            table.addCell(cliente.getEmail());
            table.addCell(cliente.getTelefono() != null ? cliente.getTelefono() : "N/A");
            
            long cantidadPedidos = pedidoRepository.findAll().stream()
                    .filter(p -> p.getUsuario() != null && p.getUsuario().getId().equals(cliente.getId()))
                    .count();
            table.addCell(String.valueOf(cantidadPedidos));
        }

        document.add(table);

        // Resumen
        document.add(new Paragraph("\n"));
        document.add(new Paragraph("Total clientes: " + clientes.size()).setFontSize(12).setBold());

        document.close();
        
        // Guardar registro en BD
        guardarRegistroReporte(TipoReporte.CLIENTES, "PDF", usuarioId);
        
        return baos.toByteArray();
    }

    public byte[] generarReporteClientesExcel(Long usuarioId) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Reporte de Clientes");

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // Título
        Row titleRow = sheet.createRow(0);
        titleRow.createCell(0).setCellValue("REPORTE DE CLIENTES");
        
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        Row fechaRow = sheet.createRow(1);
        fechaRow.createCell(0).setCellValue("Fecha: " + LocalDate.now().format(formatter));

        // Encabezados
        Row headerRow = sheet.createRow(3);
        String[] headers = {"Nombre", "Email", "Teléfono", "Pedidos"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Obtener clientes
        List<Usuario> clientes = usuarioRepository.findAll().stream()
                .filter(u -> u.getRoles().stream().anyMatch(r -> r.getNombre().name().equals("CLIENTE")))
                .toList();

        int rowNum = 4;
        for (Usuario cliente : clientes) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(cliente.getNombre() + " " + (cliente.getApellido() != null ? cliente.getApellido() : ""));
            row.createCell(1).setCellValue(cliente.getEmail());
            row.createCell(2).setCellValue(cliente.getTelefono() != null ? cliente.getTelefono() : "N/A");
            
            long cantidadPedidos = pedidoRepository.findAll().stream()
                    .filter(p -> p.getUsuario() != null && p.getUsuario().getId().equals(cliente.getId()))
                    .count();
            row.createCell(3).setCellValue(cantidadPedidos);
        }

        // Resumen
        rowNum++;
        Row totalRow = sheet.createRow(rowNum);
        Cell totalLabel = totalRow.createCell(2);
        totalLabel.setCellValue("Total clientes:");
        Cell totalValue = totalRow.createCell(3);
        totalValue.setCellValue(clientes.size());
        totalValue.setCellStyle(headerStyle);

        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        
        // Guardar registro en BD
        guardarRegistroReporte(TipoReporte.CLIENTES, "EXCEL", usuarioId);
        
        return baos.toByteArray();
    }

    // ==================== MÉTODOS AUXILIARES ====================
    
    private void guardarRegistroReporte(TipoReporte tipo, String formato, Long usuarioId) {
        try {
            Reporte reporte = new Reporte();
            reporte.setNombre(tipo.name() + " - " + LocalDate.now());
            reporte.setTipo(tipo);
            reporte.setFormato(formato);
            
            if (usuarioId != null) {
                usuarioRepository.findById(usuarioId).ifPresent(reporte::setGeneradoPor);
            }
            
            reporteRepository.save(reporte);
        } catch (Exception e) {
            // Log pero no fallar la generación del reporte
            System.err.println("Error al guardar registro de reporte: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    @Transactional(readOnly = true)
    public List<ReporteResponse> listarTodos() {
        return reporteRepository.findAllWithUsuario().stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<ReporteResponse> listarRecientes() {
        return reporteRepository.findTop10ByOrderByFechaGeneracionDesc().stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
    }
    
    private ReporteResponse convertirAResponse(Reporte reporte) {
        ReporteResponse response = new ReporteResponse();
        response.setId(reporte.getId());
        response.setNombre(reporte.getNombre());
        response.setTipo(reporte.getTipo());
        response.setFormato(reporte.getFormato());
        response.setFechaGeneracion(reporte.getFechaGeneracion());
        
        if (reporte.getGeneradoPor() != null) {
            Usuario usuario = reporte.getGeneradoPor();
            ReporteResponse.UsuarioSimpleDTO usuarioDTO = new ReporteResponse.UsuarioSimpleDTO();
            usuarioDTO.setId(usuario.getId());
            usuarioDTO.setNombre(usuario.getNombre());
            usuarioDTO.setEmail(usuario.getEmail());
            response.setGeneradoPor(usuarioDTO);
        }
        
        return response;
    }
    
    private String obtenerNombreCliente(Pedido pedido) {
        if (pedido.getUsuario() == null) {
            return "Cliente Desconocido";
        }
        
        String nombre = pedido.getUsuario().getNombre();
        String apellido = pedido.getUsuario().getApellido();
        
        if (nombre != null && apellido != null) {
            return nombre + " " + apellido;
        } else if (nombre != null) {
            return nombre;
        } else {
            return pedido.getUsuario().getEmail();
        }
    }

    // ==================== REPORTES DE PEDIDOS COMPLETADOS ====================
    
    public byte[] generarReportePedidosCompletadosPDF(LocalDateTime fechaInicio, LocalDateTime fechaFin, Long usuarioId) throws Exception {
        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(baos);
        PdfDocument pdf = new PdfDocument(writer);
        Document document = new Document(pdf);

        // Título
        Paragraph title = new Paragraph("REPORTE DE PEDIDOS COMPLETADOS")
                .setFontSize(20)
                .setBold()
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Período
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        Paragraph periodo = new Paragraph(
                "Período: " + fechaInicio.format(formatter) + " - " + fechaFin.format(formatter))
                .setFontSize(12)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(periodo);
        document.add(new Paragraph("\n"));

        // Obtener pedidos completados del período
        List<Pedido> pedidos = pedidoRepository.findByEstadoAndFechaPedidoBetween(
                com.cuymarket.backend.model.enums.EstadoPedido.ENTREGADO, 
                fechaInicio, 
                fechaFin
        );

        // Tabla de pedidos
        Table table = new Table(UnitValue.createPercentArray(new float[]{2, 3, 2, 2, 2}))
                .useAllAvailableWidth();

        // Encabezados
        table.addHeaderCell("Nº Pedido");
        table.addHeaderCell("Cliente");
        table.addHeaderCell("Fecha");
        table.addHeaderCell("Total");
        table.addHeaderCell("Método Pago");

        BigDecimal totalIngresos = BigDecimal.ZERO;
        
        for (Pedido pedido : pedidos) {
            table.addCell(pedido.getNumeroPedido());
            table.addCell(obtenerNombreCliente(pedido));
            table.addCell(pedido.getFechaPedido().format(formatter));
            table.addCell("S/ " + pedido.getTotal().toString());
            table.addCell(pedido.getMetodoPago() != null ? pedido.getMetodoPago().name() : "N/A");
            totalIngresos = totalIngresos.add(pedido.getTotal());
        }

        document.add(table);

        // Resumen
        document.add(new Paragraph("\n"));
        Paragraph total = new Paragraph("TOTAL INGRESOS: S/ " + totalIngresos.toString())
                .setFontSize(14)
                .setBold()
                .setTextAlignment(TextAlignment.RIGHT);
        document.add(total);

        Paragraph cantidadPedidos = new Paragraph("Total de pedidos completados: " + pedidos.size())
                .setFontSize(12)
                .setTextAlignment(TextAlignment.RIGHT);
        document.add(cantidadPedidos);

        document.close();
        
        // Guardar registro en BD
        guardarRegistroReporte(TipoReporte.PEDIDOS, "PDF", usuarioId);
        
        return baos.toByteArray();
    }

    public byte[] generarReportePedidosCompletadosExcel(LocalDateTime fechaInicio, LocalDateTime fechaFin, Long usuarioId) throws Exception {
        Workbook workbook = new XSSFWorkbook();
        Sheet sheet = workbook.createSheet("Pedidos Completados");

        // Estilos
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        headerStyle.setFillPattern(FillPatternType.SOLID_FOREGROUND);

        // Título
        Row titleRow = sheet.createRow(0);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("REPORTE DE PEDIDOS COMPLETADOS");
        
        // Período
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd/MM/yyyy");
        Row periodoRow = sheet.createRow(1);
        periodoRow.createCell(0).setCellValue(
                "Período: " + fechaInicio.format(formatter) + " - " + fechaFin.format(formatter));

        // Encabezados (fila 3)
        Row headerRow = sheet.createRow(3);
        String[] headers = {"Nº Pedido", "Cliente", "Email", "Fecha", "Total", "Método Pago"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Obtener pedidos
        List<Pedido> pedidos = pedidoRepository.findByEstadoAndFechaPedidoBetween(
                com.cuymarket.backend.model.enums.EstadoPedido.ENTREGADO, 
                fechaInicio, 
                fechaFin
        );

        // Datos
        int rowNum = 4;
        BigDecimal totalIngresos = BigDecimal.ZERO;
        
        for (Pedido pedido : pedidos) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(pedido.getNumeroPedido());
            row.createCell(1).setCellValue(obtenerNombreCliente(pedido));
            row.createCell(2).setCellValue(pedido.getUsuario() != null ? pedido.getUsuario().getEmail() : "N/A");
            row.createCell(3).setCellValue(pedido.getFechaPedido().format(formatter));
            row.createCell(4).setCellValue("S/ " + pedido.getTotal().toString());
            row.createCell(5).setCellValue(pedido.getMetodoPago() != null ? pedido.getMetodoPago().name() : "N/A");
            totalIngresos = totalIngresos.add(pedido.getTotal());
        }

        // Totales
        rowNum++;
        Row totalRow = sheet.createRow(rowNum);
        totalRow.createCell(3).setCellValue("TOTAL:");
        Cell totalCell = totalRow.createCell(4);
        totalCell.setCellValue("S/ " + totalIngresos.toString());
        totalCell.setCellStyle(headerStyle);

        Row cantidadRow = sheet.createRow(rowNum + 1);
        cantidadRow.createCell(3).setCellValue("Total Pedidos:");
        cantidadRow.createCell(4).setCellValue(pedidos.size());

        // Ajustar anchos de columna
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream baos = new ByteArrayOutputStream();
        workbook.write(baos);
        workbook.close();
        
        // Guardar registro en BD
        guardarRegistroReporte(TipoReporte.PEDIDOS, "EXCEL", usuarioId);
        
        return baos.toByteArray();
    }
}

