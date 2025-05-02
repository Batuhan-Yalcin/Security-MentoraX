package com.batuhanyalcin.service;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.batuhanyalcin.exception.AssignmentNotFoundException;
import com.batuhanyalcin.exception.UnauthorizedAccessException;
import com.batuhanyalcin.model.Assignment;
import com.batuhanyalcin.model.Mentor;
import com.batuhanyalcin.model.Student;
import com.batuhanyalcin.model.User;
import com.batuhanyalcin.model.UserRole;
import com.batuhanyalcin.repository.AssignmentRepository;
import com.batuhanyalcin.repository.UserRepository;
import com.batuhanyalcin.service.impl.MentorAssignmentServiceImpl;

@ExtendWith(MockitoExtension.class)
public class MentorAssignmentServiceTest {

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private MentorAssignmentServiceImpl mentorAssignmentService;

    private User mentorUser;
    private User studentUser;
    private Mentor mentor;
    private Student student;
    private Assignment assignment;

    @BeforeEach
    void setUp() {
        // Mentor kullanıcısını oluştur
        mentorUser = new User();
        mentorUser.setId(1L);
        mentorUser.setUsername("mentoruser");
        mentorUser.setRole(UserRole.MENTOR);

        // Öğrenci kullanıcısını oluştur
        studentUser = new User();
        studentUser.setId(2L);
        studentUser.setUsername("studentuser");
        studentUser.setRole(UserRole.STUDENT);

        // Mentor nesnesini oluştur
        mentor = new Mentor();
        mentor.setId(1L);
        mentor.setUser(mentorUser);

        // Öğrenci nesnesini oluştur
        student = new Student();
        student.setId(2L);
        student.setUser(studentUser);
        student.setMentor(mentor);

        // İlişkileri kur
        mentorUser.setMentor(mentor);
        studentUser.setStudent(student);

        // Ödev nesnesini oluştur
        assignment = new Assignment();
        assignment.setId(1L);
        assignment.setStudent(student);
        assignment.setMentor(mentor);
        assignment.setTitle("Test Assignment");
        assignment.setDescription("Test Description");

        // Security context'i ayarla
        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("mentoruser");
    }

    @Test
    void getStudentIds_ShouldReturnMentorStudents() {
        // Arrange
        List<User> expectedStudents = Arrays.asList(studentUser);
        when(userRepository.findByStudentMentorUserUsername("mentoruser")).thenReturn(expectedStudents);

        // Act
        List<User> actualStudents = mentorAssignmentService.getStudentIds();

        // Assert
        assertEquals(expectedStudents, actualStudents);
        verify(userRepository).findByStudentMentorUserUsername("mentoruser");
    }

    @Test
    void getStudentAssignments_ShouldReturnStudentAssignments() {
        // Arrange
        List<Assignment> expectedAssignments = Arrays.asList(assignment);
        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));
        when(assignmentRepository.findByStudentId(2L)).thenReturn(expectedAssignments);

        // Act
        List<Assignment> actualAssignments = mentorAssignmentService.getStudentAssignments(2L);

        // Assert
        assertEquals(expectedAssignments, actualAssignments);
        verify(assignmentRepository).findByStudentId(2L);
    }

    @Test
    void getStudentAssignments_WithInvalidStudentId_ShouldThrowException() {
        // Arrange
        when(userRepository.findById(3L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(AssignmentNotFoundException.class, () -> {
            mentorAssignmentService.getStudentAssignments(3L);
        });
    }

    @Test
    void getStudentAssignments_WithUnauthorizedAccess_ShouldThrowException() {
        // Arrange
        when(userRepository.findById(2L)).thenReturn(Optional.of(studentUser));
        when(authentication.getName()).thenReturn("differentmentor");

        // Act & Assert
        assertThrows(UnauthorizedAccessException.class, () -> {
            mentorAssignmentService.getStudentAssignments(2L);
        });
    }

    @Test
    void addFeedback_ShouldUpdateAssignment() {
        // Arrange
        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));
        when(assignmentRepository.save(any(Assignment.class))).thenReturn(assignment);

        // Act
        Assignment result = mentorAssignmentService.addFeedback(1L, "Good work!", 90);

        // Assert
        assertNotNull(result);
        assertEquals("Good work!", result.getFeedback());
        assertEquals(90, result.getGrade());
        verify(assignmentRepository).save(any(Assignment.class));
    }

    @Test
    void addFeedback_WithInvalidAssignmentId_ShouldThrowException() {
        // Arrange
        when(assignmentRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(AssignmentNotFoundException.class, () -> {
            mentorAssignmentService.addFeedback(1L, "Good work!", 90);
        });
    }

    @Test
    void addFeedback_WithUnauthorizedAccess_ShouldThrowException() {
        // Arrange
        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(assignment));
        when(authentication.getName()).thenReturn("differentmentor");

        // Act & Assert
        assertThrows(UnauthorizedAccessException.class, () -> {
            mentorAssignmentService.addFeedback(1L, "Good work!", 90);
        });
    }
} 