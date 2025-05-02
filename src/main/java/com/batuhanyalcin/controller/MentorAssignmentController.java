package com.batuhanyalcin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.batuhanyalcin.model.Assignment;
import com.batuhanyalcin.model.User;
import com.batuhanyalcin.service.MentorAssignmentService;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mentor")
@RequiredArgsConstructor
@PreAuthorize("hasRole('MENTOR')")
@Tag(name = "Mentor Ödevleri", description = "Mentorların ödev yönetimi")
@SecurityRequirement(name = "bearerAuth")
public class MentorAssignmentController {

    private final MentorAssignmentService mentorAssignmentService;

    @GetMapping("/students")
    @Operation(summary = "Öğrencileri listele", description = "Mentora bağlı öğrencileri listeler")
    @ApiResponse(responseCode = "200", description = "Öğrenciler başarıyla listelendi")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    public ResponseEntity<List<User>> getStudents() {
        return ResponseEntity.ok(mentorAssignmentService.getAllMentorStudents());
    }

    @GetMapping("/all-students")
    @Operation(summary = "Tüm öğrencileri listele (gelişmiş)", description = "Mentora bağlı tüm öğrencileri farklı bir yöntemle listeler")
    @ApiResponse(responseCode = "200", description = "Öğrenciler başarıyla listelendi")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    public ResponseEntity<List<User>> getAllStudents() {
        return ResponseEntity.ok(mentorAssignmentService.getStudentIds());
    }

    @GetMapping("/assignments/{studentId}")
    @Operation(summary = "Öğrenci ödevlerini listele", description = "Belirtilen öğrencinin ödevlerini listeler")
    @ApiResponse(responseCode = "200", description = "Ödevler başarıyla listelendi")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    @ApiResponse(responseCode = "404", description = "Öğrenci bulunamadı")
    public ResponseEntity<List<Assignment>> getStudentAssignments(@PathVariable Long studentId) {
        return ResponseEntity.ok(mentorAssignmentService.getStudentAssignments(studentId));
    }

    @PutMapping("/assignments/{id}/feedback")
    @Operation(summary = "Geri bildirim bırak", description = "Belirtilen ödeve geri bildirim bırakır")
    @ApiResponse(responseCode = "200", description = "Geri bildirim başarıyla eklendi")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    @ApiResponse(responseCode = "404", description = "Ödev bulunamadı")
    public ResponseEntity<Assignment> addFeedback(
            @PathVariable Long id,
            @RequestParam String feedback,
            @RequestParam Integer grade) {
        return ResponseEntity.ok(mentorAssignmentService.addFeedback(id, feedback, grade));
    }
}