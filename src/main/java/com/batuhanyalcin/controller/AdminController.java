package com.batuhanyalcin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.batuhanyalcin.model.User;
import com.batuhanyalcin.service.AdminService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Admin Yönetimi", description = "Kullanıcı yönetimi işlemleri")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    @Operation(summary = "Kullanıcıları listele", description = "Tüm kullanıcıları listeler")
    @ApiResponse(responseCode = "200", description = "Kullanıcılar başarıyla listelendi")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @GetMapping("/users/{id}")
    @Operation(summary = "Kullanıcı detayı", description = "Belirtilen kullanıcının detaylarını getirir")
    @ApiResponse(responseCode = "200", description = "Kullanıcı detayları başarıyla getirildi")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    @ApiResponse(responseCode = "404", description = "Kullanıcı bulunamadı")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(adminService.getUserById(id));
    }

    @PostMapping("/users")
    @Operation(summary = "Kullanıcı oluştur", description = "Yeni bir kullanıcı oluşturur")
    @ApiResponse(responseCode = "200", description = "Kullanıcı başarıyla oluşturuldu")
    @ApiResponse(responseCode = "400", description = "Geçersiz kullanıcı bilgileri")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    @ApiResponse(responseCode = "409", description = "Kullanıcı zaten mevcut")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(adminService.createUser(user));
    }

    @PutMapping("/users/{id}")
    @Operation(summary = "Kullanıcı güncelle", description = "Belirtilen kullanıcının bilgilerini günceller")
    @ApiResponse(responseCode = "200", description = "Kullanıcı başarıyla güncellendi")
    @ApiResponse(responseCode = "400", description = "Geçersiz kullanıcı bilgileri")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    @ApiResponse(responseCode = "404", description = "Kullanıcı bulunamadı")
    public ResponseEntity<User> updateUser(@PathVariable Long id, @RequestBody User user) {
        return ResponseEntity.ok(adminService.updateUser(id, user));
    }

    @DeleteMapping("/users/{id}")
    @Operation(summary = "Kullanıcı sil", description = "Belirtilen kullanıcıyı siler")
    @ApiResponse(responseCode = "200", description = "Kullanıcı başarıyla silindi")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    @ApiResponse(responseCode = "404", description = "Kullanıcı bulunamadı")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        adminService.deleteUser(id);
        return ResponseEntity.ok().build();
    }
} 