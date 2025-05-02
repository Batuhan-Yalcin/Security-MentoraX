package com.batuhanyalcin.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class AssignmentResponse {
    private Long id;
    private String title;
    private String description;
    private String filePath;
    private Integer grade;
    private String feedback;
    private LocalDateTime submissionDate;
    private LocalDateTime feedbackDate;
    private String studentName;
    private String mentorName;
} 