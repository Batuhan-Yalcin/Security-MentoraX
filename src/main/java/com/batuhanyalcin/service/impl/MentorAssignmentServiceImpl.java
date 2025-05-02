package com.batuhanyalcin.service.impl;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.batuhanyalcin.exception.AssignmentNotFoundException;
import com.batuhanyalcin.exception.UnauthorizedAccessException;
import com.batuhanyalcin.model.Assignment;
import com.batuhanyalcin.model.Student;
import com.batuhanyalcin.model.User;
import com.batuhanyalcin.repository.AssignmentRepository;
import com.batuhanyalcin.repository.StudentRepository;
import com.batuhanyalcin.repository.UserRepository;
import com.batuhanyalcin.service.MentorAssignmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MentorAssignmentServiceImpl implements MentorAssignmentService {

    private final AssignmentRepository assignmentRepository;
    private final UserRepository userRepository;
    private final StudentRepository studentRepository;

    @Override
    public List<User> getStudentIds() {
        String mentorUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        List<User> result1 = userRepository.findByStudentMentorUserUsername(mentorUsername);
        List<User> result2 = userRepository.findAllStudentsByMentorUsername(mentorUsername);
        
        List<Student> students = studentRepository.findByMentorUsername(mentorUsername);
        
        Map<Long, User> combinedResults = new HashMap<>();
        
        for (User user : result1) {
            combinedResults.put(user.getId(), user);
        }
        
        for (User user : result2) {
            combinedResults.put(user.getId(), user);
        }
        
        for (Student student : students) {
            User user = student.getUser();
            if (user != null) {
                combinedResults.put(user.getId(), user);
            }
        }
        
        List<User> combinedList = new ArrayList<>(combinedResults.values());
        
        System.out.println("Mentor " + mentorUsername + " için bulunan öğrenci sayısı: " + combinedList.size());
        System.out.println("Birinci metot: " + result1.size() + " öğrenci");
        System.out.println("İkinci metot: " + result2.size() + " öğrenci");
        System.out.println("Student Repository: " + students.size() + " öğrenci");
        return combinedList;
    }

    @Override
    public List<User> getAllMentorStudents() {
        String mentorUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        System.out.println("getAllMentorStudents çağrıldı - mentor: " + mentorUsername);
        
        List<Student> students = studentRepository.findByMentorUsername(mentorUsername);
        
        List<User> userList = new ArrayList<>();
        for (Student student : students) {
            User user = student.getUser();
            if (user != null) {
                userList.add(user);
            }
        }
        
        System.out.println("StudentRepository ile bulunan öğrenci sayısı: " + students.size());
        return userList;
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