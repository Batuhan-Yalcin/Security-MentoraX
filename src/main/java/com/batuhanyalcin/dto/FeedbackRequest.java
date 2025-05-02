package com.batuhanyalcin.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class FeedbackRequest {
    @Min(value = 0, message = "Not değeri 0'dan küçük olamaz")
    @Max(value = 100, message = "Not değeri 100'den büyük olamaz")
    private Integer grade;

    @NotBlank(message = "Geri bildirim alanı boş bırakılamaz")
    @Size(min = 10, max = 2000, message = "Geri bildirim en az 10, en fazla 2000 karakter olmalıdır")
    private String feedback;
} 