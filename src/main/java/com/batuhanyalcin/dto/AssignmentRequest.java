package com.batuhanyalcin.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class AssignmentRequest {
    @NotBlank(message = "Ödev başlığı boş bırakılamaz")
    @Size(min = 3, max = 100, message = "Ödev başlığı en az 3, en fazla 100 karakter olmalıdır")
    private String title;

    @NotBlank(message = "Ödev açıklaması boş bırakılamaz")
    @Size(min = 10, max = 2000, message = "Ödev açıklaması en az 10, en fazla 2000 karakter olmalıdır")
    private String description;
} 