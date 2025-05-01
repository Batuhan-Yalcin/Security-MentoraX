package com.batuhanyalcin.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class MentorResponse {
    @NotNull(message = "Mentor ID'si boş olamaz")
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

    @NotBlank(message = "Biyografi alanı boş olamaz")
    @Size(min = 10, max = 1000, message = "Biyografi en az 10, en fazla 1000 karakter olmalıdır")
    private String bio;

    @NotBlank(message = "Uzmanlık alanı boş olamaz")
    @Size(min = 2, max = 100, message = "Uzmanlık alanı en az 2, en fazla 100 karakter olmalıdır")
    private String expertise;

    private int totalStudents;
    private int totalAssignmentsToReview;
    private int completedReviews;
    private double averageReviewTime; // saat cinsinden
} 