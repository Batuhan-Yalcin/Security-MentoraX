package com.batuhanyalcin.jwt;

import org.springframework.security.core.userdetails.UserDetails;

import com.batuhanyalcin.model.User;

public interface JwtService {
    String generateToken(User user);
    String extractUsername(String token);
    boolean isTokenValid(String token, UserDetails userDetails);
} 