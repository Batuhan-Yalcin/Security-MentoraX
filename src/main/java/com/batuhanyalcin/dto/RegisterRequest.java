package com.batuhanyalcin.dto;

import com.batuhanyalcin.model.UserRole;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank(message = "Kullanıcı adı alanı boş bırakılamaz")
    @Size(min = 3, max = 20, message = "Kullanıcı adı en az 3, en fazla 20 karakter olmalıdır")
    private String username;

    @NotBlank(message = "Şifre alanı boş bırakılamaz")
    @Size(min = 6, message = "Şifre en az 6 karakter olmalıdır")
    private String password;

    @NotBlank(message = "E-posta adresi boş bırakılamaz")
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String email;

    @NotBlank(message = "Ad alanı boş bırakılamaz")
    @Size(min = 2, max = 50, message = "Ad en az 2, en fazla 50 karakter olmalıdır")
    private String firstName;

    @NotBlank(message = "Soyad alanı boş bırakılamaz")
    @Size(min = 2, max = 50, message = "Soyad en az 2, en fazla 50 karakter olmalıdır")
    private String lastName;

    @NotNull(message = "Kullanıcı rolü seçilmelidir")
    private UserRole role;

    // Öğrenci için zorunlu alanlar
    @Size(min = 2, max = 100, message = "Bölüm adı en az 2, en fazla 100 karakter olmalıdır")
    private String department;

    @Size(min = 5, max = 20, message = "Öğrenci numarası en az 5, en fazla 20 karakter olmalıdır")
    private String studentNumber;

    // Mentor için zorunlu alanlar
    @Size(min = 10, max = 1000, message = "Biyografi en az 10, en fazla 1000 karakter olmalıdır")
    private String bio;

    @Size(min = 2, max = 100, message = "Uzmanlık alanı en az 2, en fazla 100 karakter olmalıdır")
    private String expertise;
}