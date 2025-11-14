package com.cuymarket.backend.controller.dto;

public class AuthDtos {
    public record LoginRequest(String email, String password) {}
    public record RegisterRequest(String nombres, String apellidos, String email, String password) {}
    public record AuthResponse(String token) {}
}
