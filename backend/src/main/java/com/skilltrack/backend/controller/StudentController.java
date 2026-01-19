package com.skilltrack.backend.controller;

import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.repository.UserRepository;

@RestController
@RequestMapping("/api/student")
public class StudentController {

    private final UserRepository userRepository;

    public StudentController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // ✅ STUDENT ONLY
    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/profile")
    public User getMyProfile(Authentication authentication) {

        String email = authentication.getName(); // comes from JWT

        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}
