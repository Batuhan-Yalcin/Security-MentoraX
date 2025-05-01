package com.batuhanyalcin.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.batuhanyalcin.dto.AuthResponse;
import com.batuhanyalcin.dto.LoginRequest;
import com.batuhanyalcin.dto.RegisterRequest;
import com.batuhanyalcin.model.UserRole;
import com.batuhanyalcin.service.AuthService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Kimlik Doğrulama", description = "Kullanıcı kayıt ve giriş işlemleri")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register/student")
    @Operation(summary = "Öğrenci kaydı", description = "Yeni bir öğrenci kaydı oluşturur")
    @ApiResponse(responseCode = "200", description = "Öğrenci başarıyla kaydedildi")
    @ApiResponse(responseCode = "400", description = "Geçersiz istek")
    @ApiResponse(responseCode = "409", description = "Kullanıcı zaten mevcut")
    public ResponseEntity<AuthResponse> registerStudent(@RequestBody RegisterRequest request) {
        request.setRole(UserRole.STUDENT);
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/register/mentor")
    @Operation(summary = "Mentor kaydı", description = "Yeni bir mentor kaydı oluşturur")
    @ApiResponse(responseCode = "200", description = "Mentor başarıyla kaydedildi")
    @ApiResponse(responseCode = "400", description = "Geçersiz istek")
    @ApiResponse(responseCode = "409", description = "Kullanıcı zaten mevcut")
    public ResponseEntity<AuthResponse> registerMentor(@RequestBody RegisterRequest request) {
        request.setRole(UserRole.MENTOR);
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/register/admin")
    @Operation(summary = "Admin kaydı", description = "Yeni bir admin kaydı oluşturur")
    @ApiResponse(responseCode = "200", description = "Admin başarıyla kaydedildi")
    @ApiResponse(responseCode = "400", description = "Geçersiz istek")
    @ApiResponse(responseCode = "409", description = "Kullanıcı zaten mevcut")
    public ResponseEntity<AuthResponse> registerAdmin(@RequestBody RegisterRequest request) {
        request.setRole(UserRole.ADMIN);
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    @Operation(summary = "Kullanıcı girişi", description = "Mevcut bir kullanıcı ile giriş yapar")
    @ApiResponse(responseCode = "200", description = "Giriş başarılı")
    @ApiResponse(responseCode = "401", description = "Geçersiz kimlik bilgileri")
    @ApiResponse(responseCode = "404", description = "Kullanıcı bulunamadı")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }
}