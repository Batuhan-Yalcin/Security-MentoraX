package com.batuhanyalcin.service.impl;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import com.batuhanyalcin.exception.AssignmentNotFoundException;
import com.batuhanyalcin.exception.FileUploadException;
import com.batuhanyalcin.exception.StudentNotFoundException;
import com.batuhanyalcin.exception.UnauthorizedAccessException;
import com.batuhanyalcin.model.Assignment;
import com.batuhanyalcin.model.Student;
import com.batuhanyalcin.repository.AssignmentRepository;
import com.batuhanyalcin.repository.StudentRepository;
import com.batuhanyalcin.repository.UserRepository;
import com.batuhanyalcin.service.StudentAssignmentService;

@Service
public class StudentAssignmentServiceImpl implements StudentAssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final Path fileStorageLocation;

    public StudentAssignmentServiceImpl(AssignmentRepository assignmentRepository, 
                                      StudentRepository studentRepository, 
                                      UserRepository userRepository) {
        this.assignmentRepository = assignmentRepository;
        this.studentRepository = studentRepository;
        this.userRepository = userRepository;
        this.fileStorageLocation = Paths.get("uploads").toAbsolutePath().normalize();
        try {
            Files.createDirectories(this.fileStorageLocation);
        } catch (IOException ex) {
            throw new FileUploadException("Dosya yükleme dizini oluşturulamadı", ex);
        }
    }

    @Override
    public List<Assignment> getAssignments() {
        String studentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        return assignmentRepository.findByStudentUserUsername(studentUsername);
    }

    @Override
    public Assignment uploadAssignment(MultipartFile file, String title, String description) {
        String studentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        String fileName = StringUtils.cleanPath(file.getOriginalFilename());
        
        try {
            if (fileName.contains("..")) {
                throw new FileUploadException("Dosya adı geçersiz: " + fileName);
            }

            String uniqueFileName = UUID.randomUUID().toString() + "_" + fileName;
            Path targetLocation = this.fileStorageLocation.resolve(uniqueFileName);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            Assignment assignment = Assignment.builder()
                    .title(title)
                    .description(description)
                    .fileName(fileName)
                    .filePath(targetLocation.toString())
                    .student(userRepository.findByUsername(studentUsername)
                            .orElseThrow(() -> new AssignmentNotFoundException("Öğrenci bulunamadı"))
                            .getStudent())
                    .submissionDate(java.time.LocalDateTime.now())
                    .build();

            return assignmentRepository.save(assignment);
        } catch (IOException ex) {
            throw new FileUploadException("Dosya yüklenemedi: " + fileName, ex);
        }
    }

    @Override
    public ResponseEntity<byte[]> downloadAssignment(Long id) {
        String studentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new AssignmentNotFoundException("Ödev bulunamadı"));

        if (!assignment.getStudent().getUser().getUsername().equals(studentUsername)) {
            throw new UnauthorizedAccessException("Bu ödevi indirme yetkiniz yok");
        }

        try {
            Path filePath = Paths.get(assignment.getFilePath()).normalize();
            Resource resource = new UrlResource(filePath.toUri());

            if (!resource.exists()) {
                throw new AssignmentNotFoundException("Dosya bulunamadı: " + assignment.getFileName());
            }

            byte[] fileContent = Files.readAllBytes(filePath);
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + assignment.getFileName() + "\"")
                    .body(fileContent);
        } catch (MalformedURLException ex) {
            throw new FileUploadException("Dosya yolu geçersiz", ex);
        } catch (IOException ex) {
            throw new FileUploadException("Dosya indirilemedi", ex);
        }
    }
    
    @Override
    public Student getStudentProfile() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Student student = studentRepository.findByUserUsername(username)
                .orElseThrow(() -> new StudentNotFoundException("Öğrenci bulunamadı: " + username));
        
       
        student.getUser().setPassword(null);
        
        return student;
    }
    
    @Override
    public Assignment getAssignmentById(Long id) {
        String studentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new AssignmentNotFoundException("Ödev bulunamadı"));

        if (!assignment.getStudent().getUser().getUsername().equals(studentUsername)) {
            throw new UnauthorizedAccessException("Bu ödevi görüntüleme yetkiniz yok");
        }
        
        return assignment;
    }
}