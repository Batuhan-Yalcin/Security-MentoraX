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
            
            // Kullanıcı rolünü debug amaçlı yazdır
            System.out.println("Giriş yapan kullanıcı: " + user.getUsername() + ", Rol: " + user.getRole());
                    
            String jwtToken = jwtService.generateToken(user);
            
            // JWT token içindeki rol ile kullanıcı rolünün uyumlu olduğundan emin ol
            AuthResponse response = AuthResponse.builder()
                    .token(jwtToken)
                    .username(user.getUsername())
                    .role(user.getRole())
                    .message("Giriş başarılı")
                    .build();
                    
            // Kontrol amaçlı yanıtı yazdır
            System.out.println("Login yanıtı: token=" + jwtToken.substring(0, 20) + "..., rol=" + response.getRole());
            
            return response;
        } catch (Exception e) {
            System.err.println("Login hatası: " + e.getMessage());
            e.printStackTrace();
            throw new BadCredentialsException("Kullanıcı adı veya şifre hatalı");
        }
    }
}