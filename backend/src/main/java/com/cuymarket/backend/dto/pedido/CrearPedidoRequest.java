package com.cuymarket.backend.dto.pedido;

import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class CrearPedidoRequest {

    @NotNull(message = "La dirección de envío es obligatoria")
    private Long direccionEnvioId;

    @NotNull(message = "El método de pago es obligatorio")
    private String metodoPago;

    private String codigoCupon;
    private String notas;
    
    // Información de pago adicional
    private String telefono;           // Para Yape/Plin
    private String banco;              // Para transferencia bancaria
    private String numeroOperacion;    // Para transferencia bancaria
    private MultipartFile comprobante; // Imagen del comprobante
}
