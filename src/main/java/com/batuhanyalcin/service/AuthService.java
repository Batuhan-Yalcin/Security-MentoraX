package com.batuhanyalcin.service;

import com.batuhanyalcin.dto.AuthResponse;
import com.batuhanyalcin.dto.LoginRequest;
import com.batuhanyalcin.dto.RegisterRequest;

public interface AuthService {
    AuthResponse register(RegisterRequest request);

	AuthResponse login(LoginRequest request);
} 