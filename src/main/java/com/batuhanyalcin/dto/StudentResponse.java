package com.batuhanyalcin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class StudentResponse {
    @NotNull(message = "Öğrenci ID'si boş olamaz")
    private Long id;

    @NotBlank(message = "Kullanıcı adı alanı boş olamaz")
    @Size(min = 3, max = 20, message = "Kullanıcı adı en az 3, en fazla 20 karakter olmalıdır")
    private String username;

    @NotBlank(message = "E-posta adresi boş olamaz")
    @Email(message = "Geçerli bir e-posta adresi giriniz")
    private String email;

    @NotBlank(message = "Ad alanı boş olamaz")
    @Size(min = 2, max = 50, message = "Ad en az 2, en fazla 50 karakter olmalıdır")
    private String firstName;

    @NotBlank(message = "Soyad alanı boş olamaz")
    @Size(min = 2, max = 50, message = "Soyad en az 2, en fazla 50 karakter olmalıdır")
    private String lastName;

    @NotBlank(message = "Bölüm alanı boş olamaz")
    @Size(min = 2, max = 100, message = "Bölüm adı en az 2, en fazla 100 karakter olmalıdır")
    private String department;

    @NotBlank(message = "Öğrenci numarası boş olamaz")
    @Size(min = 5, max = 20, message = "Öğrenci numarası en az 5, en fazla 20 karakter olmalıdır")
    private String studentNumber;

    private String mentorName;
    private int totalAssignments;
    private int completedAssignments;
    private double averageGrade;
} 