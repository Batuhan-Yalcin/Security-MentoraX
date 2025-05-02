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
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.batuhanyalcin.exception.UserNotFoundException;
import com.batuhanyalcin.model.Mentor;
import com.batuhanyalcin.model.Student;
import com.batuhanyalcin.model.User;
import com.batuhanyalcin.model.UserRole;
import com.batuhanyalcin.repository.MentorRepository;
import com.batuhanyalcin.repository.StudentRepository;
import com.batuhanyalcin.repository.UserRepository;
import com.batuhanyalcin.service.impl.AdminServiceImpl;

@ExtendWith(MockitoExtension.class)
public class AdminServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private MentorRepository mentorRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AdminServiceImpl adminService;

    private User testAdmin;
    private User testMentor;
    private User testStudent;
    private Mentor mentor;
    private Student student;

    @BeforeEach
    void setUp() {
        testAdmin = new User();
        testAdmin.setId(1L);
        testAdmin.setUsername("admin");
        testAdmin.setRole(UserRole.ADMIN);

        testMentor = new User();
        testMentor.setId(2L);
        testMentor.setUsername("mentor");
        testMentor.setRole(UserRole.MENTOR);

        testStudent = new User();
        testStudent.setId(3L);
        testStudent.setUsername("student");
        testStudent.setRole(UserRole.STUDENT);

        mentor = new Mentor();
        mentor.setId(1L);
        mentor.setUser(testMentor);

        student = new Student();
        student.setId(1L);
        student.setUser(testStudent);
    }

    @Test
    void getAllUsers_ShouldReturnAllUsers() {
        // Arrange
        List<User> expectedUsers = Arrays.asList(testAdmin, testMentor, testStudent);
        when(userRepository.findAll()).thenReturn(expectedUsers);

        // Act
        List<User> actualUsers = adminService.getAllUsers();

        // Assert
        assertEquals(expectedUsers, actualUsers);
        verify(userRepository).findAll();
    }

    @Test
    void getUserById_ShouldReturnUser() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.of(testAdmin));

        // Act
        User result = adminService.getUserById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("admin", result.getUsername());
        assertEquals(UserRole.ADMIN, result.getRole());
    }

    @Test
    void getUserById_WithInvalidId_ShouldThrowException() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> {
            adminService.getUserById(1L);
        });
    }

    @Test
    void updateUser_ShouldUpdateUser() {
        // Arrange
        User updatedUser = new User();
        updatedUser.setUsername("updated");
        updatedUser.setFirstName("Updated");
        updatedUser.setLastName("User");
        updatedUser.setEmail("updated@example.com");
        updatedUser.setRole(UserRole.STUDENT);

        when(userRepository.findById(2L)).thenReturn(Optional.of(testMentor));
        when(userRepository.save(any(User.class))).thenReturn(updatedUser);

        // Act
        User result = adminService.updateUser(2L, updatedUser);

        // Assert
        assertNotNull(result);
        assertEquals("updated", result.getUsername());
        assertEquals("Updated", result.getFirstName());
        assertEquals("User", result.getLastName());
        assertEquals("updated@example.com", result.getEmail());
        assertEquals(UserRole.STUDENT, result.getRole());
        verify(userRepository).save(any(User.class));
    }

    @Test
    void updateUser_WithInvalidId_ShouldThrowException() {
        // Arrange
        when(userRepository.findById(1L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> {
            adminService.updateUser(1L, new User());
        });
    }

    @Test
    void deleteUser_ShouldDeleteUser() {
        // Arrange
        when(userRepository.existsById(1L)).thenReturn(true);
        doNothing().when(userRepository).deleteById(1L);

        // Act
        adminService.deleteUser(1L);

        // Assert
        verify(userRepository).deleteById(1L);
    }

    @Test
    void deleteUser_WithInvalidId_ShouldThrowException() {
        // Arrange
        when(userRepository.existsById(1L)).thenReturn(false);

        // Act & Assert
        assertThrows(UserNotFoundException.class, () -> {
            adminService.deleteUser(1L);
        });
    }
} 