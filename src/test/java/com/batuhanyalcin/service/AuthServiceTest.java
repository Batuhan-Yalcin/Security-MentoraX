package com.batuhanyalcin.service;

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
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.batuhanyalcin.dto.AuthResponse;
import com.batuhanyalcin.dto.LoginRequest;
import com.batuhanyalcin.dto.RegisterRequest;
import com.batuhanyalcin.jwt.JwtService;
import com.batuhanyalcin.model.Mentor;
import com.batuhanyalcin.model.Student;
import com.batuhanyalcin.model.User;
import com.batuhanyalcin.model.UserRole;
import com.batuhanyalcin.repository.MentorRepository;
import com.batuhanyalcin.repository.StudentRepository;
import com.batuhanyalcin.repository.UserRepository;
import com.batuhanyalcin.service.impl.AuthServiceImpl;

@ExtendWith(MockitoExtension.class)
public class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentRepository studentRepository;

    @Mock
    private MentorRepository mentorRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AuthServiceImpl authService;

    private RegisterRequest registerRequest;
    private LoginRequest loginRequest;
    private User testUser;
    private Student testStudent;
    private Mentor testMentor;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setPassword("password");
        registerRequest.setEmail("test@example.com");
        registerRequest.setFirstName("Test");
        registerRequest.setLastName("User");
        registerRequest.setRole(UserRole.STUDENT);
        registerRequest.setDepartment("Computer Science");
        registerRequest.setStudentNumber("12345");

        loginRequest = new LoginRequest();
        loginRequest.setUsername("testuser");
        loginRequest.setPassword("password");

        testUser = new User();
        testUser.setId(1L);
        testUser.setUsername("testuser");
        testUser.setPassword("encodedPassword");
        testUser.setEmail("test@example.com");
        testUser.setFirstName("Test");
        testUser.setLastName("User");
        testUser.setRole(UserRole.STUDENT);

        testStudent = new Student();
        testStudent.setId(1L);
        testStudent.setUser(testUser);
        testStudent.setDepartment("Computer Science");
        testStudent.setStudentNumber("12345");

        testMentor = new Mentor();
        testMentor.setId(1L);
        testMentor.setUser(testUser);
        testMentor.setBio("Test Bio");
        testMentor.setExpertise("Test Expertise");
    }

    @Test
    void register_ShouldCreateNewUser() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(studentRepository.save(any(Student.class))).thenReturn(testStudent);
        when(jwtService.generateToken(any(User.class))).thenReturn("testToken");

        // Act
        AuthResponse result = authService.register(registerRequest);

        // Assert
        assertNotNull(result);
        assertEquals("testToken", result.getToken());
        verify(userRepository).save(any(User.class));
        verify(studentRepository).save(any(Student.class));
    }

    @Test
    void register_WithExistingUsername_ShouldThrowException() {
        // Arrange
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            authService.register(registerRequest);
        });
    }

    @Test
    void register_AsMentor_ShouldCreateMentor() {
        // Arrange
        registerRequest.setRole(UserRole.MENTOR);
        registerRequest.setBio("Test Bio");
        registerRequest.setExpertise("Test Expertise");

        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(mentorRepository.save(any(Mentor.class))).thenReturn(testMentor);
        when(jwtService.generateToken(any(User.class))).thenReturn("testToken");

        // Act
        AuthResponse result = authService.register(registerRequest);

        // Assert
        assertNotNull(result);
        assertEquals("testToken", result.getToken());
        verify(userRepository).save(any(User.class));
        verify(mentorRepository).save(any(Mentor.class));
    }

    @Test
    void login_ShouldReturnAuthResponse() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(jwtService.generateToken(any(User.class))).thenReturn("testToken");

        // Act
        AuthResponse result = authService.login(loginRequest);

        // Assert
        assertNotNull(result);
        assertEquals("testToken", result.getToken());
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void login_WithInvalidCredentials_ShouldThrowException() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenThrow(new RuntimeException("Invalid credentials"));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            authService.login(loginRequest);
        });
    }

    @Test
    void login_WithNonExistentUser_ShouldThrowException() {
        // Arrange
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(authentication);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> {
            authService.login(loginRequest);
        });
    }
} 