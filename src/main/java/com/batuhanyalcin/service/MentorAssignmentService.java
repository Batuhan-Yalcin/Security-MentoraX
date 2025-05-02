package com.batuhanyalcin.service;

import java.util.List;

import org.springframework.http.ResponseEntity;

import com.batuhanyalcin.model.Assignment;
import com.batuhanyalcin.model.User;

public interface MentorAssignmentService {
    List<User> getStudentIds();
    List<User> getAllMentorStudents();
    List<Assignment> getStudentAssignments(Long studentId);
    Assignment addFeedback(Long id, String feedback, Integer grade);
    ResponseEntity<byte[]> downloadAssignment(Long id);
} 