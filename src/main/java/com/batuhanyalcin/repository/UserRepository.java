package com.batuhanyalcin.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.batuhanyalcin.model.User;
import com.batuhanyalcin.model.UserRole;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByUsername(String username);
    Optional<User> findByEmail(String email);
    boolean existsByUsername(String username);
    boolean existsByEmail(String email);
    List<User> findByRole(UserRole role);
    List<User> findByFirstNameContainingOrLastNameContaining(String firstName, String lastName);
    List<User> findByStudentMentorUserUsername(String mentorUsername);
}