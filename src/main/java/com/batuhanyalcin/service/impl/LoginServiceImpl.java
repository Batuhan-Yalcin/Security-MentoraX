package com.batuhanyalcin.service.impl;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;

import com.batuhanyalcin.dto.AuthResponse;
import com.batuhanyalcin.dto.LoginRequest;
import com.batuhanyalcin.exception.UserNotFoundException;
import com.batuhanyalcin.jwt.JwtService;
import com.batuhanyalcin.model.User;
import com.batuhanyalcin.repository.UserRepository;
import com.batuhanyalcin.service.LoginService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class LoginServiceImpl implements LoginService {

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @Override
    public AuthResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getUsername(),
                            request.getPassword()
                    )
            );
            
            User user = userRepository.findByUsername(request.getUsername())
                    .orElseThrow(() -> new UserNotFoundException("Kullanıcı bulunamadı"));
                    
            String jwtToken = jwtService.generateToken(user);
            return AuthResponse.builder()
                    .token(jwtToken)
                    .username(user.getUsername())
                    .role(user.getRole())
                    .message("Giriş başarılı")
                    .build();
        } catch (Exception e) {
            throw new BadCredentialsException("Kullanıcı adı veya şifre hatalı");
        }
    }
}