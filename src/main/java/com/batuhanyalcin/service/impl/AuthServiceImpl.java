package com.batuhanyalcin.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.batuhanyalcin.dto.AuthResponse;
import com.batuhanyalcin.dto.LoginRequest;
import com.batuhanyalcin.dto.RegisterRequest;
import com.batuhanyalcin.exception.UserAlreadyExistsException;
import com.batuhanyalcin.exception.UserNotFoundException;
import com.batuhanyalcin.jwt.JwtService;
import com.batuhanyalcin.model.Mentor;
import com.batuhanyalcin.model.Student;
import com.batuhanyalcin.model.User;
import com.batuhanyalcin.repository.MentorRepository;
import com.batuhanyalcin.repository.StudentRepository;
import com.batuhanyalcin.repository.UserRepository;
import com.batuhanyalcin.service.AuthService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final StudentRepository studentRepository;
    private final MentorRepository mentorRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new UserAlreadyExistsException("Bu kullanıcı adı zaten kullanılıyor");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new UserAlreadyExistsException("Bu e-posta adresi zaten kullanılıyor");
        }

        String encodedPassword = passwordEncoder.encode(request.getPassword());
        
        var user = User.builder()
                .username(request.getUsername())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(encodedPassword)
                .role(request.getRole())
                .build();
        
        user = userRepository.save(user);

        // Role'e göre ilgili entity'yi oluştur
        switch (request.getRole()) {
            case STUDENT:
                var student = new Student();
                student.setUser(user);
                student.setDepartment(request.getDepartment());
                student.setStudentNumber(request.getStudentNumber());
                studentRepository.save(student);
                break;
            case MENTOR:
                var mentor = new Mentor();
                mentor.setUser(user);
                mentor.setBio(request.getBio());
                mentor.setExpertise(request.getExpertise());
                mentorRepository.save(mentor);
                break;
            default:
                break;
        }

        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        var user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new UserNotFoundException("Kullanıcı bulunamadı"));
        var jwtToken = jwtService.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .build();
    }
}