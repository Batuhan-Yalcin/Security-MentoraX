package com.batuhanyalcin.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.batuhanyalcin.model.Assignment;
import com.batuhanyalcin.model.Student;

public interface StudentAssignmentService {
    List<Assignment> getAssignments();
    Assignment uploadAssignment(MultipartFile file, String title, String description);
    ResponseEntity<byte[]> downloadAssignment(Long id);
    Student getStudentProfile();
    Assignment getAssignmentById(Long id);
} 