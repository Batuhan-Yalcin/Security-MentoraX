package com.batuhanyalcin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class LoginRequest {
    @NotBlank(message = "Kullanıcı adı alanı boş bırakılamaz")
    @Size(min = 3, max = 20, message = "Kullanıcı adı en az 3, en fazla 20 karakter olmalıdır")
    private String username;

    @NotBlank(message = "Şifre alanı boş bırakılamaz")
    @Size(min = 6, message = "Şifre en az 6 karakter olmalıdır")
    private String password;
} 