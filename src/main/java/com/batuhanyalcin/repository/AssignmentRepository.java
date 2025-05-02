package com.batuhanyalcin.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.batuhanyalcin.model.Assignment;

@Repository
public interface AssignmentRepository extends JpaRepository<Assignment, Long> {
    List<Assignment> findByStudentUserUsername(String username);
    List<Assignment> findByStudentId(Long studentId);
    List<Assignment> findByStudentMentorId(Long mentorId);
    
    @Query("SELECT a FROM Assignment a WHERE a.student.id = :studentId AND a.submissionDate BETWEEN :startDate AND :endDate")
    List<Assignment> findByStudentIdAndSubmissionDateBetween(Long studentId, LocalDateTime startDate, LocalDateTime endDate);
    
    @Query("SELECT a FROM Assignment a WHERE a.student.mentor.id = :mentorId AND a.feedback IS NULL")
    List<Assignment> findUnreviewedAssignmentsByMentorId(Long mentorId);
    
    @Query("SELECT a FROM Assignment a WHERE a.student.id = :studentId AND a.grade IS NOT NULL ORDER BY a.submissionDate DESC")
    List<Assignment> findGradedAssignmentsByStudentId(Long studentId);
    
    @Query("SELECT AVG(a.grade) FROM Assignment a WHERE a.student.id = :studentId AND a.grade IS NOT NULL")
    Double findAverageGradeByStudentId(Long studentId);
}