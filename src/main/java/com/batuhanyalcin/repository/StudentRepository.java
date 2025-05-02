package com.batuhanyalcin.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.batuhanyalcin.model.Student;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    Optional<Student> findByUserUsername(String username);
    Optional<Student> findByUserId(Long userId);
    List<Student> findByMentorId(Long mentorId);
    
    @Query("SELECT s FROM Student s WHERE s.department = :department")
    List<Student> findByDepartment(String department);
    
    @Query("SELECT s FROM Student s WHERE s.user.firstName LIKE %:name% OR s.user.lastName LIKE %:name%")
    List<Student> findByNameContaining(String name);
    
    @Query("SELECT s FROM Student s WHERE s.studentNumber = :studentNumber")
    Optional<Student> findByStudentNumber(String studentNumber);
    
    @Query("SELECT s FROM Student s WHERE s.mentor IS NULL")
    List<Student> findStudentsWithoutMentor();
    
    @Query("SELECT s FROM Student s WHERE s.mentor.user.username = :mentorUsername")
    List<Student> findByMentorUsername(@Param("mentorUsername") String mentorUsername);
} 