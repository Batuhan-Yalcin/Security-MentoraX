package com.batuhanyalcin.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.batuhanyalcin.model.Assignment;
import com.batuhanyalcin.model.Student;
import com.batuhanyalcin.service.StudentAssignmentService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/student")
@RequiredArgsConstructor
@PreAuthorize("hasRole('STUDENT')")
@Tag(name = "Öğrenci İşlemleri", description = "Öğrencilerin ödev yönetimi ve profil işlemleri")
@SecurityRequirement(name = "bearerAuth")
public class StudentAssignmentController {

    private final StudentAssignmentService studentAssignmentService;
    private final ObjectMapper objectMapper = new ObjectMapper()
            .configure(SerializationFeature.FAIL_ON_EMPTY_BEANS, false);

    @GetMapping("/profile")
    @Operation(summary = "Profil Bilgileri", description = "Öğrencinin kendi profil bilgilerini getirir")
    @ApiResponse(responseCode = "200", description = "Profil bilgileri başarıyla alındı")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    @ApiResponse(responseCode = "404", description = "Öğrenci bulunamadı")
    public ResponseEntity<Student> getProfile() {
        Student student = studentAssignmentService.getStudentProfile();
        
        // Log student details for debugging
        System.out.println("Sending student profile: " + student.getId());
        System.out.println("Username: " + student.getUser().getUsername());
        System.out.println("Department: " + student.getDepartment());
        System.out.println("Student Number: " + student.getStudentNumber());
        
        return ResponseEntity.ok(student);
    }

    @GetMapping("/assignments")
    @Operation(summary = "Ödevleri listele", description = "Öğrencinin kendi ödevlerini listeler")
    @ApiResponse(responseCode = "200", description = "Ödevler başarıyla listelendi")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    public ResponseEntity<?> getAssignments() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("Getting assignments for user: " + username);
        
        List<Assignment> assignments = studentAssignmentService.getAssignments();
        System.out.println("Found " + assignments.size() + " assignments");
        
        // Basitleştirilmiş ödev verilerini döndür
        try {
            // Ödevleri daha basit bir formatta map et
            List<Object> simplifiedAssignments = assignments.stream().map(assignment -> {
                return new Object() {
                    public Long id = assignment.getId();
                    public String fileName = assignment.getFileName();
                    public String title = assignment.getTitle();
                    public String description = assignment.getDescription();
                    public String submissionDate = assignment.getSubmissionDate().toString();
                    public Integer grade = assignment.getGrade();
                    public String feedback = assignment.getFeedback();
                    public Object student = new Object() {
                        public Long id = assignment.getStudent().getId();
                    };
                };
            }).collect(Collectors.toList());
            
            // JSON olarak seri hale getir
            String jsonResponse = objectMapper.writeValueAsString(simplifiedAssignments);
            System.out.println("Response JSON: " + jsonResponse.substring(0, Math.min(200, jsonResponse.length())) + "...");
            
            return ResponseEntity.ok(simplifiedAssignments);
            
        } catch (Exception e) {
            System.err.println("JSON serileştirme hatası: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(assignments); // Fallback to original assignments
        }
    }

    @PostMapping("/assignments")
    @Operation(summary = "Ödev yükle", description = "Yeni bir ödev yükler")
    @ApiResponse(responseCode = "200", description = "Ödev başarıyla yüklendi")
    @ApiResponse(responseCode = "400", description = "Geçersiz dosya")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    public ResponseEntity<Assignment> uploadAssignment(
            @RequestParam("file") MultipartFile file,
            @RequestParam("title") String title,
            @RequestParam("description") String description) {
        return ResponseEntity.ok(studentAssignmentService.uploadAssignment(file, title, description));
    }

    @GetMapping("/assignments/{id}/download")
    @Operation(summary = "Ödev indir", description = "Belirtilen ödevi indirir")
    @ApiResponse(responseCode = "200", description = "Ödev başarıyla indirildi")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    @ApiResponse(responseCode = "404", description = "Ödev bulunamadı")
    public ResponseEntity<byte[]> downloadAssignment(@PathVariable Long id) {
        return studentAssignmentService.downloadAssignment(id);
    }
    
    @GetMapping("/assignments/{id}")
    @Operation(summary = "Ödev detay", description = "Belirtilen ödevin detaylarını getirir")
    @ApiResponse(responseCode = "200", description = "Ödev detayları başarıyla alındı")
    @ApiResponse(responseCode = "401", description = "Yetkisiz erişim")
    @ApiResponse(responseCode = "404", description = "Ödev bulunamadı")
    public ResponseEntity<?> getAssignment(@PathVariable Long id) {
        Assignment assignment = studentAssignmentService.getAssignmentById(id);
        
        // Basitleştirilmiş ödev verisini döndür
        try {
            Object simplifiedAssignment = new Object() {
                public Long id = assignment.getId();
                public String fileName = assignment.getFileName();
                public String title = assignment.getTitle();
                public String description = assignment.getDescription();
                public String submissionDate = assignment.getSubmissionDate().toString();
                public Integer grade = assignment.getGrade();
                public String feedback = assignment.getFeedback();
                public Object student = new Object() {
                    public Long id = assignment.getStudent().getId();
                };
            };
            
            return ResponseEntity.ok(simplifiedAssignment);
        } catch (Exception e) {
            System.err.println("JSON serileştirme hatası: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.ok(assignment); // Fallback to original assignment
        }
    }
}