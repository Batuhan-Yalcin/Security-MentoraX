package com.batuhanyalcin.service;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.multipart.MultipartFile;

import com.batuhanyalcin.model.Assignment;

public interface StudentAssignmentService {
    List<Assignment> getAssignments();
    Assignment uploadAssignment(MultipartFile file);
    ResponseEntity<byte[]> downloadAssignment(Long id);
} 