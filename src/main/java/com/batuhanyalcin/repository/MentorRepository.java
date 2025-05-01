package com.batuhanyalcin.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.batuhanyalcin.model.Mentor;

@Repository
public interface MentorRepository extends JpaRepository<Mentor, Long> {
    Optional<Mentor> findByUserUsername(String username);
    Optional<Mentor> findByUserId(Long userId);
    
    @Query("SELECT m FROM Mentor m WHERE m.expertise LIKE %:expertise%")
    List<Mentor> findByExpertiseContaining(String expertise);
    
    @Query("SELECT m FROM Mentor m WHERE SIZE(m.students) < :maxStudents")
    List<Mentor> findAvailableMentors(int maxStudents);
    
    @Query("SELECT m FROM Mentor m WHERE m.user.firstName LIKE %:name% OR m.user.lastName LIKE %:name%")
    List<Mentor> findByNameContaining(String name);
} 