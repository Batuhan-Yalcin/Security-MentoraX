package com.batuhanyalcin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.batuhanyalcin.model.Assignment;
import com.batuhanyalcin.service.StudentAssignmentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student/assignments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Öğrenci Ödevleri", description = "Öğrencilerin ödev yönetimi")
@SecurityRequirement(name = "bearerAuth")
public class StudentAssignmentController {

    private final StudentAssignmentService studentAssignmentService;

    @GetMapping
    @Operation(summary = "Ödevleri listele", description = "Öğrencinin kendi ödevlerini listeler")
    @ApiResponse(responseCode = "200", description = "Ödevler başarıyla listelendi")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    public ResponseEntity<List<Assignment>> getAssignments() {
        return ResponseEntity.ok(studentAssignmentService.getAssignments());
    }

    @PostMapping
    @Operation(summary = "Ödev yükle", description = "Yeni bir ödev yükler")
    @ApiResponse(responseCode = "200", description = "Ödev başarıyla yüklendi")
    @ApiResponse(responseCode = "400", description = "Geçersiz dosya")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    public ResponseEntity<Assignment> uploadAssignment(@RequestParam("file") MultipartFile file) {
        return ResponseEntity.ok(studentAssignmentService.uploadAssignment(file));
    }

    @GetMapping("/{id}/download")
    @Operation(summary = "Ödev indir", description = "Belirtilen ödevi indirir")
    @ApiResponse(responseCode = "200", description = "Ödev başarıyla indirildi")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    @ApiResponse(responseCode = "404", description = "Ödev bulunamadı")
    public ResponseEntity<byte[]> downloadAssignment(@PathVariable Long id) {
        return studentAssignmentService.downloadAssignment(id);
    }
}