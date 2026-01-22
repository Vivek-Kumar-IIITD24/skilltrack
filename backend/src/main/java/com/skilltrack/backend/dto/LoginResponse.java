package com.skilltrack.backend.dto;

public class LoginResponse {
    private String token;
    private Long userId; // ✅ Added this field

    public LoginResponse(String token, Long userId) {
        this.token = token;
        this.userId = userId;
    }

    // Getters and Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
}