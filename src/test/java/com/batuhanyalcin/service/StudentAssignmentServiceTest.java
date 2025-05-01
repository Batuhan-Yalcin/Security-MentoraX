package com.batuhanyalcin.service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertArrayEquals;
import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.api.io.TempDir;
import static org.mockito.ArgumentMatchers.any;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.batuhanyalcin.exception.AssignmentNotFoundException;
import com.batuhanyalcin.exception.FileUploadException;
import com.batuhanyalcin.exception.UnauthorizedAccessException;
import com.batuhanyalcin.model.Assignment;
import com.batuhanyalcin.model.Student;
import com.batuhanyalcin.model.User;
import com.batuhanyalcin.repository.AssignmentRepository;
import com.batuhanyalcin.repository.StudentRepository;
import com.batuhanyalcin.repository.UserRepository;
import com.batuhanyalcin.service.impl.StudentAssignmentServiceImpl;

@ExtendWith(MockitoExtension.class)
public class StudentAssignmentServiceTest {

    @TempDir
    Path tempDir;

    @Mock
    private AssignmentRepository assignmentRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private StudentAssignmentServiceImpl studentAssignmentService;

    private User testUser;
    private Student testStudent;
    private Assignment testAssignment;
    private Path testFilePath;

    @BeforeEach
    void setUp() throws IOException {
        // Test dosyasını oluştur
        testFilePath = tempDir.resolve("test.pdf");
        Files.write(testFilePath, "test content".getBytes());

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        
        testStudent = new Student();
        testStudent.setId(1L);
        testStudent.setUser(testUser);
        testUser.setStudent(testStudent);
        
        testAssignment = new Assignment();
        testAssignment.setId(1L);
        testAssignment.setStudent(testStudent);
        testAssignment.setTitle("Test Assignment");
        testAssignment.setDescription("Test Description");
        testAssignment.setFileName("test.pdf");
        testAssignment.setFilePath(testFilePath.toString());
        testAssignment.setSubmissionDate(LocalDateTime.now());

        SecurityContextHolder.setContext(securityContext);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("testuser");
    }

    @Test
    void getAssignments_ShouldReturnStudentAssignments() {
        // Arrange
        List<Assignment> expectedAssignments = Arrays.asList(testAssignment);
        when(assignmentRepository.findByStudentUserUsername("testuser")).thenReturn(expectedAssignments);

        // Act
        List<Assignment> actualAssignments = studentAssignmentService.getAssignments();

        // Assert
        assertEquals(expectedAssignments, actualAssignments);
        verify(assignmentRepository).findByStudentUserUsername("testuser");
    }

    @Test
    void uploadAssignment_ShouldSaveAssignment() throws IOException {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "test.pdf",
            "application/pdf",
            "test content".getBytes()
        );
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(assignmentRepository.save(any(Assignment.class))).thenReturn(testAssignment);

        // Act
        Assignment result = studentAssignmentService.uploadAssignment(file, "Test Assignment", "Test Description");

        // Assert
        assertNotNull(result);
        assertEquals("Test Assignment", result.getTitle());
        assertEquals("Test Description", result.getDescription());
        verify(assignmentRepository).save(any(Assignment.class));
    }

    @Test
    void uploadAssignment_WithInvalidFileName_ShouldThrowException() {
        // Arrange
        MockMultipartFile file = new MockMultipartFile(
            "file",
            "../test.pdf",
            "application/pdf",
            "test content".getBytes()
        );

        // Act & Assert
        assertThrows(FileUploadException.class, () -> {
            studentAssignmentService.uploadAssignment(file, "Test Assignment", "Test Description");
        });
    }

    @Test
    void downloadAssignment_WithValidId_ShouldReturnAssignment() throws IOException {
        // Arrange
        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(testAssignment));

        // Act & Assert
        ResponseEntity<byte[]> response = studentAssignmentService.downloadAssignment(1L);

        // Assert
        assertNotNull(response);
        assertEquals("attachment", response.getHeaders().getContentDisposition().getType());
        assertEquals("test.pdf", response.getHeaders().getContentDisposition().getFilename());
        assertArrayEquals("test content".getBytes(), response.getBody());
    }

    @Test
    void downloadAssignment_WithInvalidId_ShouldThrowException() {
        // Arrange
        when(assignmentRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(AssignmentNotFoundException.class, () -> {
            studentAssignmentService.downloadAssignment(1L);
        });
    }

    @Test
    void downloadAssignment_WithUnauthorizedAccess_ShouldThrowException() {
        // Arrange
        when(assignmentRepository.findById(1L)).thenReturn(Optional.of(testAssignment));
        when(authentication.getName()).thenReturn("differentuser");

        // Act & Assert
        assertThrows(UnauthorizedAccessException.class, () -> {
            studentAssignmentService.downloadAssignment(1L);
        });
    }
} 