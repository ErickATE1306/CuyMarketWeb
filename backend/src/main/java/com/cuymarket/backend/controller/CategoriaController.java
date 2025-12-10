package com.cuymarket.backend.controller;

import com.cuymarket.backend.dto.categoria.CategoriaRequest;
import com.cuymarket.backend.dto.categoria.CategoriaResponse;
import com.cuymarket.backend.model.producto.Categoria;
import com.cuymarket.backend.service.producto.CategoriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/categorias")
@RequiredArgsConstructor
public class CategoriaController {

    private final CategoriaService categoriaService;

    @GetMapping
    public ResponseEntity<List<CategoriaResponse>> listarCategorias() {
        List<Categoria> categorias = categoriaService.listarTodas();
        List<CategoriaResponse> response = categorias.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/activas")
    public ResponseEntity<List<CategoriaResponse>> listarCategoriasActivas() {
        List<Categoria> categorias = categoriaService.listarActivas();
        List<CategoriaResponse> response = categorias.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CategoriaResponse> obtenerCategoria(@PathVariable Long id) {
        Categoria categoria = categoriaService.obtenerPorId(id);
        return ResponseEntity.ok(convertirAResponse(categoria));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoriaResponse> crearCategoria(@Valid @RequestBody CategoriaRequest request) {
        Categoria categoria = convertirAEntidad(request);
        Categoria categoriaCreada = categoriaService.crear(categoria);
        return ResponseEntity.ok(convertirAResponse(categoriaCreada));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CategoriaResponse> actualizarCategoria(
            @PathVariable Long id,
            @Valid @RequestBody CategoriaRequest request) {
        Categoria categoria = convertirAEntidad(request);
        Categoria categoriaActualizada = categoriaService.actualizar(id, categoria);
        return ResponseEntity.ok(convertirAResponse(categoriaActualizada));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> eliminarCategoria(@PathVariable Long id) {
        categoriaService.eliminar(id);
        return ResponseEntity.noContent().build();
    }

    private CategoriaResponse convertirAResponse(Categoria categoria) {
        Long totalProductos = categoriaService.contarProductos(categoria.getId());
        CategoriaResponse response = new CategoriaResponse();
        response.setId(categoria.getId());
        response.setNombre(categoria.getNombre());
        response.setDescripcion(categoria.getDescripcion());
        response.setActiva(categoria.getActiva());
        response.setTotalProductos(totalProductos);
        return response;
    }

    private Categoria convertirAEntidad(CategoriaRequest request) {
        Categoria categoria = new Categoria();
        categoria.setNombre(request.getNombre());
        categoria.setDescripcion(request.getDescripcion());
        categoria.setActiva(request.getActiva());
        return categoria;
    }
}
