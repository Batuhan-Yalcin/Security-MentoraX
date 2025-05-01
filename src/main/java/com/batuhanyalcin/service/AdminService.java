package com.batuhanyalcin.service;

import java.util.List;

import com.batuhanyalcin.model.User;

public interface AdminService {
    List<User> getAllUsers();
    User getUserById(Long id);
    User createUser(User user);
    User updateUser(Long id, User user);
    void deleteUser(Long id);
} 