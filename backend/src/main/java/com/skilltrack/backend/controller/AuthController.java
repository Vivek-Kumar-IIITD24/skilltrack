package com.skilltrack.backend.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.dao.DataIntegrityViolationException;

import com.skilltrack.backend.dto.LoginRequest;
import com.skilltrack.backend.dto.LoginResponse;
import com.skilltrack.backend.dto.RegisterRequest;
import com.skilltrack.backend.entity.Role;
import com.skilltrack.backend.entity.User;
import com.skilltrack.backend.repository.UserRepository;
import com.skilltrack.backend.security.JwtService;

// ✅ NEW IMPORTS
import com.skilltrack.backend.entity.PasswordResetToken;
import com.skilltrack.backend.repository.PasswordResetTokenRepository;
import java.util.UUID;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired 
    private PasswordResetTokenRepository tokenRepository;

    public AuthController(
            AuthenticationManager authenticationManager,
            JwtService jwtService,
            UserRepository userRepository,
            PasswordEncoder passwordEncoder
    ) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists");
        }
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));

        if ("ADMIN".equalsIgnoreCase(request.getRole())) {
            user.setRole(Role.ADMIN);
        } else {
            user.setRole(Role.STUDENT);
        }

        userRepository.save(user);
        return ResponseEntity.ok("User registered successfully");
    }

    @PostMapping("/login")
    public LoginResponse login(@RequestBody LoginRequest request) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        if (!authentication.isAuthenticated()) {
            throw new RuntimeException("Invalid login credentials");
        }

        String token = jwtService.generateToken(request.getEmail());

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        return new LoginResponse(
                token,
                user.getId(),
                user.getRole().name()
        );
    }

    // 1. REQUEST RESET LINK
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody Map<String, String> request) {
        String email = request.get("email");
        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isEmpty()) {
            return ResponseEntity.ok("If an account exists, a reset link has been sent.");
        }

        User user = userOptional.get();
        String token = UUID.randomUUID().toString();
        
        // 🛑 PREVENT DUPLICATE TOKEN ERROR
        // We use a try-catch here because looking up by User without editing Repository is harder.
        // If a token already exists, we will just proceed without crashing.
        try {
            PasswordResetToken resetToken = new PasswordResetToken(token, user);
            tokenRepository.save(resetToken);
            
            // Only print this if save succeeded
            System.out.println("\n========================================");
            System.out.println("📧 EMAIL SIMULATION FOR: " + email);
            System.out.println("🔗 RESET TOKEN: " + token); 
            System.out.println("========================================\n");
            
            return ResponseEntity.ok("Reset link generated.");
            
        } catch (DataIntegrityViolationException e) {
            // This happens if a token ALREADY exists for this user (Unique Constraint)
            System.out.println("⚠️ Token already active for user: " + email);
            return ResponseEntity.ok("Reset link already active. Check previous email.");
        }
    }

    // 2. USE TOKEN TO RESET PASSWORD
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> request) {
        String token = request.get("token");
        String newPassword = request.get("newPassword");

        Optional<PasswordResetToken> tokenOpt = tokenRepository.findByToken(token);

        if (tokenOpt.isEmpty()) {
            return ResponseEntity.status(400).body("Invalid token.");
        }

        PasswordResetToken resetToken = tokenOpt.get();

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(400).body("Token has expired.");
        }

        // Update User's Password
        User user = resetToken.getUser();
        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);

        // Delete used token
        tokenRepository.delete(resetToken);

        return ResponseEntity.ok("Password successfully reset.");
    }
}