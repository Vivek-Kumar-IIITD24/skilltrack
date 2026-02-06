package com.skilltrack.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String token;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    private LocalDateTime expiryDate;

    // ✅ Empty Constructor (Required by Database)
    public PasswordResetToken() {}

    // ✅ Main Constructor (Used by AuthController)
    public PasswordResetToken(String token, User user) {
        this.token = token;
        this.user = user;
        this.expiryDate = LocalDateTime.now().plusMinutes(15); // Expires in 15 mins
    }

    // ==========================================
    // 👇 MANUAL GETTERS & SETTERS (Fixes your Errors)
    // ==========================================

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    // ✅ This fixes "cannot find method getUser()"
    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    // ✅ This fixes "cannot find method getExpiryDate()"
    public LocalDateTime getExpiryDate() { return expiryDate; }
    public void setExpiryDate(LocalDateTime expiryDate) { this.expiryDate = expiryDate; }
}