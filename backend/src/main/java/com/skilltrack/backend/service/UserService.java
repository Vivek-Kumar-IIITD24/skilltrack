package com.skilltrack.backend.service;

import com.skilltrack.backend.entity.User;
import java.util.List;
import java.util.Optional;

public interface UserService {

    User registerUser(User user);

    Optional<User> findByEmail(String email);

    List<User> getAllUsers();

    // ✅ CRITICAL: add delete user method
    void deleteUser(Long userId);
}
