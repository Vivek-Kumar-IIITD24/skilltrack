package com.skilltrack.backend.controller;

import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.skilltrack.backend.dto.LoginRequest;
import com.skilltrack.backend.dto.LoginResponse;
import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.repository.UserRepository;
import com.skilltrack.backend.security.JwtService;

@RestController
@RequestMapping("/auth") // ✅ FIXED: Removed "/api" to match your Frontend
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;

    public AuthController(AuthenticationManager authenticationManager, JwtService jwtService, UserRepository userRepository) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {
        // 1. Authenticate
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        if (authentication.isAuthenticated()) {
            // 2. Get User
            User user = userRepository.findByEmail(request.getEmail())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            // 3. Generate Token
            String token = jwtService.generateToken(user.getEmail(), user.getRole());
            
            // 4. Return Response
            return new LoginResponse(token, user.getId(), user.getRole());
        } else {
            throw new RuntimeException("Invalid Login Credentials");
        }
    }
}