package com.batuhanyalcin.service.impl;

import java.util.List;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.batuhanyalcin.exception.AssignmentNotFoundException;
import com.batuhanyalcin.exception.UnauthorizedAccessException;
import com.batuhanyalcin.model.Assignment;
import com.batuhanyalcin.model.User;
import com.batuhanyalcin.repository.AssignmentRepository;
import com.batuhanyalcin.repository.UserRepository;
import com.batuhanyalcin.service.MentorAssignmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MentorAssignmentServiceImpl implements MentorAssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;

    @Override
    public List<User> getStudentIds() {
        String mentorUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByStudentMentorUserUsername(mentorUsername);
    }

    @Override
    public List<Assignment> getStudentAssignments(Long studentId) {
        String mentorUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new AssignmentNotFoundException("Öğrenci bulunamadı"));

        if (!student.getStudent().getMentor().getUser().getUsername().equals(mentorUsername)) {
            throw new UnauthorizedAccessException("Bu öğrencinin ödevlerine erişim yetkiniz yok");
        }

        return assignmentRepository.findByStudentId(studentId);
    }

    @Override
    public Assignment addFeedback(Long id, String feedback, Integer grade) {
        String mentorUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        Assignment assignment = assignmentRepository.findById(id)
                .orElseThrow(() -> new AssignmentNotFoundException("Ödev bulunamadı"));

        if (!assignment.getStudent().getMentor().getUser().getUsername().equals(mentorUsername)) {
            throw new UnauthorizedAccessException("Bu ödeve geri bildirim bırakma yetkiniz yok");
        }

        assignment.setFeedback(feedback);
        assignment.setGrade(grade);
        return assignmentRepository.save(assignment);
    }
}