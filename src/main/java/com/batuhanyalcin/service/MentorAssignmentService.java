package com.batuhanyalcin.service;

import java.util.List;

import com.batuhanyalcin.model.Assignment;
import com.batuhanyalcin.model.User;

public interface MentorAssignmentService {
    List<User> getStudentIds();
    List<Assignment> getStudentAssignments(Long studentId);
    Assignment addFeedback(Long id, String feedback, Integer grade);
} 