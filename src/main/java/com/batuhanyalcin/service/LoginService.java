package com.batuhanyalcin.service;

import com.batuhanyalcin.dto.AuthResponse;
import com.batuhanyalcin.dto.LoginRequest;

public interface LoginService {
    AuthResponse login(LoginRequest request);
} 