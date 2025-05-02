package com.batuhanyalcin.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.batuhanyalcin.model.Mentor;
import com.batuhanyalcin.repository.MentorRepository;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/mentors")
@RequiredArgsConstructor
@Tag(name = "Mentorlar", description = "Mentor işlemleri")
public class MentorController {

    private final MentorRepository mentorRepository;

    @GetMapping
    @Operation(summary = "Mentorları listele", description = "Tüm mentorları listeler")
    @ApiResponse(responseCode = "200", description = "Mentorlar başarıyla listelendi")
    public ResponseEntity<List<Mentor>> getMentors() {
        return ResponseEntity.ok(mentorRepository.findAll());
    }
} 